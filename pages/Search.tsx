
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Card, Button, Avatar } from '../components/UI';
import { INITIAL_LOCATION_CACHE, UPSA_LOCATION_CACHE } from '../constants';
import { CampusCode } from '../types';

// Define Leaflet on window
declare global {
    interface Window {
        L: any;
    }
}

export const SearchPage: React.FC = () => {
  const { products, vendors, refreshData } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCampus, setActiveCampus] = useState<'All' | CampusCode>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null); 
  const routingLayerRef = useRef<any>(null);
  
  const activePlotId = useRef<number>(0);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const isMounted = useRef(true);

  // Persistent coordinate cache merges both campus registries
  const coordCache = useRef<Record<string, [number, number]>>((() => {
      try {
          const saved = localStorage.getItem('lynqed_geo_cache');
          const mergedBase = { ...INITIAL_LOCATION_CACHE, ...UPSA_LOCATION_CACHE };
          if (saved) {
              const parsed = JSON.parse(saved);
              return { ...mergedBase, ...parsed };
          }
          return mergedBase;
      } catch (e) {
          return { ...INITIAL_LOCATION_CACHE, ...UPSA_LOCATION_CACHE };
      }
  })());

  const approvedProducts = products.filter(p => 
    p.status === 'approved' && 
    (activeCampus === 'All' || p.campus === activeCampus) &&
    (p.title.toLowerCase().includes(query.toLowerCase()) || 
     p.category.toLowerCase().includes(query.toLowerCase()))
  );

  const getVendorAvatar = (v: any) => {
      if (v?.storeAvatarUrl && v.storeAvatarUrl.startsWith('http')) {
          return v.storeAvatarUrl;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(v?.storeName || 'Store')}&background=6366f1&color=fff&bold=true`;
  };

  const getCoordinates = async (locationName: string): Promise<[number, number]> => {
      const cleanName = locationName.toLowerCase().trim();
      
      // 1. Check Merged Extended Cache (UPSA + UG)
      if (coordCache.current[cleanName]) return coordCache.current[cleanName];
      
      const partialKey = Object.keys(coordCache.current).find(k => cleanName.includes(k) || k.includes(cleanName));
      if (partialKey) return coordCache.current[partialKey];

      try {
          // Attempt smart campus geocoding via OSM if cache fails
          const campusQuery = `${locationName}, Accra, Ghana`;
          let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(campusQuery)}`);
          let data = await response.json();

          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              if (!isNaN(lat) && !isNaN(lon)) {
                  const coords: [number, number] = [lat, lon];
                  coordCache.current[cleanName] = coords;
                  localStorage.setItem('lynqed_geo_cache', JSON.stringify(coordCache.current));
                  return coords;
              }
          }
      } catch (e) { 
          console.warn(`Geocoding failed for: ${locationName}`); 
      }
      
      return [5.6515, -0.1885]; // Legon Fallback
  };

  // Initialize Map
  useEffect(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      if (window.L) {
        const defaultCenter: [number, number] = [5.6515, -0.1885];
        const map = window.L.map(mapContainerRef.current, { 
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            touchZoom: true
        }).setView(defaultCenter, 15);

        if (map.zoomControl) {
            map.zoomControl.setPosition('topright');
        }

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        markersLayerRef.current = window.L.layerGroup().addTo(map);
        routingLayerRef.current = window.L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        
        setTimeout(() => map.invalidateSize(), 300);
      }

      refreshData();

      return () => {
          isMounted.current = false;
          if (mapInstanceRef.current) {
              mapInstanceRef.current.remove();
              mapInstanceRef.current = null;
          }
      };
  }, []); 

  // Plot Vendors and center if product selected
  useEffect(() => {
      const markersLayer = markersLayerRef.current;
      const routingLayer = routingLayerRef.current;
      const map = mapInstanceRef.current;

      if (!map || !markersLayer || !window.L || !isMounted.current) return;
      
      const plotId = ++activePlotId.current;

      const plotVendors = async () => {
          if (!isMounted.current || plotId !== activePlotId.current || !mapInstanceRef.current) return;

          markersLayer.clearLayers();
          routingLayer.clearLayers();
          
          const activeVendors = vendors.filter(v => v.isApproved && (activeCampus === 'All' || v.campus === activeCampus));
          const userPos: [number, number] = [5.6506, -0.1962]; 

          if (plotId !== activePlotId.current || !isMounted.current || !mapInstanceRef.current) return;

          // User Pin
          window.L.marker(userPos, { 
              icon: window.L.divIcon({
                  className: 'custom-user-pin',
                  html: `<div class="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-glow pulse-ring"></div>`,
                  iconSize: [20, 20]
              }) 
          }).addTo(markersLayer);

          const vendorsByLocation: Record<string, any[]> = {};
          for (const v of activeVendors) {
            const basePos = await getCoordinates(v.location);
            if (!isMounted.current || plotId !== activePlotId.current || !mapInstanceRef.current) return;

            const key = `${basePos[0].toFixed(6)},${basePos[1].toFixed(6)}`;
            if (!vendorsByLocation[key]) vendorsByLocation[key] = [];
            vendorsByLocation[key].push({ ...v, basePos });
          }

          if (plotId !== activePlotId.current || !isMounted.current || !mapInstanceRef.current) return;

          Object.keys(vendorsByLocation).forEach((key) => {
              const group = vendorsByLocation[key];
              const numInGroup = group.length;

              group.forEach((v, index) => {
                // Final check before adding each layer
                if (!isMounted.current || plotId !== activePlotId.current || !mapInstanceRef.current) return;

                let finalPos = [...v.basePos];
                if (numInGroup > 1) {
                    const angle = (index / numInGroup) * 2 * Math.PI;
                    const radius = 0.0002;
                    finalPos[0] += Math.cos(angle) * radius;
                    finalPos[1] += Math.sin(angle) * radius;
                }

                const isSelected = selectedProductId && products.find(p => p.id === selectedProductId)?.vendorId === v.vendorId;
                const avatarUrl = getVendorAvatar(v);
                const campusLabel = v.campus || 'UG';

                const marker = window.L.marker(finalPos, { 
                    icon: window.L.divIcon({
                        className: 'custom-map-pin',
                        html: `
                            <div class="relative flex flex-col items-center group cursor-pointer ${isSelected ? 'z-50 scale-125' : ''}">
                                <div class="absolute -top-12 bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-2xl border border-white/20 whitespace-nowrap uppercase tracking-widest z-50 flex items-center gap-1.5">
                                    <span class="bg-primary/30 px-1 rounded">${campusLabel}</span>
                                    ${v.location}
                                </div>
                                <div class="w-12 h-12 bg-white dark:bg-darkSurface rounded-2xl p-0.5 shadow-float border-2 ${isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-white dark:border-gray-800'} overflow-hidden transform transition-all duration-300">
                                    <img src="${avatarUrl}" class="w-full h-full object-cover bg-gray-100 dark:bg-darkBg rounded-xl" />
                                </div>
                                <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-primary' : 'border-t-white dark:border-t-gray-800'}"></div>
                            </div>
                        `,
                        iconSize: [48, 60],
                        iconAnchor: [24, 60]
                    }),
                    zIndexOffset: isSelected ? 1000 : index
                });
                
                marker.on('click', () => {
                    navigate(`/store/${v.vendorId}`);
                });

                markersLayer.addLayer(marker);
              });
          });

          // Focus logic
          if (viewMode === 'map' && selectedProductId) {
              const p = products.find(prod => prod.id === selectedProductId);
              const v = vendors.find(vend => vend.vendorId === p?.vendorId);
              if (v && isMounted.current && mapInstanceRef.current && plotId === activePlotId.current) {
                  const coords = await getCoordinates(v.location);
                  if (isMounted.current && mapInstanceRef.current && plotId === activePlotId.current) {
                      map.setView(coords, 17, { animate: true });
                      setTimeout(() => {
                          if (isMounted.current && mapInstanceRef.current) {
                              map.invalidateSize();
                          }
                      }, 300);
                  }
              }
          } else {
              if (activeCampus === 'UPSA' && isMounted.current && mapInstanceRef.current && plotId === activePlotId.current) {
                  map.setView([5.6508, -0.1685], 16, { animate: true });
              } else if (activeCampus === 'UG' && isMounted.current && mapInstanceRef.current && plotId === activePlotId.current) {
                  map.setView([5.6515, -0.1885], 16, { animate: true });
              }
          }
      };

      plotVendors();

  }, [vendors, selectedProductId, products, activeCampus, viewMode]);

  const handleProductSelect = (pid: string) => {
      setSelectedProductId(pid);
      setViewMode('map');
  };

  const handleBackToSearch = () => {
      setViewMode('list');
      setSelectedProductId(null);
  };

  const handleGlobalBack = (e: React.MouseEvent) => {
      e.preventDefault();
      if (viewMode === 'map') {
          handleBackToSearch();
      } else {
          if (window.history.length > 1) navigate(-1);
          else navigate('/buyer/dashboard', { replace: true });
      }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 dark:bg-darkBg flex flex-col transition-colors duration-300">
      
      {/* Search Header (Always on top) */}
      <div className="absolute top-4 left-4 right-4 z-[60] flex flex-col gap-3 animate-slide-up">
        <div className="bg-white/95 dark:bg-darkSurface/95 backdrop-blur-md rounded-2xl shadow-float flex items-center p-3 border border-white/20 dark:border-white/5">
            <button type="button" onClick={handleGlobalBack} className="mr-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <input 
                autoFocus
                value={query}
                onChange={(e) => { 
                    setQuery(e.target.value); 
                    if (viewMode === 'map') setViewMode('list');
                    setSelectedProductId(null); 
                }}
                placeholder="Search shops, hostels, or items..."
                className="flex-grow bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 font-medium"
            />
             {(query || selectedProductId) && (
                 <i 
                    className="fa-solid fa-xmark text-gray-400 cursor-pointer p-2" 
                    onClick={() => { setQuery(''); setViewMode('list'); setSelectedProductId(null); }}
                 ></i>
             )}
        </div>

        {/* Campus Switcher Pills - Visible only in search mode */}
        {viewMode === 'list' && (
            <div className="flex gap-2 justify-center">
                {['All', 'UG', 'UPSA'].map(campus => (
                    <button
                        key={campus}
                        onClick={() => setActiveCampus(campus as any)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95 ${activeCampus === campus ? 'bg-primary text-white scale-105 border-transparent' : 'bg-white/80 dark:bg-darkSurface/80 text-gray-500 dark:text-gray-400 border border-white/20 dark:border-white/5'}`}
                    >
                        {campus === 'All' ? 'Whole Campus' : campus}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Viewport Content */}
      <div className="relative flex-grow h-full bg-white dark:bg-darkBg">
          
          {/* SEARCH LIST MODE */}
          {viewMode === 'list' && (
              <div className="h-full pt-28 pb-20 overflow-y-auto px-6 hide-scrollbar animate-fade-in bg-gray-50 dark:bg-darkBg">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="font-black text-gray-900 dark:text-white text-xl font-display tracking-tight">
                        {approvedProducts.length} Results
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {approvedProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-300 opacity-60">
                            <i className="fa-solid fa-magnifying-glass text-5xl mb-4"></i>
                            <p className="font-black uppercase tracking-[0.2em] text-xs">No matching products</p>
                        </div>
                    ) : (
                        approvedProducts.map(product => {
                            const vendor = vendors.find(v => v.vendorId === product.vendorId);
                            const avatarUrl = getVendorAvatar(vendor);
                            return (
                                <div key={product.id} className="flex bg-white dark:bg-darkSurface/50 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 shadow-card active:scale-[0.98] transition-all cursor-pointer group" onClick={() => handleProductSelect(product.id)}>
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-darkBg rounded-2xl overflow-hidden border border-white dark:border-gray-800 shadow-sm relative">
                                        <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} />
                                    </div>
                                    <div className="ml-4 flex-grow flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm font-display leading-tight">{product.title}</h4>
                                                <Avatar src={avatarUrl} name={vendor?.storeName || ''} size="sm" className="w-6 h-6 ml-2 rounded-lg" />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tighter">{vendor?.storeName} • {vendor?.campus}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="font-black text-primary text-lg">₵{product.price}</span>
                                            <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-darkSurface px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 uppercase tracking-tighter">
                                                <i className="fa-solid fa-location-dot text-red-500"></i>
                                                <span className="truncate max-w-[80px]">{product.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
              </div>
          )}

          {/* SPLIT MAP MODE */}
          <div className={`absolute inset-0 z-0 flex flex-col transition-opacity duration-500 ${viewMode === 'map' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {/* Map Section - Top portion */}
              <div className="flex-grow min-h-0 relative">
                  <div ref={mapContainerRef} className="w-full h-full outline-none" />
              </div>
              
              {/* Product/Vendor Detail Section - Bottom portion */}
              {selectedProduct && (
                  <div className="bg-white dark:bg-darkSurface p-6 border-t border-gray-100 dark:border-gray-800 animate-slide-up shrink-0 pb-10">
                      <div className="max-w-2xl mx-auto">
                          <div className="flex items-start gap-4 mb-6">
                              <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/10 flex-shrink-0">
                                  <img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt={selectedProduct.title} />
                              </div>
                              <div className="flex-grow pt-1">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{selectedProduct.category}</p>
                                  <h4 className="font-display font-black text-gray-900 dark:text-white text-xl leading-tight mb-2">{selectedProduct.title}</h4>
                                  <div className="flex items-center gap-2">
                                      <Avatar src={getVendorAvatar(vendors.find(v => v.vendorId === selectedProduct.vendorId))} name="" size="xs" className="w-5 h-5 rounded-md" />
                                      <p className="text-sm text-gray-500 font-bold">
                                          {vendors.find(v => v.vendorId === selectedProduct.vendorId)?.storeName}
                                      </p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="font-black text-gray-900 dark:text-white text-xl">₵{selectedProduct.price}</span>
                                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Free Delivery</p>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <Button 
                                  fullWidth 
                                  variant="primary" 
                                  size="lg" 
                                  className="h-14 font-black tracking-[0.2em] uppercase text-xs rounded-2xl shadow-glow"
                                  onClick={() => navigate(`/buyer/product/${selectedProduct.id}`)}
                              >
                                  View Item Details
                              </Button>
                              <Button 
                                  variant="secondary" 
                                  size="lg" 
                                  className="w-14 h-14 rounded-2xl flex-shrink-0 border-2 border-gray-100 dark:border-gray-800"
                                  onClick={handleBackToSearch}
                              >
                                  <i className="fa-solid fa-list-ul"></i>
                              </Button>
                          </div>
                      </div>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};