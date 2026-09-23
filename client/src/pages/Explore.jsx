import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DagupanMap from '../components/Map/DagupanMap';
import CompareDrawer from '../components/CompareDrawer';
import ReviewModal from '../components/Reviews/ReviewModal';
import DormDetailsModal from '../components/DormDetailsModal';
import StudentBookmarksDrawer from '../components/StudentBookmarksDrawer';
import { DAGUPAN_CAMPUSES } from '../constants/landmarks';
import { 
  Sparkles, 
  Navigation, 
  Star, 
  Map, 
  ListFilter, 
  MessageSquarePlus, 
  Eye, 
  Bookmark,
  Check,
  Building,
  RotateCcw
} from 'lucide-react';

export default function Explore({ initialCampusId }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  
  // Auto-select campus if passed from LandingPage, else default to first
  const [selectedCampus, setSelectedCampus] = useState(() => {
    if (initialCampusId) {
      const match = DAGUPAN_CAMPUSES.find(
        (c) => c.id.toLowerCase() === initialCampusId.toLowerCase()
      );
      if (match) return match;
    }
    return DAGUPAN_CAMPUSES[0];
  });

  const [maxDistance, setMaxDistance] = useState(1500); // 1.5 km
  const [maxBudget, setMaxBudget] = useState(5000);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mobile Viewport Tab: 'list' | 'map'
  const [mobileTab, setMobileTab] = useState('list');

  // TOPSIS Compare Drawer State
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Student Bookmarks Drawer State
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [savedHouses, setSavedHouses] = useState([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Student Review Dialog State
  const [reviewTargetHouse, setReviewTargetHouse] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Dorm Details & Contact Modal State
  const [detailsTargetHouse, setDetailsTargetHouse] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchNearbyBoardingHouses();
  }, [selectedCampus, maxDistance, maxBudget]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarkedIds([]);
      setSavedHouses([]);
    }
  }, [user]);

  const fetchNearbyBoardingHouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/boarding-houses', {
        params: {
          campus: selectedCampus.id || 'UPANG',
          maxDistance,
          maxPrice: maxBudget,
        },
      });
      setListings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/users/bookmarks');
      const items = res.data.data || [];
      setSavedHouses(items);
      setBookmarkedIds(items.map((h) => h._id));
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  };

  const handleToggleBookmark = async (house, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save your favorite boarding houses.');
      return;
    }

    try {
      const res = await api.put(`/users/bookmarks/${house._id}`);
      const isNowBookmarked = res.data.isBookmarked;

      if (isNowBookmarked) {
        setBookmarkedIds((prev) => [...prev, house._id]);
        setSavedHouses((prev) => [...prev, house]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== house._id));
        setSavedHouses((prev) => prev.filter((h) => h._id !== house._id));
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const toggleCompare = (house, e) => {
    e.stopPropagation();
    if (compareList.some((h) => h._id === house._id)) {
      setCompareList(compareList.filter((h) => h._id !== house._id));
    } else {
      if (compareList.length >= 4) {
        alert('You can compare a maximum of 4 boarding houses.');
        return;
      }
      setCompareList([...compareList, house]);
    }
  };

  const handleOpenReview = (house, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in as a student to leave a review.');
      return;
    }
    setReviewTargetHouse(house);
    setIsReviewOpen(true);
  };

  const handleOpenDetails = (house, e) => {
    if (e) e.stopPropagation();
    setDetailsTargetHouse(house);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Mobile Floating View Switcher (< md screens only) */}
      <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[998] flex items-center bg-slate-900/95 text-white rounded-full p-1.5 shadow-2xl backdrop-blur-md border border-slate-700/50">
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            mobileTab === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          List & Filters
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            mobileTab === 'map' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          Map View
        </button>
      </div>

      {/* Left Sidebar: Discovery & Filtering Panel */}
      <div
        className={`w-full md:w-1/3 md:min-w-[380px] md:max-w-[430px] h-full flex flex-col border-r border-slate-200 bg-white text-slate-900 z-10 shadow-sm ${
          mobileTab === 'list' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Header & Controls Section */}
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                F
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  FABH Explorer
                </h1>
                <span className="text-[10px] text-slate-400 font-medium">Dagupan Accommodation</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Saved Bookmarks Button */}
              {user && (
                <button
                  type="button"
                  onClick={() => setIsBookmarksOpen(true)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                    bookmarkedIds.length > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="View Saved Boarding Houses"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      bookmarkedIds.length > 0 ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{bookmarkedIds.length}</span>
                </button>
              )}

              {/* Compare with AI Button */}
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="bg-emerald-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {compareList.length}/4
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Campus Anchor Selector */}
          <div className="mt-3.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Target Campus Anchor
            </label>
            <div className="relative">
              <select
                className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2 px-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition cursor-pointer appearance-none"
                value={selectedCampus.id}
                onChange={(e) => {
                  const found = DAGUPAN_CAMPUSES.find((c) => c.id === e.target.value);
                  if (found) setSelectedCampus(found);
                }}
              >
                {DAGUPAN_CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="mt-3.5 grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Max Walk</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {(maxDistance / 1000).toFixed(1)} km
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Max Rent</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  ₱{maxBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="10000"
                step="250"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Listing Cards Feed */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 pb-24 md:pb-4 bg-slate-100/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Scanning Dagupan listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto mb-2">
                <Building className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No boarding houses found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try expanding your maximum walking radius or rent budget.</p>
            </div>
          ) : (
            listings.map((house) => {
              const displayTitle = house.title || house.name;
              const displayAddress =
                typeof house.address === 'object' && house.address !== null
                  ? `${house.address.street || ''}, ${house.address.barangay || ''}`
                  : house.address;

              const distanceMeters = house.distanceToCampusInMeters ?? house.distance;
              const currentRating = house.averageRating ?? house.rating;
              const isBookmarked = bookmarkedIds.includes(house._id);
              const isCompared = compareList.some((h) => h._id === house._id);

              return (
                <div
                  key={house._id}
                  onClick={() => {
                    setSelectedListing(house);
                    if (window.innerWidth < 768) setMobileTab('map');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                    selectedListing?._id === house._id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {/* Compare Toggle Pill */}
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(house, e)}
                        title={isCompared ? 'Remove from compare' : 'Add to TOPSIS compare'}
                        className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center transition border shrink-0 cursor-pointer ${
                          isCompared
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-emerald-500 bg-white'
                        }`}
                      >
                        {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-xs truncate leading-snug">
                          {displayTitle}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {distanceMeters !== undefined
                              ? `${Math.round(distanceMeters)}m from ${selectedCampus.name.split(' ')[0]}`
                              : displayAddress}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price and Bookmark Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        ₱{house.monthlyRent?.toLocaleString()}/mo
                      </span>

                      {user && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(house, e)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            isBookmarked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isBookmarked ? 'Remove saved dorm' : 'Save to bookmarks'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isBookmarked ? 'fill-emerald-600 text-emerald-600' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="font-bold">
                        {currentRating ? Number(currentRating).toFixed(1) : 'New'}
                      </span>
                      {house.numReviews !== undefined && (
                        <span className="text-slate-400 text-[10px]">
                          ({house.numReviews})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDetails(house, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenReview(house, e)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div
        className={`flex-1 h-full p-2 md:p-3 bg-slate-100 relative ${
          mobileTab === 'map' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <DagupanMap
          listings={listings}
          selectedCampus={selectedCampus}
          selectedListing={selectedListing}
          onSelectListing={(item) => setSelectedListing(item)}
          onOpenDetails={(item) => handleOpenDetails(item)}
        />
      </div>

      {/* Slide-out Student Saved Bookmarks Drawer */}
      <StudentBookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedHouses={savedHouses}
        onRemoveBookmark={(houseId) => {
          const mockEvent = { stopPropagation: () => {} };
          handleToggleBookmark({ _id: houseId }, mockEvent);
        }}
        onViewDetails={(house) => {
          setIsBookmarksOpen(false);
          handleOpenDetails(house);
        }}
      />

      {/* Slide-out TOPSIS Compare Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        selectedHouses={compareList}
      />

      {/* Student Review Dialog */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        house={reviewTargetHouse}
        onReviewSubmitted={() => fetchNearbyBoardingHouses()}
      />

      {/* Dorm Details & Landlord Contact Modal */}
      <DormDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        house={detailsTargetHouse}
        selectedCampus={selectedCampus}
      />
    </div>
  );
}