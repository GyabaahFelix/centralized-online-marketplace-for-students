import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Button, Card, Badge } from '../components/UI';

// Leaflet types extension
declare global {
    interface Window {
        L: any;
    }
}

export const DeliveryDashboard: React.FC = () => {
    const { orders, currentUser, assignDelivery, updateOrderStatus, refreshData, couriers, toggleDriverStatus, updateDriverLocation } = useApp();
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
    
    // UI Scanning state
    const [isScanning, setIsScanning] = useState(true);
    
    // Simulating GPS Movement
    const simulationInterval = useRef<any>(null);

    // Get current rider profile
    const me = couriers.find(d => d.userId === currentUser?.id);
    const isOnline = me?.onlineStatus || false;

    // --- GPS Logic ---
    useEffect(() => {
        if (!isOnline) {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
            return;
        }

        // 1. Get Initial Position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    updateDriverLocation(latitude, longitude);
                },
                (err) => console.error("GPS Error", err),
                { enableHighAccuracy: true }
            );
        }

        // 2. Simulate Movement / Update Loop
        simulationInterval.current = setInterval(() => {
             setCurrentLocation(prev => {
                 if(!prev) return { lat: 5.6506, lng: -0.1962 }; // Default
                 
                 // Simulate small jitter to show "live" effect
                 const newLat = prev.lat + (Math.random() - 0.5) * 0.0001;
                 const newLng = prev.lng + (Math.random() - 0.5) * 0.0001;
                 
                 updateDriverLocation(newLat, newLng);
                 return { lat: newLat, lng: newLng };
             });
        }, 5000); // Update every 5s

        return () => clearInterval(simulationInterval.current);
    }, [isOnline]);


    // --- Map Logic for Active Job ---
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    const activeJob = orders.find(o => 
        o.courierId === currentUser?.id && 
        o.status !== 'delivered' && o.status !== 'cancelled'
    );

    useEffect(() => {
        if (activeTab === 'active' && activeJob && mapRef.current && window.L) {
             if (!mapInstance.current) {
                 mapInstance.current = window.L.map(mapRef.current).setView([5.6506, -0.1962], 14);
                 window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap',
                 }).addTo(mapInstance.current);
             }
             
             const map = mapInstance.current;
             // Clear existing layers
             map.eachLayer((layer: any) => {
                 if (!layer._url) map.removeLayer(layer);
             });

             // 1. Driver Marker
             if (currentLocation) {
                 window.L.marker([currentLocation.lat, currentLocation.lng], {
                     icon: window.L.divIcon({
                         className: 'bg-transparent',
                         html: '<div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg pulse-ring"></div>'
                     })
                 }).addTo(map);
             }

             // 2. Pickup (Vendor)
             if (activeJob.pickupCoordinates) {
                 window.L.marker([activeJob.pickupCoordinates.lat, activeJob.pickupCoordinates.lng], {
                     icon: window.L.divIcon({ html: '<i class="fa-solid fa-store text-purple-600 dark:text-purple-400 text-2xl drop-shadow-md"></i>', className: 'bg-transparent' })
                 }).addTo(map);
             }

             // 3. Dropoff (Buyer)
             if (activeJob.locationCoordinates) {
                 window.L.marker([activeJob.locationCoordinates.lat, activeJob.locationCoordinates.lng], {
                     icon: window.L.divIcon({ html: '<i class="fa-solid fa-location-dot text-red-600 dark:text-red-400 text-2xl drop-shadow-md"></i>', className: 'bg-transparent' })
                 }).addTo(map);
             }

             // Fit bounds
             const bounds = [];
             if (currentLocation) bounds.push([currentLocation.lat, currentLocation.lng]);
             if (activeJob.pickupCoordinates) bounds.push([activeJob.pickupCoordinates.lat, activeJob.pickupCoordinates.lng]);
             if (activeJob.locationCoordinates) bounds.push([activeJob.locationCoordinates.lat, activeJob.locationCoordinates.lng]);
             
             if(bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [activeTab, activeJob, currentLocation]);


    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsScanning(true);
        await refreshData();
        setIsRefreshing(false);
    };
    
    const handleAccept = async (orderId: string) => {
        setAcceptingId(orderId);
        await assignDelivery(orderId);
        setActiveTab('active');
        setAcceptingId(null);
    };

    // Haversine Distance Helper
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };
    
    // Handle Scanning Timeout Logic
    useEffect(() => {
        let timer: any;
        if (isOnline && activeTab === 'available') {
            // Start a fresh "scanning" phase whenever we go online or switch to new tab
            setIsScanning(true);
            timer = setTimeout(() => {
                setIsScanning(false);
            }, 8000); // 8 seconds scan duration
        }
        return () => clearTimeout(timer);
    }, [isOnline, activeTab]);

    // Status Checks
    if (!me || me.status === 'pending') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg p-6 text-center">
            <div className="animate-fade-in">
                <i className="fa-solid fa-clock text-4xl text-yellow-500 mb-4"></i>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Pending</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Your courier application is under review by admin.</p>
                <Button variant="ghost" className="mt-4" onClick={handleRefresh}>Check Status</Button>
            </div>
        </div>
    );

    if (me.status === 'suspended') return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg p-6 text-center text-red-500 font-bold">Account Suspended</div>;
    if (me.status === 'rejected') return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg p-6 text-center text-red-500 font-bold">Application Rejected</div>;

    // Filter Logic
    const availableJobs = orders.filter(o => {
        const isReady = o.status === 'ready_for_pickup' && o.deliveryOption === 'delivery' && !o.courierId;
        if (!isReady) return false;

        if (currentLocation && o.pickupCoordinates) {
            const dist = calculateDistance(currentLocation.lat, currentLocation.lng, o.pickupCoordinates.lat, o.pickupCoordinates.lng);
            return dist <= 5; 
        }
        return true;
    });

    const myHistory = orders.filter(o => o.courierId === currentUser?.id && o.status === 'delivered');
    const totalEarnings = myHistory.length * 10; 

    const getNextStep = (status: string) => {
        if (status === 'courier_assigned') return { label: 'Confirm Pickup', next: 'picked_up', icon: 'box-open' };
        if (status === 'picked_up') return { label: 'Start Route', next: 'delivering', icon: 'route' };
        if (status === 'delivering') return { label: 'Mark Delivered', next: 'delivered', icon: 'flag-checkered' };
        return null;
    };

    return (
        <div className="min-h-screen bg-transparent pb-24 animate-fade-in pb-safe">
            {/* Header */}
            <div className={`p-6 text-white rounded-b-3xl shadow-lg mb-6 sticky top-0 z-10 transition-colors duration-500 ${isOnline ? 'bg-primary' : 'bg-gray-800 dark:bg-darkSurface'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-display font-bold">Courier Hub</h1>
                    <div className="flex items-center gap-3">
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 bg-white/10" 
                            onClick={handleRefresh}
                        >
                            <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : ''}`}></i>
                        </Button>
                        <div 
                            className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all border ${isOnline ? 'bg-green-500 border-green-400' : 'bg-gray-700 border-gray-600 dark:bg-gray-900 dark:border-gray-800'}`}
                            onClick={() => toggleDriverStatus(!isOnline)}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                            <span className="text-xs font-bold uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>
                {isOnline ? (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <p className="text-white/70 text-[10px] font-bold uppercase">Earnings</p>
                            <p className="text-2xl font-bold">₵{totalEarnings.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <p className="text-white/70 text-[10px] font-bold uppercase">Completed</p>
                            <p className="text-2xl font-bold">{myHistory.length}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2 text-white/50 text-sm">You are offline. Go online to receive orders.</div>
                )}
            </div>

            <div className="px-4">
                {/* Tabs */}
                <div className="flex bg-white dark:bg-darkSurface p-1 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800 sticky top-40 z-10 transition-colors">
                    <button onClick={() => setActiveTab('available')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'available' ? 'bg-primary/5 dark:bg-primary/20 text-primary' : 'text-gray-400 dark:text-gray-500'}`}>New ({availableJobs.length})</button>
                    <button onClick={() => setActiveTab('active')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-primary/5 dark:bg-primary/20 text-primary' : 'text-gray-400 dark:text-gray-500'}`}>Current ({activeJob ? 1 : 0})</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-primary/5 dark:bg-primary/20 text-primary' : 'text-gray-400 dark:text-gray-500'}`}>History</button>
                </div>

                <div className="space-y-4">
                    {/* AVAILABLE */}
                    {activeTab === 'available' && (
                        !isOnline ? (
                            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                                <i className="fa-solid fa-power-off text-4xl mb-4 opacity-20"></i>
                                <p>You are currently offline.</p>
                            </div>
                        ) : availableJobs.length === 0 ? (
                            isScanning ? (
                                <div className="text-center py-20 text-gray-400 dark:text-gray-600 animate-pulse">
                                    <i className="fa-solid fa-radar text-4xl mb-4 opacity-20"></i>
                                    <p>Scanning for nearby orders...</p>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400 dark:text-gray-600 animate-fade-in">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-solid fa-circle-nodes text-2xl opacity-30"></i>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">No new orders available</p>
                                    <p className="text-xs mt-2 px-10 leading-relaxed">We'll notify you as soon as a new delivery job pops up on campus.</p>
                                    <button 
                                        onClick={handleRefresh}
                                        className="mt-6 text-xs font-bold text-primary dark:text-primaryLight hover:underline flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <i className="fa-solid fa-rotate"></i> Manual Refresh
                                    </button>
                                </div>
                            )
                        ) : (
                            availableJobs.map(job => (
                                <Card key={job.id} className="p-0 overflow-hidden border-l-4 border-l-green-500 animate-slide-up">
                                    <div className="p-4 bg-white dark:bg-darkSurface transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge color="green">Ready for Pickup</Badge>
                                            <span className="font-bold text-lg text-green-600 dark:text-green-400">₵10.00</span>
                                        </div>
                                        <div className="flex items-start gap-3 mt-3">
                                            <div className="flex flex-col items-center gap-1 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-800"></div>
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Pickup</p>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Vendor #{job.vendorId.slice(-4)}</p>
                                                    {currentLocation && job.pickupCoordinates && <p className="text-xs text-primary dark:text-primaryLight">{calculateDistance(currentLocation.lat, currentLocation.lng, job.pickupCoordinates.lat, job.pickupCoordinates.lng).toFixed(1)} km away</p>}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Dropoff</p>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Customer Location</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 border-t border-gray-100 dark:border-gray-800 transition-colors">
                                        <Button 
                                            fullWidth 
                                            onClick={() => handleAccept(job.id)}
                                            disabled={acceptingId === job.id}
                                            className="shadow-lg shadow-green-500/20"
                                        >
                                            {acceptingId === job.id ? 'Accepting...' : 'Accept Job'}
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )
                    )}

                    {/* ACTIVE */}
                    {activeTab === 'active' && (
                        !activeJob ? (
                            <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                                <p>No active delivery.</p>
                            </div>
                        ) : (
                            <Card className="p-0 overflow-hidden border-2 border-primary shadow-xl dark:bg-darkSurface">
                                <div className="bg-primary p-3 text-white flex justify-between items-center">
                                    <span className="font-bold">Current Delivery</span>
                                    <Badge className="bg-white/20 text-white border-transparent">{activeJob.status.replace('_', ' ')}</Badge>
                                </div>
                                
                                {/* Map Container */}
                                <div ref={mapRef} className="h-64 w-full bg-gray-100 dark:bg-gray-900 z-0"></div>

                                <div className="p-4 bg-white dark:bg-darkSurface relative z-10 -mt-4 rounded-t-2xl shadow-up transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Est. Arrival</p>
                                            <p className="font-bold text-xl dark:text-white">10 min</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Distance</p>
                                            <p className="font-bold text-xl dark:text-white">2.4 km</p>
                                        </div>
                                    </div>

                                    {(() => {
                                        const step = getNextStep(activeJob.status);
                                        return step ? (
                                            <Button 
                                                fullWidth 
                                                size="lg" 
                                                onClick={() => updateOrderStatus(activeJob.id, step.next as any)} 
                                                className="shadow-lg shadow-primary/30 h-14 text-lg"
                                                icon={step.icon}
                                            >
                                                {step.label}
                                            </Button>
                                        ) : null;
                                    })()}
                                </div>
                            </Card>
                        )
                    )}

                    {/* HISTORY */}
                    {activeTab === 'history' && (
                        myHistory.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                                <i className="fa-solid fa-history text-4xl mb-4 opacity-20"></i>
                                <p>No completed jobs yet.</p>
                            </div>
                        ) : (
                            myHistory.map(job => (
                                <Card key={job.id} className="p-4 opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-900 dark:text-white">Order #{job.id.slice(-4)}</span>
                                        <Badge color="green">Delivered</Badge>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800 mt-2 transition-colors">
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">+ ₵10.00</span>
                                    </div>
                                </Card>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
};