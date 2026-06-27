
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context';
import { Button, Input, Card, Badge, Avatar, Spinner } from '../components/UI';
import { CATEGORIES } from '../constants';
import { OrderStatus, Product } from '../types';

// --- Utility: Ultra-Aggressive Image Compression ---
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    } else {
                        resolve(file); 
                    }
                }, 'image/jpeg', 0.6); 
            };
        };
    });
};

export const VendorDashboard: React.FC = () => {
  const { products, orders, currentUser, vendors, isDataLoading, logout, switchRole } = useApp();
  const navigate = useNavigate();
  
  const currentVendor = useMemo(() => vendors.find(v => v.userId === currentUser?.id), [vendors, currentUser]);
  const vendorId = currentVendor?.vendorId;

  if (!isDataLoading && currentVendor && !currentVendor.isApproved) {
       return (
           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg p-6 text-center">
               <div className="bg-white dark:bg-darkSurface p-8 rounded-[2.5rem] shadow-xl max-w-sm border border-gray-100 dark:border-gray-800 animate-slide-up">
                   <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 text-3xl shadow-inner">
                     <i className="fa-solid fa-hourglass-half animate-pulse"></i>
                   </div>
                   <h2 className="text-2xl font-display font-black mb-3 text-gray-900 dark:text-white leading-tight">Application Under Review</h2>
                   <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">Great news! Your store application is being vetted by our team. This usually takes less than 24 hours.</p>
                   
                   <div className="space-y-3">
                        <Button 
                            fullWidth 
                            variant="primary"
                            onClick={() => {
                                switchRole('buyer');
                                navigate('/buyer/dashboard');
                            }}
                            icon="bag-shopping"
                            className="shadow-glow"
                        >
                            Shop as Buyer
                        </Button>
                        <Button 
                            fullWidth 
                            variant="secondary" 
                            onClick={() => { logout(); navigate('/login'); }}
                            icon="right-from-bracket"
                        >
                            Sign Out
                        </Button>
                   </div>
                   
                   <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">LYNQED Merchant Services</p>
               </div>
           </div>
       );
  }

  if (!isDataLoading && !currentVendor && currentUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg p-6 flex-col text-center">
              <div className="bg-white dark:bg-darkSurface p-8 rounded-2xl shadow-lg max-w-sm">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-400 text-2xl">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Store Setup Incomplete</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">You have a vendor account but haven't set up your store details yet.</p>
                  <Button fullWidth onClick={() => navigate('/vendor/onboarding')}>Complete Store Setup</Button>
                  <button 
                    onClick={() => { switchRole('buyer'); navigate('/buyer/dashboard'); }}
                    className="mt-4 text-xs font-bold text-primary hover:underline"
                  >
                    Return to Marketplace
                  </button>
              </div>
          </div>
      )
  }

  const pendingOrders = useMemo(() => {
      return orders.filter(o => o.vendorId === vendorId && o.status !== 'delivered');
  }, [orders, vendorId]);

  const totalSales = useMemo(() => {
      return orders.filter(o => o.vendorId === vendorId).reduce((acc, curr) => {
          const saleValue = curr.total - (curr.deliveryFee || 0);
          return acc + saleValue;
      }, 0);
  }, [orders, vendorId]);

  return (
    <div className="p-4 min-h-screen bg-transparent pb-24 animate-fade-in pb-safe">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Merchant Center</h1>
            <Button size="sm" onClick={() => navigate('/vendor/products/new')}>+ Add Product</Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-5 border-l-4 border-primary bg-white dark:bg-darkSurface">
                <h3 className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Total Earnings</h3>
                <p className="text-2xl font-black mt-1 text-gray-900 dark:text-white">₵{totalSales.toFixed(2)}</p>
            </Card>
            <Card className="p-5 border-l-4 border-accent bg-white dark:bg-darkSurface">
                <h3 className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Live Orders</h3>
                <p className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{pendingOrders.length}</p>
            </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">Recent Activity</h3>
            <button onClick={() => navigate('/vendor/orders')} className="text-[10px] font-black text-primary hover:underline uppercase">View All</button>
        </div>
        
        <div className="space-y-3 mb-8">
            {pendingOrders.length === 0 ? <div className="text-center py-10 bg-white dark:bg-darkSurface rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800"><i className="fa-solid fa-receipt text-gray-200 text-3xl mb-2"></i><p className="text-xs font-bold text-gray-400 uppercase">No active orders</p></div> : 
             pendingOrders.slice(0, 3).map(order => (
                 <Card key={order.id} className="p-4" onClick={() => navigate('/vendor/orders')}>
                     <div className="flex justify-between mb-2">
                         <span className="font-bold text-sm dark:text-white">Order #{order.id.slice(-4)}</span>
                         <Badge color="blue">{order.status.replace('_', ' ')}</Badge>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{order.items.length} items • {order.deliveryOption}</p>
                 </Card>
             ))}
        </div>
    </div>
  );
};

export const VendorProducts: React.FC = () => {
    const { products, vendors, currentUser, isDataLoading, switchRole } = useApp();
    const navigate = useNavigate();
    const currentVendor = vendors.find(v => v.userId === currentUser?.id);

    if (!isDataLoading && !currentVendor) {
         return (
             <div className="p-8 text-center pt-20 bg-gray-50 dark:bg-darkBg min-h-screen">
                 <h2 className="text-xl font-bold mb-4 dark:text-white">Store Profile Missing</h2>
                 <Button onClick={() => navigate('/vendor/onboarding')}>Set Up Store</Button>
                 <button 
                    onClick={() => { switchRole('buyer'); navigate('/buyer/dashboard'); }}
                    className="block mx-auto mt-4 text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                  >
                    Go back to shopping
                  </button>
             </div>
         );
    }

    const myProducts = products.filter(p => p.vendorId === currentVendor?.vendorId);

    return (
        <div className="p-4 min-h-screen bg-transparent pb-24 animate-fade-in pb-safe">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">Active Listings</h1>
                <Button size="sm" onClick={() => navigate('/vendor/products/new')}>Add New</Button>
            </div>
            
            <div className="space-y-4">
                {myProducts.length === 0 ? <div className="text-center py-20 text-gray-400"><i className="fa-solid fa-box-open text-4xl mb-3 opacity-20"></i><p className="text-sm font-bold uppercase tracking-widest">No products yet</p></div> : (
                    myProducts.map(p => (
                        <div key={p.id} className="bg-white dark:bg-darkSurface p-3 rounded-3xl shadow-sm flex gap-4 items-center border border-gray-100 dark:border-gray-800 group hover:border-primary/30 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-900 flex-shrink-0 overflow-hidden relative border border-gray-50 dark:border-gray-800">
                                <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="flex-grow min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{p.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase mt-1">
                                    <span className="bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">{p.stock} In Stock</span>
                                </div>
                                <p className="font-black text-primary text-sm mt-1.5">₵{p.price}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 pr-2">
                                <Badge color={p.status === 'approved' ? 'green' : p.status === 'rejected' ? 'red' : 'yellow'} className="px-2 py-0.5 text-[8px]">{p.status}</Badge>
                                <button onClick={() => navigate(`/vendor/products/${p.id}/edit`)} className="text-gray-400 hover:text-primary transition-colors text-[10px] font-black uppercase"><i className="fa-solid fa-pen mr-1"></i> Edit</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export const VendorOrders: React.FC = () => {
    const { orders, updateOrderStatus, vendors, currentUser, refreshData } = useApp();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentVendor = vendors.find(v => v.userId === currentUser?.id);
    const vendorId = currentVendor?.vendorId;
    
    const myOrders = useMemo(() => orders.filter(o => o.vendorId === vendorId), [orders, vendorId]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setIsRefreshing(false);
    };

    useEffect(() => { 
        handleRefresh(); 
    }, []);

    const filteredOrders = myOrders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['placed', 'received', 'preparing', 'ready_for_pickup', 'assigned'].includes(o.status);
        if (filter === 'completed') return ['picked_up', 'in_route', 'delivered', 'declined', 'cancelled'].includes(o.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleStatusChange = async (e: React.MouseEvent, orderId: string, newStatus: OrderStatus) => {
        e.stopPropagation();
        await updateOrderStatus(orderId, newStatus);
    };

    const getNextAction = (status: OrderStatus, deliveryOption: 'delivery' | 'pickup') => {
        if (status === 'placed') return { label: 'Accept Order', next: 'received' as OrderStatus, icon: 'check', btnVariant: 'primary' as const };
        if (status === 'received') return { label: 'Start Preparing', next: 'preparing' as OrderStatus, icon: 'fire-burner', btnVariant: 'primary' as const };
        if (status === 'preparing') {
             return deliveryOption === 'delivery' 
                ? { label: 'Ready for Driver', next: 'ready_for_pickup' as OrderStatus, icon: 'box', btnVariant: 'primary' as const }
                : { label: 'Ready for Pickup', next: 'ready_for_pickup' as OrderStatus, icon: 'box', btnVariant: 'primary' as const };
        }
        if (status === 'ready_for_pickup' && deliveryOption === 'pickup') {
             return { label: 'Picked Up', next: 'delivered' as OrderStatus, icon: 'check', btnVariant: 'success' as const };
        }
        return null;
    };

    return (
        <div className="p-4 min-h-screen bg-transparent pb-24 animate-fade-in pb-safe">
            <div className="mb-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">Order Logs</h1>
                    <Button size="sm" variant="outline" onClick={handleRefresh} icon={isRefreshing ? 'spinner' : 'rotate'}>
                        {isRefreshing ? 'Syncing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-white dark:bg-darkSurface p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                {['active', 'completed', 'all'].map(f => (
                    <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-glow' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{f}</button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? <div className="text-center py-20 text-gray-400 opacity-30"><i className="fa-solid fa-receipt text-5xl mb-4"></i><p className="font-black uppercase tracking-widest text-xs">No entries found</p></div> : 
                    filteredOrders.map(order => {
                        const nextAction = getNextAction(order.status, order.deliveryOption);
                        return (
                            <Card key={order.id} className="p-5 border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-4 border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900 dark:text-white">#{order.id.slice(-4)}</span>
                                            <Badge color={order.deliveryOption === 'delivery' ? 'blue' : 'violet'} className="text-[8px] px-1.5 py-0.5">{order.deliveryOption}</Badge>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{new Date(order.createdAt).toLocaleDateString()} @ {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-lg text-primary">₵{order.total.toFixed(2)}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'text-green-500' : 'text-blue-500'}`}>{order.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-5 bg-gray-50 dark:bg-darkBg/50 p-4 rounded-[1.5rem]">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                            <span>{item.quantity}x {item.product.title}</span>
                                            <span className="text-gray-400">₵{(item.quantity * item.product.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    {['placed', 'received', 'preparing'].includes(order.status) && <Button size="sm" variant="danger" className="rounded-xl px-4" onClick={(e) => handleStatusChange(e, order.id, 'declined')}>Decline</Button>}
                                    {nextAction && <Button size="sm" variant={nextAction.btnVariant} className="rounded-xl px-4 font-black uppercase text-[10px] tracking-widest shadow-md" onClick={(e) => handleStatusChange(e, order.id, nextAction.next)} icon={nextAction.icon}>{nextAction.label}</Button>}
                                    {order.status === 'ready_for_pickup' && order.deliveryOption === 'delivery' && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest py-2 bg-blue-50 dark:bg-blue-900/10 px-4 rounded-xl">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                            Searching for rider...
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                }
            </div>
        </div>
    );
};

const ProductForm: React.FC<{
  initialData?: Partial<Product>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}> = ({ initialData, onSubmit, isLoading }) => {
  const { uploadFile, showToast } = useApp();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'Food',
    customCategory: '',
    stock: initialData?.stock || 1,
    location: initialData?.location || '',
    contactPhone: initialData?.contactPhone || '',
  });
  
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          // Explicitly cast to File[] to avoid 'unknown' issues in some environments
          const files = Array.from(e.target.files) as File[];
          const startIdx = images.length;
          
          const newPreviews = files.map(file => URL.createObjectURL(file));
          setImages(prev => [...prev, ...newPreviews].slice(0, 5));
          
          const newUploading = new Set(uploadingIndices);
          files.forEach((_, i) => newUploading.add(startIdx + i));
          setUploadingIndices(newUploading);

          files.forEach(async (file: File, i) => {
              const currentSlot = startIdx + i;
              try {
                  const optimizedFile = await compressImage(file);
                  const remoteUrl = await uploadFile(optimizedFile, 'products');
                  
                  if (remoteUrl) {
                      setImages(prev => {
                          const updated = [...prev];
                          updated[currentSlot] = remoteUrl;
                          return updated;
                      });
                  } else {
                      setImages(prev => prev.filter((_, idx) => idx !== currentSlot));
                      showToast(`Upload failed for ${file.name}`, 'error');
                  }
              } catch (err) {
                  showToast("Error processing image", "error");
              } finally {
                  setUploadingIndices(prev => {
                      const next = new Set(prev);
                      next.delete(currentSlot);
                      return next;
                  });
              }
          });

          if(fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const removeImage = (index: number) => {
      setImages(images.filter((_, i) => i !== index));
      setUploadingIndices(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (uploadingIndices.size > 0) {
          showToast("Images are still syncing. Please wait.", "info");
          return;
      }
      if (images.length === 0) {
          showToast("At least one image is required.", "error");
          return;
      }
      const finalCategory = formData.category === 'OTHER' ? formData.customCategory : formData.category;
      
      onSubmit({
          ...formData,
          category: finalCategory,
          images
      });
  };

  const isCustomCat = initialData?.category && !CATEGORIES.some(c => c.name === initialData.category);
  useEffect(() => {
      if (isCustomCat && initialData?.category) {
          setFormData(prev => ({...prev, category: 'OTHER', customCategory: initialData.category!}));
      }
  }, [isCustomCat]);

  const isAnyImageUploading = uploadingIndices.size > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-8">
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><i className="fa-solid fa-camera"></i></div>
                <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product Gallery</h3>
            </div>
            <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-3 gap-3 mb-2">
                    {images.map((img, idx) => {
                        const isUploading = uploadingIndices.has(idx);
                        return (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group bg-white dark:bg-darkBg border-2 border-white dark:border-gray-800 shadow-sm transition-all">
                                <img src={img} className={`w-full h-full object-cover transition-opacity duration-500 ${isUploading ? 'opacity-40 grayscale blur-[2px]' : 'opacity-100'}`} />
                                {isUploading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                                        <Spinner />
                                        <span className="text-[7px] font-black text-primary uppercase mt-1 tracking-widest">Syncing</span>
                                    </div>
                                )}
                                {!isUploading && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                        <button type="button" onClick={() => removeImage(idx)} className="text-white hover:text-red-400"><i className="fa-solid fa-trash-can text-lg"></i></button>
                                    </div>
                                )}
                                {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-lg">Main Cover</span>}
                            </div>
                        );
                    })}
                    {images.length < 5 && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition-all bg-white dark:bg-darkBg/50 shadow-inner group hover:scale-[0.98]"
                        >
                            <i className="fa-solid fa-plus text-xl mb-1 group-hover:rotate-90 transition-transform"></i>
                            <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Add Photo</span>
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleImageUpload} />
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center mt-3 tracking-widest flex items-center justify-center gap-2">
                    <i className="fa-solid fa-bolt text-primary"></i> 
                    Upload high-res photos. They will be optimized automatically.
                </p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-primary/10 flex items-center justify-center text-primary"><i className="fa-solid fa-info"></i></div>
                <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Listing Details</h3>
            </div>
            <div className="bg-white dark:bg-darkSurface p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm">
                <Input label="Item Name" icon="tag" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Spicy Jollof Rice (Large)" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Price (₵)" icon="coins" type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                    <Input label="Stock" icon="box-archive" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Product Category</label>
                    <select className="block w-full rounded-2xl border-transparent bg-gray-50/50 dark:bg-darkBg shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 py-3.5 px-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm appearance-none outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        <option value="OTHER">Other (Custom)</option>
                    </select>
                    {formData.category === 'OTHER' && <div className="mt-3"><Input placeholder="Enter category name" icon="pen-nib" value={formData.customCategory} onChange={e => setFormData({...formData, customCategory: e.target.value})} /></div>}
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Description</label>
                    <textarea className="block w-full rounded-2xl border-transparent bg-gray-50/50 dark:bg-darkBg shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm h-32 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Tell buyers more about what makes this special..." required />
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-red-900/10 flex items-center justify-center text-red-500"><i className="fa-solid fa-location-arrow"></i></div>
                <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Fulfillment Information</h3>
            </div>
            <div className="bg-white dark:bg-darkSurface p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm">
                <Input label="Drop-off/Map Location" icon="location-dot" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Jean Nelson Hall, Room 402" required />
                <Input label="Contact Phone (WhatsApp)" icon="phone" type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="050 123 4567" required />
            </div>
        </div>

        <div className="sticky bottom-4 z-20 px-2 pt-4">
            <Button fullWidth size="lg" type="submit" disabled={isLoading || isAnyImageUploading} className="h-16 text-lg shadow-glow font-black uppercase tracking-widest">
                {isLoading ? <><Spinner className="mr-2" /> Publishing...</> : <><i className="fa-solid fa-cloud-arrow-up mr-2"></i> {initialData ? 'Update Listing' : 'Publish Listing'}</>}
            </Button>
        </div>
    </form>
  );
};

export const AddProduct: React.FC = () => {
    const { addProduct, vendors, currentUser, isDataLoading } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        const success = await addProduct(data);
        if (success) {
            // Give the state a moment to reconcile before moving
            setTimeout(() => {
                setLoading(false);
                navigate('/vendor/products');
            }, 500);
        } else {
            setLoading(false);
            alert("Failed to publish listing. Please check your connection.");
        }
    };

    return (
        <div className="p-4 min-h-screen bg-transparent pb-safe animate-fade-in">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 w-10 h-10 bg-white dark:bg-darkSurface dark:text-white rounded-full shadow-sm flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-gray-900 dark:text-white font-display uppercase">List New Item</h1>
            </div>
            <ProductForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
    );
};

export const EditProduct: React.FC = () => {
    const { id } = useParams();
    const { products, updateProduct } = useApp();
    const navigate = useNavigate();
    const product = products.find(p => p.id === id);
    const [loading, setLoading] = useState(false);

    if (!product) return <div className="p-8 dark:text-white">Product not found</div>;

    const handleSubmit = async (data: any) => {
        setLoading(true);
        await updateProduct(id!, data);
        setLoading(false);
        navigate('/vendor/products');
    };

    return (
        <div className="p-4 min-h-screen bg-transparent pb-safe animate-fade-in">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 w-10 h-10 bg-white dark:bg-darkSurface dark:text-white rounded-full shadow-sm flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-gray-900 dark:text-white font-display uppercase">Update Listing</h1>
            </div>
            <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={loading} />
        </div>
    );
};

export const VendorOnboarding: React.FC = () => {
    const { registerVendor, uploadFile, switchRole } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ storeName: '', storeDescription: '', location: '', contactPhone: '' });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            setUploading(true);
            const optimized = await compressImage(e.target.files[0]);
            const url = await uploadFile(optimized as File, 'avatars');
            if(url) setAvatarUrl(url);
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await registerVendor({ ...formData, storeAvatarUrl: avatarUrl || undefined });
        setLoading(false);
        if (result.success) {
             alert("Application submitted! Your store is pending approval.");
             switchRole('buyer');
             navigate('/buyer/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-8 flex flex-col justify-center max-w-md mx-auto animate-slide-up">
            <div className="text-center mb-8">
                <div onClick={() => fileRef.current?.click()} className="w-32 h-32 bg-gray-50 dark:bg-darkSurface rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500 text-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden relative group transition-all shadow-soft">
                    {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 p-4 text-center"><i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i><span className="text-[10px] font-bold uppercase">Shop Photo</span></div>}
                </div>
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white">Setup Your Store</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Store Name" icon="store" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} required placeholder="e.g. Felix Gadgets" />
                <Input label="Short Description" icon="note-sticky" value={formData.storeDescription} onChange={e => setFormData({...formData, storeDescription: e.target.value})} required placeholder="What do you sell?" />
                <Input label="Campus Location" icon="location-crosshairs" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required placeholder="e.g. Legon Hall Annex B" />
                <Input label="Phone Number" icon="whatsapp" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} required placeholder="050 123 4567" type="tel" />
                <Button fullWidth size="lg" type="submit" disabled={loading || uploading}>{loading ? 'Processing...' : 'Launch My Store'}</Button>
            </form>
        </div>
    );
};