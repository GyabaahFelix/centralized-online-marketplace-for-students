
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Button, Card, Input, Badge, Avatar, Spinner } from '../components/UI';
import { useNavigate, Link } from 'react-router-dom';
import { Role, TransportType, Review } from '../types';
import { ReviewModal } from './Product';

// --- Order Progress Tracker ---
const OrderProgress: React.FC<{ order: any }> = ({ order }) => {
    const steps = order.deliveryOption === 'delivery' 
        ? ['placed', 'received', 'preparing', 'courier_assigned', 'delivering', 'delivered']
        : ['placed', 'received', 'preparing', 'ready_for_pickup', 'delivered'];
    
    const currentIndex = steps.indexOf(order.status);
    
    return (
        <div className="py-4">
            <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0"></div>
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
                ></div>
                {steps.map((step, idx) => (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${idx <= currentIndex ? 'bg-primary border-primary' : 'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-700'}`}></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Start</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{order.status.replace('_', ' ')}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Done</span>
            </div>
        </div>
    );
};

const ProfileHeader: React.FC = () => {
    const { currentUser, currentRole, updateProfile, uploadFile } = useApp();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || '');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            setUploading(true);
            const url = await uploadFile(e.target.files[0], 'avatars');
            if(url) await updateProfile({ avatarUrl: url });
            setUploading(false);
        }
    };

    const handleSave = async () => {
        await updateProfile({ name });
        setEditing(false);
    };

    return (
        <div className="bg-white dark:bg-darkSurface p-8 rounded-b-[3rem] shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
            
            <div className="flex justify-center mb-6 relative">
                <div className="relative group">
                    <Avatar src={currentUser?.avatarUrl} name={currentUser?.name || ''} size="2xl" className="border-4 border-white dark:border-darkBg shadow-xl" />
                    <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary transition-all scale-90">
                        <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'} text-sm`}></i>
                    </button>
                </div>
                <input type="file" ref={fileRef} hidden onChange={handleAvatar} />
            </div>

            {editing ? (
                <div className="space-y-4 max-w-xs mx-auto animate-fade-in">
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Display Name" className="text-center" />
                    <div className="flex gap-2">
                        <Button fullWidth size="sm" onClick={handleSave}>Save Name</Button>
                        <Button variant="secondary" fullWidth size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="inline-flex px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-primary/20">
                        {currentRole} Mode
                    </div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white leading-tight">{currentUser?.name}</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1">{currentUser?.email}</p>
                    <button onClick={() => setEditing(true)} className="mt-5 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primaryDark flex items-center justify-center gap-2 mx-auto">
                        <i className="fa-solid fa-pen-to-square"></i> Edit Name
                    </button>
                </div>
            )}
        </div>
    );
};

const AddressSection: React.FC = () => {
    const { currentUser, updateProfile } = useApp();
    const [editing, setEditing] = useState(false);
    const [address, setAddress] = useState(currentUser?.address || '');

    const handleSave = async () => {
        await updateProfile({ address });
        setEditing(false);
    };

    return (
        <div className="px-4 mt-8 animate-fade-in">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4">Saved Address</h3>
            <Card className="p-6 border-gray-100 dark:border-gray-800 bg-white dark:bg-darkSurface shadow-sm">
                {editing ? (
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Current Campus Location</p>
                        <textarea 
                            className="w-full rounded-2xl bg-gray-50 dark:bg-darkBg p-4 text-sm font-medium border border-gray-200 dark:border-gray-800 focus:border-primary outline-none transition-all h-24"
                            placeholder="Enter your hostel name, room number, or landmark..."
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button fullWidth onClick={handleSave}>Save Address</Button>
                            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 flex-shrink-0">
                            <i className="fa-solid fa-location-dot text-xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Delivery Hub</h4>
                            <p className={`text-sm mt-1 font-medium truncate ${currentUser?.address ? 'text-gray-600 dark:text-gray-300' : 'text-red-500 animate-pulse'}`}>
                                {currentUser?.address || 'Address Required for Orders'}
                            </p>
                        </div>
                        <button 
                            onClick={() => setEditing(true)}
                            className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary transition-all flex items-center justify-center border border-gray-100 dark:border-gray-700"
                        >
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

const PreferenceSection: React.FC = () => {
    const { currentRole } = useApp();
    const [prefs, setPrefs] = useState({ orders: true, delivery: true, marketing: false, system: true });

    const Toggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
            <button 
                onClick={onClick}
                className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${active ? 'bg-primary shadow-glow' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );

    return (
        <div className="px-4 mt-8 animate-fade-in">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4">Communication</h3>
            <Card className="p-6 bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800 shadow-sm">
                <Toggle label="Order Updates" active={prefs.orders} onClick={() => setPrefs(p => ({...p, orders: !p.orders}))} />
                {currentRole !== 'buyer' && <Toggle label="Delivery Requests" active={prefs.delivery} onClick={() => setPrefs(p => ({...p, delivery: !p.delivery}))} />}
                <Toggle label="Campus Announcements" active={prefs.marketing} onClick={() => setPrefs(p => ({...p, marketing: !p.marketing}))} />
                <Toggle label="System Notifications" active={prefs.system} onClick={() => setPrefs(p => ({...p, system: !p.system}))} />
            </Card>
        </div>
    );
};

const StoreSettings: React.FC = () => {
    const { vendors, currentUser, uploadFile, registerVendor, showToast } = useApp();
    const vendor = vendors.find(v => v.userId === currentUser?.id);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [stagedFile, setStagedFile] = useState<File | null>(null);

    const [storeDetails, setStoreDetails] = useState({
        storeName: vendor?.storeName || '',
        storeDescription: vendor?.storeDescription || '',
        location: vendor?.location || '',
        contactPhone: vendor?.contactPhone || ''
    });

    useEffect(() => {
        if (vendor) {
            setStoreDetails({
                storeName: vendor.storeName,
                storeDescription: vendor.storeDescription || '',
                location: vendor.location,
                contactPhone: vendor.contactPhone || ''
            });
        }
    }, [vendor]);
    
    const fileRef = useRef<HTMLInputElement>(null);
    if (!vendor) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStagedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handlePhotoSave = async () => {
        if (!stagedFile) return;
        setUploading(true);
        const url = await uploadFile(stagedFile, 'avatars'); 
        if(url) {
            const result = await registerVendor({ ...storeDetails, storeAvatarUrl: url });
            if (result.success) {
                showToast("Store photo updated!", "success");
                setStagedFile(null);
                setPreviewUrl(null);
            }
        }
        setUploading(false);
    };

    return (
        <div className="px-4 mt-8 animate-fade-in">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4">Shop Presence</h3>
            <Card className="p-6 bg-white dark:bg-darkSurface border-gray-100 dark:border-gray-800 relative group overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-primary shadow-lg bg-gray-100 dark:bg-gray-900 group relative">
                            <img src={previewUrl || vendor.storeAvatarUrl || ''} className="w-full h-full object-cover" />
                            {uploading && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"><Spinner /></div>}
                        </div>
                        <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center transition-all border-4 border-white dark:border-darkSurface"><i className="fa-solid fa-camera text-xs"></i></button>
                        <input type="file" ref={fileRef} hidden onChange={handlePhotoChange} accept="image/*" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        {previewUrl && !uploading && (
                            <div className="flex gap-2 justify-center md:justify-start mb-2"><Button size="sm" onClick={handlePhotoSave}>Save</Button><Button size="sm" variant="secondary" onClick={() => setPreviewUrl(null)}>Discard</Button></div>
                        )}
                        <h4 className="text-xl font-display font-black text-gray-900 dark:text-white mb-1">{vendor.storeName}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 {vendor.location}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const SettingsList: React.FC = () => {
    const { logout, currentUser, theme, updateTheme, isThemeSwitchingAllowed, switchRole, currentRole, cart, favorites } = useApp();
    const navigate = useNavigate();
    const [showThemeModal, setShowThemeModal] = useState(false);

    const ActionItem = ({ icon, label, onClick, danger, rightContent, subLabel }: { icon: string, label: string, onClick: () => void, danger?: boolean, rightContent?: React.ReactNode, subLabel?: string }) => (
        <div onClick={onClick} className={`flex items-center justify-between p-5 bg-white dark:bg-darkSurface rounded-3xl cursor-pointer active:scale-[0.98] transition-all border border-gray-50 dark:border-transparent hover:border-primary/20 group shadow-sm mb-3`}>
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${danger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}><i className={`fa-solid fa-${icon} text-base`}></i></div>
                <div>
                    <p className={`text-sm font-black tracking-tight ${danger ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>{label}</p>
                    {subLabel && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">{subLabel}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3">{rightContent}<i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i></div>
        </div>
    );

    if (!currentUser) return null;
    return (
        <div className="px-4 mt-10">
            {currentUser.roles.length > 1 && (
                <div className="mb-8">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4">Identity Switch</h3>
                    {currentUser.roles.filter(r => r !== currentRole && r !== 'guest').map(role => (
                        <div key={role} onClick={() => switchRole(role)} className="p-5 bg-indigo-50/50 dark:bg-primary/10 border border-primary/20 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-[0.98] mb-3 transition-all hover:shadow-lg"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><i className={`fa-solid fa-${role === 'vendor' ? 'store' : role === 'courier' ? 'motorcycle' : 'user'} text-lg`}></i></div><div><p className="text-sm font-black text-primary uppercase tracking-tight">Active as {role}</p><p className="text-[10px] text-primary/60 font-bold uppercase">Tap to swap view</p></div></div><i className="fa-solid fa-arrow-right-arrow-left text-primary/40"></i></div>
                    ))}
                </div>
            )}
            
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4">My Dashboard</h3>
            <ActionItem 
                icon="receipt" 
                label="Orders History" 
                onClick={() => navigate('/buyer/orders')} 
                subLabel="Track deliveries"
            />
            <ActionItem 
                icon="heart" 
                label="Saved Items" 
                onClick={() => navigate('/buyer/wishlist')} 
                rightContent={favorites.length > 0 ? <Badge color="red">{favorites.length}</Badge> : null}
                subLabel="Your wishlist"
            />

            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4 mt-8">Preferences</h3>
            {isThemeSwitchingAllowed && <ActionItem icon="palette" label="Interface Theme" onClick={() => setShowThemeModal(true)} rightContent={<span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">{theme}</span>} />}
            <ActionItem icon="power-off" label="Sign Out" danger onClick={async () => { await logout(); navigate('/'); }} />
            
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1 mb-4 mt-8">Support</h3>
            <ActionItem icon="circle-info" label="About LYNQED" onClick={() => navigate('/about')} />
            <ActionItem icon="headset" label="Help Center" onClick={() => navigate('/faq')} />

            {showThemeModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in px-4">
                    <Card className="p-8 w-full max-sm rounded-[3rem] animate-slide-up bg-white dark:bg-darkSurface"><div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black dark:text-white font-display">Appearance</h3><button onClick={() => setShowThemeModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><i className="fa-solid fa-xmark"></i></button></div><div className="space-y-3">{['light', 'dark', 'system'].map(mode => <div key={mode} onClick={() => { updateTheme(mode as any); setShowThemeModal(false); }} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${theme === mode ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}><span className="font-black text-sm capitalize">{mode} Mode</span>{theme === mode && <i className="fa-solid fa-circle-check text-xl"></i>}</div>)}</div></Card>
                </div>
            )}
        </div>
    );
};

export const UserProfile: React.FC = () => {
    const { currentRole } = useApp();
    return <div className="pb-safe animate-fade-in bg-gray-50 dark:bg-darkBg min-h-screen pb-24"><ProfileHeader /><AddressSection /><PreferenceSection />{currentRole === 'vendor' && <StoreSettings />}<SettingsList /></div>;
};

export const OrdersPage: React.FC = () => {
    const { orders, currentUser, reviews } = useApp();
    const navigate = useNavigate();
    const [reviewTarget, setReviewTarget] = useState<{pid: string, vid: string, review?: Review} | null>(null);

    const myOrders = orders.filter(o => o.buyerId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-24 animate-fade-in">
             <div className="bg-white dark:bg-darkSurface p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="text-xl font-bold font-display dark:text-white">Order History</h1>
            </div>
            <div className="p-4 space-y-4">
                {myOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400"><i className="fa-solid fa-box-open text-4xl mb-4 opacity-20"></i><p>No orders yet.</p><Button className="mt-4" onClick={() => navigate('/buyer/dashboard')}>Browse Products</Button></div>
                ) : (
                    myOrders.map(order => (
                        <Card key={order.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">Order #{order.id.slice(-4)}</span>
                                <Badge color={order.status === 'delivered' ? 'green' : 'blue'}>{order.status.replace('_', ' ')}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-4"><span>{new Date(order.createdAt).toLocaleDateString()}</span><span className="font-bold text-gray-900 dark:text-white">₵{order.total.toFixed(2)}</span></div>
                            <div className="space-y-3 mb-4">
                                {order.items.map((item, idx) => {
                                    const existingReview = reviews.find(r => r.productId === item.productId && r.userId === currentUser?.id);
                                    return (
                                        <div key={idx} className="flex justify-between items-center">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.quantity}x {item.product.title}</p>
                                            {order.status === 'delivered' && (
                                                <button 
                                                    onClick={() => setReviewTarget({ pid: item.productId, vid: order.vendorId, review: existingReview })} 
                                                    className="text-[10px] font-black uppercase text-primary border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary/5 transition-all"
                                                >
                                                    {existingReview ? 'Edit Review' : 'Rate Item'}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <OrderProgress order={order} />
                        </Card>
                    ))
                )}
            </div>
            {reviewTarget && (
                <ReviewModal 
                    productId={reviewTarget.pid} 
                    vendorId={reviewTarget.vid} 
                    existingReview={reviewTarget.review}
                    onClose={() => setReviewTarget(null)} 
                />
            )}
        </div>
    );
};

export const WishlistPage: React.FC = () => {
    const { products, favorites, toggleFavorite, addToCart } = useApp();
    const navigate = useNavigate();
    const wishlistItems = products.filter(p => favorites.includes(p.id));
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkBg pb-24 animate-fade-in"><div className="bg-white dark:bg-darkSurface p-4 shadow-sm sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800"><button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"><i className="fa-solid fa-arrow-left"></i></button><h1 className="text-xl font-bold font-display dark:text-white">My Wishlist</h1></div><div className="p-3">{wishlistItems.length === 0 ? (<div className="text-center py-20 text-gray-400"><i className="fa-solid fa-heart-crack text-4xl mb-4 opacity-20"></i><p className="font-bold">Wishlist is empty</p></div>) : (<div className="grid grid-cols-3 gap-2.5">{wishlistItems.map(product => (<Card key={product.id} className="p-0 overflow-hidden group border border-gray-100 dark:border-gray-800" onClick={() => navigate(`/buyer/product/${product.id}`)}><div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-900"><img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110" /><button className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-sm" onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}><i className="fa-solid fa-heart text-[8px]"></i></button></div><div className="p-2"><h3 className="text-[9px] font-bold text-gray-800 dark:text-white line-clamp-1">{product.title}</h3><div className="flex justify-between items-center mt-1.5"><span className="text-[10px] font-black text-primary">₵{product.price}</span><button className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center" onClick={e => { e.stopPropagation(); addToCart(product); }}><i className="fa-solid fa-plus text-[8px]"></i></button></div></div></Card>))}</div>)}</div></div>
    );
};