const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating between 1 and 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    boardingHouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardingHouse',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a student from submitting more than one review per boarding house
reviewSchema.index({ boardingHouse: 1, student: 1 }, { unique: true });

// Static method to calculate average rating and save it to BoardingHouse
reviewSchema.statics.getAverageRating = async function (boardingHouseId) {
  const stats = await this.aggregate([
    {
      $match: { boardingHouse: boardingHouseId },
    },
    {
      $group: {
        _id: '$boardingHouse',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('BoardingHouse').findByIdAndUpdate(boardingHouseId, {
        averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      });
    } else {
      await mongoose.model('BoardingHouse').findByIdAndUpdate(boardingHouseId, {
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

// Call getAverageRating after remove/delete
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.getAverageRating(this.boardingHouse);
});

module.exports = mongoose.model('Review', reviewSchema);