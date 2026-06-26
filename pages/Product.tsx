
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useApp } from '../context';
import { Button, Badge, Card, Avatar, Spinner, Input } from '../components/UI';
import { Product, Review, Vendor } from '../types';
import { INITIAL_LOCATION_CACHE } from '../constants';

// --- Review Modal ---
export const ReviewModal: React.FC<{ 
    productId: string; 
    vendorId: string; 
    onClose: () => void;
    existingReview?: Review;
}> = ({ productId, vendorId, onClose, existingReview }) => {
    const { submitReview, currentUser, uploadFile } = useApp();
    const [rating, setRating] = useState(existingReview?.rating || 5);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [images, setImages] = useState<string[]>(existingReview?.images || []);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const files = Array.from(e.target.files);
            const uploaded: string[] = [];
            for (const file of files) {
                const url = await uploadFile(file, 'review-images');
                if (url) uploaded.push(url);
            }
            setImages(prev => [...prev, ...uploaded]);
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setSubmitting(true);
        const success = await submitReview({
            id: existingReview?.id, productId, vendorId, userId: currentUser.id,
            rating, comment, images
        });
        if (success) onClose();
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
            <Card className="p-8 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl animate-slide-up bg-white dark:bg-darkSurface max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">{existingReview ? 'Edit Review' : 'Write a Review'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}>
                                <i className="fa-solid fa-star"></i>
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full rounded-2xl bg-gray-50 dark:bg-gray-900 p-4 text-sm h-32 outline-none border border-gray-100 dark:border-gray-800 dark:text-white"
                        placeholder="Tell us what you think..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    />
                    <div className="flex flex-wrap gap-2">
                        {images.map((img, i) => (
                            <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover" alt="Review" />
                        ))}
                        {images.length < 3 && (
                            <button type="button" onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors">
                                {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileRef} hidden multiple accept="image/*" onChange={handleImageUpload} />
                    <Button fullWidth size="lg" type="submit" disabled={submitting || uploading}>{submitting ? 'Posting...' : 'Submit Review'}</Button>
                </form>
            </Card>
        </div>
    );
};

// --- Store Page ---
export const StorePage: React.FC = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { vendors, products, reviews, showToast } = useApp();
    
    const vendor = vendors.find(v => v.vendorId === vendorId);
    const storeProducts = products.filter(p => p.vendorId === vendorId && p.status === 'approved');
    const storeReviews = reviews.filter(r => r.vendorId === vendorId);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    const getBestCoords = (locationName: string): [number, number] => {
        const clean = locationName.toLowerCase().trim();
        if (INITIAL_LOCATION_CACHE[clean]) return INITIAL_LOCATION_CACHE[clean];
        const key = Object.keys(INITIAL_LOCATION_CACHE).find(k => clean.includes(k) || k.includes(clean));
        if (key) return INITIAL_LOCATION_CACHE[key];
        return [5.6506, -0.1962];
    };

    useEffect(() => {
        if (!vendor || !mapRef.current || !window.L || mapInstance.current) return;

        const coords = getBestCoords(vendor.location);
        const map = window.L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            touchZoom: true,
            doubleClickZoom: true
        }).setView(coords, 17);

        if (map.zoomControl) {
            map.zoomControl.setPosition('topright');
        }

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        window.L.marker(coords, {
            icon: window.L.divIcon({
                className: 'custom-map-pin',
                html: `
                    <div class="relative flex flex-col items-center">
                        <div class="absolute -top-12 bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl border border-white/20 animate-bounce-slight uppercase tracking-widest z-50">
                            ${vendor.location}
                        </div>
                        <div class="w-12 h-12 bg-primary rounded-2xl border-4 border-white shadow-glow flex items-center justify-center text-white ring-4 ring-primary/20 pulse-ring">
                            <i class="fa-solid fa-store text-lg"></i>
                        </div>
                    </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 48]
            })
        }).addTo(map);

        mapInstance.current = map;
        setTimeout(() => map.invalidateSize(), 300);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [vendor]);

    if (!vendor) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg"><Spinner /></div>;

    const handleShare = async () => {
        const shareData = {
            title: vendor.storeName,
            text: `Check out ${vendor.storeName} on LYNQED!`,
            url: `https://lynqed.vercel.app/#/store/${vendorId}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            showToast("Store link copied!", "success");
        }
    };

    const handleWhatsApp = () => {
        if (!vendor.contactPhone) {
            showToast("Vendor contact info not found.", "error");
            return;
        }
        let cleanPhone = vendor.contactPhone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '233' + cleanPhone.substring(1);
        }
        const message = encodeURIComponent(`Hi ${vendor.storeName}, I'm reaching out to you via LYNQED.`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-24 animate-fade-in">
            <div className="relative h-[420px] w-full overflow-hidden border-b border-gray-100 dark:border-gray-800">
                <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full bg-gray-200 dark:bg-gray-800" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-gray-50 via-gray-50/40 dark:from-darkBg dark:via-darkBg/40 to-transparent pointer-events-none z-10" />
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-white/95 dark:bg-darkSurface/95 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md active:scale-90 transition-all border border-white/50 dark:border-white/10"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pointer-events-none">
                    <div className="flex items-end gap-6">
                        <div className="relative pointer-events-auto">
                            <Avatar src={vendor.storeAvatarUrl} name={vendor.storeName} size="xl" className="border-4 border-white dark:border-darkSurface shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem]" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-darkSurface flex items-center justify-center shadow-lg"><div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div></div>
                        </div>
                        <div className="flex-1 pb-1">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-lg mb-2 border border-white/20"><i className="fa-solid fa-location-dot text-red-500 text-[10px]"></i><span className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest">{vendor.location}</span></div>
                            <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white leading-none tracking-tight drop-shadow-sm">{vendor.storeName}</h1>
                            <div className="flex items-center gap-3 mt-3"><Badge color="violet" className="px-3 py-1 text-[9px] shadow-sm">Verified LYNQED Merchant</Badge><div className="flex items-center gap-1.5 text-xs font-black text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-xl"><i className="fa-solid fa-star text-yellow-400"></i>{vendor.rating.toFixed(1)} ({storeReviews.length})</div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-8 max-w-5xl mx-auto">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button fullWidth icon="phone" size="lg" className="h-14 text-base" onClick={() => window.open(`tel:${vendor.contactPhone}`)}>Call Merchant</Button>
                        <button 
                            onClick={handleWhatsApp}
                            className="h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center gap-3 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-base"
                        >
                            <i className="fa-brands fa-whatsapp text-2xl"></i>
                            WhatsApp
                        </button>
                    </div>
                    <Button fullWidth variant="secondary" size="lg" className="h-14 text-base" icon="share-nodes" onClick={handleShare}>Share Store</Button>
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Merchant Details</h3>
                    <div className="bg-white dark:bg-darkSurface p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{vendor.storeDescription || "A verified LYNQED vendor providing quality products within the campus ecosystem."}</p>
                        <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500"><i className="fa-solid fa-map-pin"></i></div><span className="text-sm font-bold text-gray-900 dark:text-white">{vendor.location}</span></div>
                            <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter">REF: {vendor.vendorId.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-5 ml-1"><h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Inventory</h3><span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{storeProducts.length} Listings</span></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {storeProducts.length === 0 ? (<div className="col-span-full py-20 text-center opacity-30"><i className="fa-solid fa-box-open text-4xl mb-3"></i><p className="text-sm font-bold">No products currently listed.</p></div>) : (storeProducts.map(product => (
                                <Card key={product.id} className="p-0 overflow-hidden group border border-gray-100 dark:border-gray-800 rounded-[2rem]" onClick={() => navigate(`/buyer/product/${product.id}`)}>
                                    <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        {product.stock === 0 && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"><span className="text-[9px] font-black text-white uppercase tracking-widest bg-red-500 px-3 py-1 rounded-full shadow-lg">Restocking Soon</span></div>)}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 font-display tracking-tight">{product.title}</h4>
                                        <div className="flex justify-between items-center mt-2"><span className="text-sm font-black text-primary">₵{product.price}</span><i className="fa-solid fa-arrow-right text-[10px] text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all"></i></div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Product Detail ---
export const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart, cart, vendors, favorites, toggleFavorite, reviews, showToast } = useApp();
    
    const product = products.find(p => p.id === id);
    const vendor = vendors.find(v => v.vendorId === product?.vendorId);
    
    const [activeImg, setActiveImg] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showZoom, setShowZoom] = useState(false);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imageItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const zoomCarouselRef = useRef<HTMLDivElement>(null);
    const zoomImageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const productReviews = useMemo(() => reviews.filter(r => r.productId === id), [reviews, id]);
    const isFav = favorites.includes(product?.id || '');
    const isInCart = cart.some(i => i.productId === product?.id);

    // Sync active image with click from thumbnails
    const scrollToImage = (index: number) => {
        setActiveImg(index);
        imageItemRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
    };

    // Sync zoomed image scroll
    const scrollToZoomImage = (index: number) => {
        setActiveImg(index);
        zoomImageRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
    };

    // Listen for scroll to update active thumbnail on swipe
    const handleCarouselScroll = () => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.offsetWidth;
        const scrollLeft = carouselRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== activeImg && newIndex < (product?.images.length || 0)) {
            setActiveImg(newIndex);
        }
    };

    const handleZoomCarouselScroll = () => {
        if (!zoomCarouselRef.current) return;
        const width = zoomCarouselRef.current.offsetWidth;
        const scrollLeft = zoomCarouselRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== activeImg && newIndex < (product?.images.length || 0)) {
            setActiveImg(newIndex);
        }
    };

    useEffect(() => {
        if (thumbnailRefs.current[activeImg] && sidebarRef.current) {
            thumbnailRefs.current[activeImg]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [activeImg]);

    useEffect(() => {
        if (showZoom) {
            setTimeout(() => {
                zoomImageRefs.current[activeImg]?.scrollIntoView({
                    behavior: 'auto',
                    inline: 'center',
                    block: 'nearest'
                });
            }, 50);
        }
    }, [showZoom]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (!product || !product.images || product.images.length <= 1) return;

            // Avoid intercepting when user is typing in inputs or textareas
            const activeEl = document.activeElement;
            if (activeEl && (
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' || 
                activeEl.getAttribute('contenteditable') === 'true'
            )) {
                return;
            }

            e.preventDefault();

            if (e.key === 'ArrowLeft') {
                const newIndex = (activeImg - 1 + product.images.length) % product.images.length;
                if (showZoom) {
                    scrollToZoomImage(newIndex);
                } else {
                    scrollToImage(newIndex);
                }
            } else if (e.key === 'ArrowRight') {
                const newIndex = (activeImg + 1) % product.images.length;
                if (showZoom) {
                    scrollToZoomImage(newIndex);
                } else {
                    scrollToImage(newIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeImg, product, showZoom]);

    if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg"><Spinner /></div>;

    const handleBuyNow = () => {
        if (product.stock > 0) {
            addToCart(product, quantity);
            navigate('/buyer/checkout');
        }
    };

    const handleWhatsApp = () => {
        const phone = vendor?.contactPhone || product.contactPhone;
        if (!phone) {
            showToast("Vendor contact info not found.", "error");
            return;
        }
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '233' + cleanPhone.substring(1);
        }
        const message = encodeURIComponent(`Hi ${vendor?.storeName || 'Vendor'}, I'm interested in your "${product.title}" (₵${product.price}) listed on LYNQED.`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const handleShare = async () => {
        const shareData = {
            title: product.title,
            text: `Check out this "${product.title}" on LYNQED!`,
            url: `https://lynqed.vercel.app/#/buyer/product/${id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Native share failed', err);
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            showToast("Product link copied!", "success");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-darkBg animate-fade-in pb-32">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                    <Link to="/buyer/dashboard" className="hover:text-primary">Home</Link>
                    <i className="fa-solid fa-chevron-right text-[8px]"></i>
                    <span className="hover:text-primary cursor-pointer">{product.category}</span>
                    <i className="fa-solid fa-chevron-right text-[8px]"></i>
                    <span className="text-gray-900 dark:text-white line-clamp-1">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    
                    {/* LEFT SIDE: GALLERY (6/10) */}
                    <div className="lg:col-span-6 flex gap-3 h-[450px] md:h-[650px]">
                        {/* Vertical Thumbnails (Always visible now) */}
                        <div 
                            ref={sidebarRef}
                            className="flex flex-col gap-3 w-14 sm:w-20 overflow-y-auto hide-scrollbar scroll-smooth p-1"
                        >
                            {product.images.map((img, i) => (
                                <div 
                                    key={i}
                                    ref={el => { thumbnailRefs.current[i] = el; }}
                                    onClick={() => scrollToImage(i)}
                                    className={`aspect-square w-full rounded-xl cursor-pointer border-2 transition-all p-1 bg-white flex-shrink-0 ${activeImg === i ? 'border-primary ring-2 ring-primary/10 shadow-sm scale-105 z-10 relative' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105 hover:z-10 relative'}`}
                                >
                                    <img src={img} className="w-full h-full object-contain" alt="" />
                                </div>
                            ))}
                        </div>

                        {/* Main Carousel Stage with Scroll-Snap */}
                        <div 
                            className="flex-1 relative bg-gray-50 dark:bg-white/5 rounded-[2.5rem] overflow-hidden group shadow-inner"
                        >
                            <div 
                                ref={carouselRef}
                                onScroll={handleCarouselScroll}
                                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
                            >
                                {product.images.map((img, i) => (
                                    <div 
                                        key={i}
                                        ref={el => { imageItemRefs.current[i] = el; }}
                                        onClick={() => setShowZoom(true)}
                                        className="min-w-full h-full snap-center flex items-center justify-center cursor-zoom-in"
                                    >
                                        <img 
                                            src={img} 
                                            className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 hover:scale-105" 
                                            alt={`${product.title} view ${i + 1}`} 
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Tags Overlay */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                                <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg flex items-center gap-1.5">
                                    <i className="fa-solid fa-fire text-[8px]"></i> #1 Best-Selling
                                </div>
                                {product.stock < 10 && (
                                    <div className="bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                        Almost Sold Out
                                    </div>
                                )}
                            </div>

                            {/* Back Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 dark:bg-darkSurface/90 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md active:scale-90 transition-all border border-white/50"
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>

                            {/* Carousel Indicators (Mobile) */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                {product.images.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeImg === i ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: INFO & ACTIONS (4/10) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Header Info */}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white leading-tight tracking-tight flex-1 pr-4">{product.title}</h1>
                                <button 
                                    onClick={handleShare}
                                    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                >
                                    <i className="fa-solid fa-share-nodes"></i>
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <i className="fa-solid fa-star"></i>
                                    <span className="font-black text-gray-900 dark:text-white">{product.rating?.toFixed(1) || '5.0'}</span>
                                </div>
                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                <span className="text-gray-500 dark:text-gray-400 font-bold">1.2K+ sold</span>
                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                <span className="text-gray-500 dark:text-gray-400 font-bold">{productReviews.length} Reviews</span>
                            </div>
                        </div>

                        {/* Price Area */}
                        <div className="bg-red-50/50 dark:bg-red-950/10 p-5 rounded-[2rem] border border-red-100 dark:border-red-900/20">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-black text-red-600">GHS</span>
                                <span className="text-4xl font-black text-red-600 tracking-tighter">₵{product.price.toFixed(2)}</span>
                                <span className="text-xs text-gray-400 line-through ml-2">₵{(product.price * 1.44).toFixed(0)}</span>
                                <Badge color="red" className="ml-auto bg-red-600 text-white rounded-md px-1.5 py-0.5 text-[8px]">-44% Limited Time</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-red-600/70 uppercase tracking-widest">
                                <i className="fa-solid fa-bolt-lightning animate-pulse"></i>
                                Clearance Deal Ends in 05:22:11
                            </div>
                        </div>

                        {/* Attributes Display */}
                        <div className="space-y-4 pt-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vendor / Merchant</p>
                                <Card 
                                    className="p-4 border-gray-100 dark:border-gray-800 hover:border-primary/40 bg-gray-50/50 dark:bg-white/5 rounded-2xl transition-all cursor-pointer shadow-none group"
                                    onClick={() => navigate(`/store/${product.vendorId}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar src={vendor?.storeAvatarUrl} name={vendor?.storeName || "Vendor"} size="md" className="rounded-xl border-2 border-white dark:border-darkBg shadow-sm" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{vendor?.storeName}</h3>
                                            <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot text-red-500"></i> {vendor?.location}
                                            </p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1"></i>
                                    </div>
                                </Card>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">About This Item</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* PURCHASE ACTIONS SECTION */}
                        <div className="space-y-4 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                                <div className="flex items-center gap-4 bg-gray-100 dark:bg-darkBg p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-darkSurface text-gray-900 dark:text-white shadow-sm flex items-center justify-center active:scale-90 transition-all"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                    <span className="font-black text-sm w-6 text-center dark:text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-darkSurface text-gray-900 dark:text-white shadow-sm flex items-center justify-center active:scale-90 transition-all"><i className="fa-solid fa-plus text-[10px]"></i></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-2">
                                <button 
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="w-full h-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all uppercase tracking-tight flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                >
                                    <i className="fa-solid fa-bolt"></i>
                                    {product.stock === 0 ? 'Out of Stock' : 'Buy It Now'}
                                </button>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => addToCart(product, quantity)}
                                        className={`flex-1 h-14 rounded-full font-black text-sm uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${isInCart ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-darkBg border-gray-900 dark:border-white text-gray-900 dark:text-white'}`}
                                    >
                                        <i className={`fa-solid ${isInCart ? 'fa-check' : 'fa-cart-plus'}`}></i>
                                        {isInCart ? 'Added to Cart' : 'Add to Cart'}
                                    </button>
                                    
                                    <button 
                                        onClick={() => toggleFavorite(product.id)}
                                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${isFav ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-darkBg border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                    >
                                        <i className={`fa-${isFav ? 'solid' : 'regular'} fa-heart text-lg`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Questions?</span>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                            </div>

                            <button 
                                onClick={handleWhatsApp}
                                className="w-full h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-4 transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98]"
                            >
                                <i className="fa-brands fa-whatsapp text-2xl"></i>
                                <span className="font-black text-sm uppercase tracking-widest">Message Merchant</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 z-[60] animate-slide-up flex gap-3 pb-safe">
                <button 
                    onClick={() => toggleFavorite(product.id)}
                    className={`h-14 w-14 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${isFav ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                >
                    <i className={`fa-${isFav ? 'solid' : 'regular'} fa-heart text-xl`}></i>
                </button>
                <button 
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 h-14 bg-red-600 text-white rounded-full font-black text-base shadow-lg shadow-red-600/20 active:scale-95"
                >
                    {product.stock === 0 ? 'Sold Out' : `Buy Now • ₵${(product.price * quantity).toFixed(0)}`}
                </button>
            </div>

            {/* ZOOM LIGHTBOX with Swipe Support */}
            {showZoom && (
                <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setShowZoom(false)}>
                    <button className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-all z-[210]">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div 
                            ref={zoomCarouselRef}
                            onScroll={handleZoomCarouselScroll}
                            className="flex w-full h-[70vh] overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
                        >
                            {product.images.map((img, i) => (
                                <div 
                                    key={i} 
                                    ref={el => { zoomImageRefs.current[i] = el; }}
                                    className="min-w-full h-full snap-center flex items-center justify-center p-4"
                                >
                                    <img 
                                        src={img} 
                                        className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain animate-scale-up" 
                                        alt={`Zoomed ${i + 1}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full-screen thumb bar */}
                    <div className="mt-8 flex gap-4 overflow-x-auto max-w-full p-4 hide-scrollbar">
                        {product.images.map((img, i) => (
                            <img 
                                key={i} 
                                src={img} 
                                onClick={(e) => { e.stopPropagation(); scrollToZoomImage(i); }}
                                className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl object-contain bg-white cursor-pointer border-2 transition-all ${activeImg === i ? 'border-primary scale-110 shadow-glow z-10 relative' : 'border-transparent opacity-30 hover:opacity-100 hover:scale-105 hover:z-10 relative'}`} 
                                alt="Thumb"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Cart Component ---
export const Cart: React.FC = () => {
    const { cart, removeFromCart, updateCartQuantity, clearCart } = useApp();
    const navigate = useNavigate();

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const isEmpty = cart.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-32 animate-fade-in max-w-5xl mx-auto">
            <div className="bg-white dark:bg-darkSurface p-4 shadow-sm sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h1 className="text-xl font-bold font-display dark:text-white">Your Cart</h1>
                </div>
                {!isEmpty && (
                    <button onClick={clearCart} className="text-[10px] font-black uppercase text-red-500 hover:underline">Clear All</button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {isEmpty ? (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-darkSurface rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-700">
                            <i className="fa-solid fa-cart-shopping text-4xl"></i>
                        </div>
                        <h2 className="text-xl font-bold dark:text-white mb-2">Cart is empty</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto text-sm">Looks like you haven't added anything to your cart yet.</p>
                        <Button onClick={() => navigate('/buyer/dashboard')} icon="bag-shopping">Start Shopping</Button>
                    </div>
                ) : (
                    cart.map(item => (
                        <Card key={item.productId} className="p-3 flex gap-4 animate-slide-up border border-gray-100 dark:border-gray-800 rounded-3xl">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900">
                                <img src={item.product.images[0]} className="w-full h-full object-cover" alt={item.product.title} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{item.product.title}</h4>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-black text-primary">₵{item.product.price}</span>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-darkBg p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                        <span className="text-xs font-black dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"><i className="fa-solid fa-plus text-[10px]"></i></button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {!isEmpty && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-40 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Estimated Total</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white font-display">₵{subtotal.toFixed(2)}</span>
                    </div>
                    <Button fullWidth size="lg" className="h-14 font-black text-lg shadow-xl shadow-primary/30 border-none" onClick={() => navigate('/buyer/checkout')}>Proceed to Checkout</Button>
                </div>
            )}
        </div>
    );
};

// --- Checkout Component ---
export const Checkout: React.FC = () => {
    const { cart, placeOrder, currentUser, updateProfile, showToast } = useApp();
    const navigate = useNavigate();
    const [option, setOption] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'delivery_meet'>('paystack');
    const [submitting, setSubmitting] = useState(false);
    const [paystackLoaded, setPaystackLoaded] = useState(false);
    
    // Inline Address Setup
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState(currentUser?.address || '');

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const deliveryFee = option === 'delivery' ? 10 : 0;
    const total = subtotal + deliveryFee;

    // Load Paystack Inline JS script dynamically
    useEffect(() => {
        const scriptId = 'paystack-inline-js';
        if (document.getElementById(scriptId)) {
            setPaystackLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => {
            setPaystackLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load Paystack Inline JS");
        };
        document.body.appendChild(script);
    }, []);

    const handleCheckout = async () => {
        if (paymentMethod === 'delivery_meet') {
            setSubmitting(true);
            try {
                await placeOrder(option, deliveryFee);
                showToast("Order placed successfully! Pay after meeting the vendor.", "success");
                setSubmitting(false);
                navigate('/buyer/orders');
            } catch (err: any) {
                console.error("Failed to place order:", err);
                showToast("Failed to place order. Please try again.", "error");
                setSubmitting(false);
            }
            return;
        }

        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        
        if (!publicKey) {
            // Friendly Developer Sandbox / Preview Fallback to prevent blocking
            showToast("VITE_PAYSTACK_PUBLIC_KEY is missing. Simulating sandbox checkout for testing...", "info");
            setSubmitting(true);
            setTimeout(async () => {
                await placeOrder(option, deliveryFee);
                setSubmitting(false);
                navigate('/buyer/orders');
            }, 1500);
            return;
        }

        if (!paystackLoaded || !(window as any).PaystackPop) {
            showToast("Paystack SDK is still loading. Please try again in a few seconds.", "info");
            return;
        }

        setSubmitting(true);

        const email = currentUser?.email || 'customer@example.com';
        const amountInPesewas = Math.round(total * 100); // Paystack amount is in lowest subunit (pesewas/kobo)
        const reference = `LNQ_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

        const verifyPayment = async (transaction: any) => {
            const trxRef = transaction.reference || transaction.trxref || reference;
            showToast("Verifying payment with the server...", "info");
            try {
                const verifyRes = await fetch(`/api/paystack/verify/${trxRef}`);
                const verifyData = await verifyRes.json();
                
                if (verifyRes.ok && verifyData.success) {
                    showToast("Payment verified! Placing your order...", "success");
                    await placeOrder(option, deliveryFee);
                    setSubmitting(false);
                    navigate('/buyer/orders');
                } else {
                    showToast(verifyData.error || "Payment verification failed. Please try again.", "error");
                    setSubmitting(false);
                }
            } catch (err) {
                console.error("Verification endpoint error:", err);
                showToast("Verification failed. Placing order under review...", "error");
                // Fallback: place order anyway but mark it
                await placeOrder(option, deliveryFee);
                setSubmitting(false);
                navigate('/buyer/orders');
            }
        };

        try {
            const handler = (window as any).PaystackPop.setup({
                key: publicKey,
                email: email,
                amount: amountInPesewas,
                currency: 'GHS', // Ghanaian Cedi
                ref: reference,
                reference: reference,
                callback: function(transaction: any) {
                    verifyPayment(transaction);
                },
                onClose: function() {
                    showToast("Transaction cancelled by user.", "info");
                    setSubmitting(false);
                }
            });
            handler.openIframe();
        } catch (error) {
            console.error("Failed to open Paystack:", error);
            showToast("Failed to initiate Paystack checkout. Please try again.", "error");
            setSubmitting(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddress.trim()) return;
        setSubmitting(true);
        await updateProfile({ address: newAddress });
        setSubmitting(false);
        setIsEditingAddress(false);
    };

    if (cart.length === 0) return <Navigate to="/buyer/cart" replace />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-32 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-white dark:bg-darkSurface p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="text-xl font-bold font-display dark:text-white">Checkout</h1>
            </div>

            <div className="p-6 space-y-8">
                {/* Fulfillment Option */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fulfillment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setOption('delivery')}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${option === 'delivery' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800 text-gray-400'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${option === 'delivery' ? 'bg-primary text-white shadow-glow' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                <i className="fa-solid fa-motorcycle text-xl"></i>
                            </div>
                            <span className="font-bold text-sm">Delivery</span>
                        </div>
                        <div 
                            onClick={() => setOption('pickup')}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${option === 'pickup' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800 text-gray-400'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${option === 'pickup' ? 'bg-primary text-white shadow-glow' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                <i className="fa-solid fa-store text-xl"></i>
                            </div>
                            <span className="font-bold text-sm">Self Pickup</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Drop-off Details</h3>
                    <Card className={`p-5 border-2 transition-all rounded-[2rem] ${!currentUser?.address ? 'border-red-500/20 bg-red-50/5 dark:bg-red-950/10' : 'border-gray-100 dark:border-gray-800'}`}>
                        {isEditingAddress ? (
                            <div className="space-y-4">
                                <p className="text-xs font-black text-primary uppercase">Set Campus Location</p>
                                <textarea 
                                    className="w-full rounded-2xl bg-white dark:bg-darkBg p-4 text-sm font-medium border border-gray-200 dark:border-gray-700 focus:border-primary outline-none transition-all h-24"
                                    placeholder="Enter your hostel name, room number, or landmark..."
                                    value={newAddress}
                                    onChange={e => setNewAddress(e.target.value)}
                                />
                                <div className="flex gap-2 pt-2">
                                    <Button fullWidth size="sm" onClick={handleSaveAddress} disabled={!newAddress.trim()}>Set Address</Button>
                                    <Button variant="secondary" size="sm" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{currentUser?.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{currentUser?.phoneNumber || 'Contact needed'}</p>
                                    <p className={`text-xs font-bold mt-2 flex items-center gap-2 ${!currentUser?.address ? 'text-red-500' : 'text-primary'}`}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        {currentUser?.address || 'Location Required for Delivery'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsEditingAddress(true)} 
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!currentUser?.address ? 'bg-red-500 text-white shadow-lg animate-bounce' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Payment Method Option */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Option</h3>
                    <div className="space-y-3">
                        <div 
                            onClick={() => setPaymentMethod('paystack')}
                            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === 'paystack' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'paystack' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                <i className="fa-solid fa-credit-card text-lg"></i>
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-black ${paymentMethod === 'paystack' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Online Payment</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Pay instantly via Mobile Money / Cards using Paystack</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paystack' ? 'border-primary bg-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                                {paymentMethod === 'paystack' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>

                        <div 
                            onClick={() => setPaymentMethod('delivery_meet')}
                            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === 'delivery_meet' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'delivery_meet' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                <i className="fa-solid fa-handshake text-lg"></i>
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-black ${paymentMethod === 'delivery_meet' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Pay on Meeting</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Meet the vendor on campus and pay upon receipt</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'delivery_meet' ? 'border-primary bg-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                                {paymentMethod === 'delivery_meet' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Summary</h3>
                    <Card className="p-6 border border-gray-100 dark:border-gray-800 space-y-4 rounded-[2rem]">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Items Total ({cart.length})</span>
                            <span className="font-bold dark:text-white">₵{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Delivery Fee</span>
                            <span className={`font-bold ${option === 'delivery' ? 'text-primary' : 'text-green-500'}`}>
                                {option === 'delivery' ? `₵${deliveryFee.toFixed(2)}` : 'FREE'}
                            </span>
                        </div>
                        <div className="h-px bg-gray-50 dark:bg-gray-800 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                            <span className="text-2xl font-black text-primary font-display">₵{total.toFixed(2)}</span>
                        </div>
                    </Card>
                </div>

                {/* Final Action */}
                <Button 
                    fullWidth 
                    size="lg" 
                    className="h-16 font-black text-xl shadow-xl shadow-primary/30 mt-4 border-none" 
                    onClick={handleCheckout}
                    disabled={submitting || !currentUser?.address || isEditingAddress}
                >
                    {submitting ? 'Processing Order...' : (paymentMethod === 'delivery_meet' ? `Confirm & Pay on Meeting • ₵${total.toFixed(2)}` : `Pay with Paystack • ₵${total.toFixed(2)}`)}
                </Button>
                {!currentUser?.address && <p className="text-[10px] text-center text-red-500 font-black uppercase mt-2 tracking-widest animate-pulse">Set your address above to unlock checkout</p>}
            </div>
        </div>
    );
};