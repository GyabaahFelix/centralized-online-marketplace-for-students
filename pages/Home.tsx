
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { CATEGORIES, INITIAL_LOCATION_CACHE, LOGO_URL } from '../constants';
import { Button, Input, Card, Badge, ProductCardSkeleton } from '../components/UI';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (currentRole === 'vendor') navigate('/vendor/dashboard', { replace: true });
      else if (currentRole === 'courier') navigate('/delivery/dashboard', { replace: true });
      else navigate('/buyer/dashboard', { replace: true });
    }
  }, [currentUser, currentRole, isLoading, navigate]);

  const handleStartSelling = () => {
      if (!currentUser) {
          navigate('/register', { state: { role: 'vendor' } });
      } else if (currentUser.roles.includes('vendor')) {
          navigate('/vendor/dashboard');
      } else {
          navigate('/vendor/onboarding');
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Radiant Accents - Light Only */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/15 rounded-full filter blur-3xl opacity-60 dark:hidden animate-blob"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[700px] h-[700px] bg-accent/15 rounded-full filter blur-3xl opacity-60 dark:hidden animate-blob animation-delay-2000"></div>

      <div className="relative z-10 mb-8 animate-fade-in flex flex-col items-center">
         <div className="mb-6 transform hover:scale-105 transition-transform duration-700">
            <img 
              src={LOGO_URL} 
              alt="LYNQED" 
              className="h-28 w-28 md:h-44 md:w-44 rounded-full object-cover border-[4px] border-white dark:border-white/10 drop-shadow-2xl mx-auto bg-white dark:bg-darkSurface p-1 shadow-float" 
            />
         </div>
         <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 dark:text-white tracking-tight mb-2">LYNQED</h1>
         <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-[240px] md:max-w-xs mx-auto leading-tight md:leading-relaxed">Where Buyers and Sellers Get <span className="text-primary font-bold">LYNQED</span>.</p>
      </div>

      <div className="w-full max-w-xl grid grid-cols-2 gap-4 relative z-10 animate-slide-up px-2">
        {/* Buyer Option Card */}
        <div 
            onClick={() => navigate('/buyer/dashboard')}
            className="p-5 md:p-8 rounded-[2.5rem] bg-white dark:bg-darkSurface shadow-2xl hover:shadow-primary/30 border-2 border-primary/5 hover:border-primary/30 transition-all cursor-pointer group flex flex-col items-center text-center gap-3 h-full hover:-translate-y-2 active:scale-95"
        >
            <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <i className="fa-solid fa-bag-shopping text-xl md:text-3xl"></i>
            </div>
            <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base md:text-2xl font-display leading-tight">I want to Buy</h3>
                <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">Discover and purchase essentials across campus</p>
                <p className="md:hidden text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 leading-tight">Shop Essentials</p>
            </div>
            <div className="mt-auto w-full">
                <div className="py-2.5 md:py-3 px-2 md:px-6 rounded-xl md:rounded-2xl bg-primary text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-[0.2em] shadow-lg shadow-primary/20 group-hover:shadow-glow transition-all flex items-center justify-center gap-1.5 md:gap-2">
                    {window.innerWidth < 768 ? 'Enter' : 'Enter Marketplace'} <i className="fa-solid fa-arrow-right text-[7px] md:text-[8px]"></i>
                </div>
            </div>
        </div>

        {/* Vendor Option Card */}
        <div 
            onClick={handleStartSelling}
            className="p-5 md:p-8 rounded-[2.5rem] bg-white dark:bg-darkSurface shadow-2xl hover:shadow-accent/30 border-2 border-accent/5 hover:border-accent/30 transition-all cursor-pointer group flex flex-col items-center text-center gap-3 h-full hover:-translate-y-2 active:scale-95"
        >
            <div className="w-14 h-14 md:w-20 md:h-20 bg-accent/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                <i className="fa-solid fa-store text-xl md:text-3xl"></i>
            </div>
            <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base md:text-2xl font-display leading-tight">I want to Sell</h3>
                <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">Launch your student shop and reach nearby buyers</p>
                <p className="md:hidden text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 leading-tight">Open Shop</p>
            </div>
            <div className="mt-auto w-full">
                <div className="py-2.5 md:py-3 px-2 md:px-6 rounded-xl md:rounded-2xl bg-accent text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-[0.2em] shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all flex items-center justify-center gap-1.5 md:gap-2">
                    {window.innerWidth < 768 ? 'Sell' : 'Open Your Store'} <i className="fa-solid fa-rocket text-[7px] md:text-[8px]"></i>
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-8 md:mt-16 flex flex-col items-center gap-1.5 pb-4">
        <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">Managed by Liquid Technologies</p>
        <p className="text-[7px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">Build v1.0.4 Release</p>
      </div>
    </div>
  );
};

export const BuyerDashboard: React.FC = () => {
  const { products, vendors, favorites, toggleFavorite, currentUser, addToCart, removeFromCart, cart, isDataLoading } = useApp();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('All');
  const [sortType, setSortType] = useState<'nearby' | 'price' | 'rating'>('nearby');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
              () => setUserLocation({ lat: 5.6506, lng: -0.1962 })
          );
      }
  }, []);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; 
      const dLat = (lat2 - lat1) * (Math.PI/180);
      const dLon = (lon2 - lon1) * (Math.PI/180);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
  };

  const getCoordsForLocation = (locStr: string): {lat: number, lng: number} | null => {
      const clean = locStr.toLowerCase();
      if (INITIAL_LOCATION_CACHE[clean]) return { lat: INITIAL_LOCATION_CACHE[clean][0], lng: INITIAL_LOCATION_CACHE[clean][1] };
      const key = Object.keys(INITIAL_LOCATION_CACHE).find(k => clean.includes(k));
      if (key) return { lat: INITIAL_LOCATION_CACHE[key][0], lng: INITIAL_LOCATION_CACHE[key][1] };
      return null;
  };

  const handleStartSelling = () => {
    if (!currentUser) {
        navigate('/register', { state: { role: 'vendor' } });
    } else if (currentUser.roles.includes('vendor')) {
        navigate('/vendor/dashboard');
    } else {
        navigate('/vendor/onboarding');
    }
  };

  const categoryList = useMemo(() => [
      { id: 'cat-all', name: 'All', icon: 'layer-group', image: '' },
      ...CATEGORIES
  ], []);

  const trendingItems = useMemo(() => {
      return products.filter(p => p.isTrending && p.status === 'approved');
  }, [products]);

  const sortedProducts = useMemo(() => {
      const approvedProducts = products.filter(p => p.status === 'approved');
      let filtered = selectedCat === 'All' ? approvedProducts : approvedProducts.filter(p => p.category === selectedCat);

      if (sortType === 'price') return [...filtered].sort((a, b) => a.price - b.price);
      if (sortType === 'rating') return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (sortType === 'nearby' && userLocation) {
          return [...filtered].sort((a, b) => {
              const coordsA = getCoordsForLocation(a.location);
              const coordsB = getCoordsForLocation(b.location);
              const distA = coordsA ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, coordsA.lat, coordsA.lng) : 999;
              const distB = coordsB ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, coordsB.lat, coordsB.lng) : 999;
              return distA - distB;
          });
      }
      return filtered;
  }, [products, selectedCat, sortType, userLocation]);

  return (
    <div className="flex flex-col space-y-6 animate-fade-in pb-4 bg-transparent min-h-screen overflow-x-hidden">
      <div className="bg-white/40 dark:bg-darkSurface/60 backdrop-blur-xl pt-2 pb-3 px-4 sticky top-0 z-30 border-b border-white/50 dark:border-white/5 shadow-sm space-y-3 transition-colors duration-500">
        <div className="relative group" onClick={() => navigate('/buyer/search')}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
            <input readOnly placeholder="Search Products..." className="block w-full rounded-xl border border-white/60 dark:border-gray-700 bg-white/50 dark:bg-darkBg py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-white dark:hover:bg-darkSurface transition-all" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['nearby', 'price', 'rating'].map(type => (
                <button 
                    key={type} 
                    onClick={() => setSortType(type as any)} 
                    className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all border ${sortType === type ? 'bg-primary text-white border-primary shadow-glow' : 'bg-white/60 dark:bg-darkSurface text-gray-500 border-white/50 dark:border-gray-800'}`}
                >
                    {type === 'nearby' ? 'Nearby' : type === 'price' ? 'Low Price' : 'Top Rated'}
                </button>
            ))}
        </div>
      </div>

      <div className="pl-4">
        <h3 className="font-display font-black text-gray-900 dark:text-white text-lg mb-4 uppercase tracking-tight">Categories</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pt-2 pb-2 pr-4">
            {categoryList.map(cat => (
                <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group" onClick={() => setSelectedCat(cat.name)}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all overflow-hidden border-2 ${selectedCat === cat.name ? 'border-primary ring-4 ring-primary/10 scale-105 shadow-lg' : 'border-transparent bg-white/60 dark:bg-darkSurface text-gray-500 shadow-sm group-hover:scale-105'}`}>
                        {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <i className={`fa-solid fa-${cat.icon} text-xl`}></i>}
                    </div>
                    <span className={`text-[11px] font-black uppercase transition-colors text-center ${selectedCat === cat.name ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 shadow-2xl group transition-all duration-500 hover:shadow-primary/20 dark:via-darkSurface dark:to-darkBg dark:border dark:border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:scale-125 transition-transform duration-700 dark:hidden"></div>
            <div className="flex justify-between items-center relative z-10">
                <div className="max-w-[65%] space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-display font-black text-white leading-tight">Student Entrepreneur?</h2>
                        <p className="text-purple-200/80 text-sm font-medium leading-relaxed dark:text-gray-400">Reach thousands of students on campus today.</p>
                    </div>
                    <button onClick={handleStartSelling} className="bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg shadow-primary/20">Start Selling</button>
                </div>
                <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-500 shadow-2xl">
                        <i className="fa-solid fa-store text-4xl sm:text-5xl text-white/90"></i>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {trendingItems.length > 0 && (
          <div className="space-y-4">
              <div className="flex items-center gap-2 px-4">
                  <h3 className="font-display font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight">Trending Now</h3>
              </div>
              <div className="relative w-full overflow-hidden">
                  <div className="flex animate-scroll hover:pause-on-hover py-0.5 w-max gap-4 px-4">
                      {[...trendingItems, ...trendingItems, ...trendingItems].map((p, idx) => (
                          <div key={`${p.id}-${idx}`} onClick={() => navigate(`/buyer/product/${p.id}`)} className="w-40 flex-shrink-0 bg-white/60 dark:bg-darkSurface/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 dark:border-gray-800/50 overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-300">
                              <div className="h-32 overflow-hidden relative bg-gray-50 dark:bg-gray-900">
                                  <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                  <div className="absolute top-2 left-2">
                                      <div className="bg-primary/90 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-sm backdrop-blur-sm">Featured</div>
                                  </div>
                              </div>
                              <div className="p-3">
                                  <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate mb-1 font-display uppercase">{p.title}</p>
                                  <div className="flex justify-between items-center">
                                      <p className="text-primary font-black text-xs">₵{p.price.toFixed(0)}</p>
                                      <i className="fa-solid fa-chevron-right text-[8px] text-gray-300 group-hover:text-primary transition-colors"></i>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="px-4 pb-24">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight">Discover Campus</h3>
         </div>
         
         {isDataLoading ? (
             <div className="grid grid-cols-2 gap-4">
                 {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
             </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map(product => {
                    const vendor = vendors.find(v => v.vendorId === product.vendorId);
                    const isInCart = cart.some(item => item.productId === product.id);
                    const isFavorite = favorites.includes(product.id);
                    return (
                        <div key={product.id} className="bg-white/60 dark:bg-darkSurface/60 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-sm border border-white/50 dark:border-gray-800 flex flex-col h-full cursor-pointer relative group transition-all hover:shadow-lg" onClick={() => navigate(`/buyer/product/${product.id}`)}>
                            <div className="aspect-square relative overflow-hidden bg-gray-50/50 dark:bg-darkBg/90">
                                <img src={product.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.title} />
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 transform ${isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 dark:bg-darkSurface/80 text-gray-400 hover:text-red-500 group-hover:scale-100 group-hover:opacity-100 opacity-0 scale-90'}`}>
                                    <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-[12px]`}></i>
                                </button>
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <div>
                                    <h3 className="text-sm text-gray-900 dark:text-white font-bold leading-tight line-clamp-2">{product.title}</h3>
                                    <p className="text-[11px] text-gray-400 mt-1.5 font-bold uppercase tracking-tight">{vendor?.storeName}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-base font-black text-gray-900 dark:text-white">₵{product.price}</span>
                                    <button className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white transition-all shadow-sm ${isInCart ? 'bg-green-500' : 'bg-primary active:scale-90 hover:shadow-lg'}`} onClick={(e) => { e.stopPropagation(); if (product.stock > 0) isInCart ? removeFromCart(product.id) : addToCart(product); }}>
                                        <i className={`fa-solid ${isInCart ? 'fa-check' : 'fa-plus'} text-[12px]`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
         )}
      </div>
    </div>
  );
};