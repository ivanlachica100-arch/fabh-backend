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
  Building 
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

  // Default directly to 'map' so clicking "Launch Interactive Map" renders instantly on mobile
  const [mobileTab, setMobileTab] = useState('map');

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
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Mobile Floating View Switcher (< md screens only) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center bg-slate-900 text-white rounded-full p-1.5 shadow-2xl border border-slate-700">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mobileTab === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          Map View
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mobileTab === 'list' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          List & Filters
        </button>
      </div>

      {/* Left Sidebar: Discovery & Filtering Panel */}
      <div
        className={`w-full md:w-1/3 md:min-w-[380px] md:max-w-[430px] h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 z-10 shadow-sm transition-colors duration-200 ${
          mobileTab === 'list' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Header & Controls Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                F
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  FABH Explorer
                </h1>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Dagupan Accommodation</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {user && (
                <button
                  type="button"
                  onClick={() => setIsBookmarksOpen(true)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                    bookmarkedIds.length > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="View Saved Boarding Houses"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      bookmarkedIds.length > 0 ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{bookmarkedIds.length}</span>
                </button>
              )}

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
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Target Campus Anchor
            </label>
            <select
              className="w-full text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Sliders Grid */}
          <div className="mt-3.5 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Max Walk</span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
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
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Max Rent</span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
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
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Listing Cards Feed */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 pb-28 md:pb-4 bg-slate-100/50 dark:bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Scanning Dagupan listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2">
                <Building className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No boarding houses found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try expanding your walking radius or budget.</p>
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
                    setMobileTab('map');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                    selectedListing?._id === house._id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(house, e)}
                        className={`mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center transition border shrink-0 cursor-pointer ${
                          isCompared
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate leading-snug">
                          {displayTitle}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {distanceMeters !== undefined
                              ? `${Math.round(distanceMeters)}m from ${selectedCampus.name.split(' ')[0]}`
                              : displayAddress}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
                        ₱{house.monthlyRent?.toLocaleString()}/mo
                      </span>

                      {user && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(house, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
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

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="font-bold">
                        {currentRating ? Number(currentRating).toFixed(1) : 'New'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDetails(house, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenReview(house, e)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-md transition cursor-pointer"
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

      {/* Map Canvas: Explicit height style prevents mobile canvas from collapsing */}
      <div
        className={`flex-1 w-full h-[100dvh] md:h-full relative bg-slate-100 dark:bg-slate-950 ${
          mobileTab === 'map' ? 'flex' : 'hidden md:flex'
        }`}
        style={{ minHeight: '100dvh' }}
      >
        <DagupanMap
          listings={listings}
          selectedCampus={selectedCampus}
          selectedListing={selectedListing}
          onSelectListing={(item) => setSelectedListing(item)}
          onOpenDetails={(item) => handleOpenDetails(item)}
          isActiveView={mobileTab === 'map'}
        />
      </div>

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

      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        selectedHouses={compareList}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        house={reviewTargetHouse}
        onReviewSubmitted={() => fetchNearbyBoardingHouses()}
      />

      <DormDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        house={detailsTargetHouse}
        selectedCampus={selectedCampus}
      />
    </div>
  );
}