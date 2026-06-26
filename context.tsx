
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Product, Vendor, Order, CartItem, Courier, Role, OrderStatus, ToastMessage, Notification as InAppNotification, Review } from './types';
import { supabase } from './supabaseClient';
import { INITIAL_LOCATION_CACHE, UPSA_LOCATION_CACHE } from './constants';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from './src/lib/firebase';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  currentUser: User | null;
  currentRole: Role;
  products: Product[];
  vendors: Vendor[];
  orders: Order[];
  cart: CartItem[];
  couriers: Courier[];
  users: User[];
  notifications: InAppNotification[];
  reviews: Review[];
  unreadCount: number;
  isLoading: boolean;
  isDataLoading: boolean;
  connectionError: boolean;
  favorites: string[];
  toast: ToastMessage | null;
  theme: ThemeMode;
  isThemeSwitchingAllowed: boolean;
  
  login: (email: string, password: string) => Promise<{success: boolean, role?: Role, error?: string}>;
  signup: (email: string, password: string, fullName: string, role: Role, phoneNumber?: string) => Promise<{success: boolean, error?: string, user?: any, role?: Role}>;
  login: (email: string, password: string) => Promise<{success: boolean, role?: Role, error?: string}>;
  signup: (email: string, password: string, fullName: string, role: Role, phoneNumber?: string) => Promise<{success: boolean, error?: string, user?: any, role?: Role}>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{success: boolean, error?: string}>;
  updatePassword: (password: string) => Promise<{success: boolean, error?: string}>;
  switchRole: (role: Role) => void;
  updateTheme: (theme: ThemeMode) => void;
  toggleThemeSwitching: (allowed: boolean) => void;
  
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean }>;
  submitContactMessage: (name: string, email: string, message: string) => Promise<{ success: boolean }>;
  requestPayout: (amount: number, method: string) => Promise<{ success: boolean }>;
  
  uploadFile: (file: File, folder: string) => Promise<string | null>;
  registerCourier: (data: Partial<Courier> & { phoneNumber?: string }, explicitUserId?: string) => Promise<{ success: boolean }>;
  registerVendor: (data: { storeName: string; storeDescription: string; location: string; contactPhone: string; storeAvatarUrl?: string }) => Promise<{ success: boolean }>;
  refreshData: () => Promise<void>;
  
  addProduct: (product: any) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  updateProductStatus: (id: string, status: Product['status']) => Promise<void>;
  toggleTrendingStatus: (id: string, isTrending: boolean) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (deliveryOption: 'delivery' | 'pickup', fee?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  assignDelivery: (orderId: string) => Promise<void>;
  toggleFavorite: (productId: string) => void;
  
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (payload: Partial<InAppNotification>) => Promise<boolean>;

  submitReview: (review: Omit<Review, 'createdAt' | 'user'>) => Promise<boolean>;

  banUser: (userId: string, status: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  approveVendor: (vendorId: string, status: boolean) => Promise<void>;
  approveCourier: (id: string, userId: string, status: 'approved' | 'rejected' | 'suspended') => Promise<void>;
  
  toggleDriverStatus: (isOnline: boolean) => Promise<void>;
  updateDriverLocation: (lat: number, lng: number) => Promise<void>;
  
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const resolveCoordinates = (locationName: string): {lat: number, lng: number} | undefined => {
    const clean = locationName.toLowerCase().trim();
    if (UPSA_LOCATION_CACHE[clean]) return { lat: UPSA_LOCATION_CACHE[clean][0], lng: UPSA_LOCATION_CACHE[clean][1] };
    if (INITIAL_LOCATION_CACHE[clean]) return { lat: INITIAL_LOCATION_CACHE[clean][0], lng: INITIAL_LOCATION_CACHE[clean][1] };
    return { lat: 5.6506, lng: -0.1962 }; 
};

const mapProduct = (p: any): Product => ({ 
    ...p, 
    vendorId: p.vendor_id, 
    contactPhone: p.contact_phone, 
    isTrending: p.is_trending 
});

const mapOrder = (o: any): Order => ({ 
    ...o, 
    vendorId: o.vendor_id, 
    buyerId: o.buyer_id, 
    courierId: o.courier_id, 
    deliveryFee: o.delivery_fee, 
    deliveryOption: o.delivery_option, 
    createdAt: o.created_at, 
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, 
    locationCoordinates: o.location_coordinates, 
    pickupCoordinates: o.pickup_coordinates 
});

const mapNotification = (n: any): InAppNotification => ({
    ...n, 
    userId: n.user_id, 
    targetRole: n.target_role,
    targetScope: n.target_scope, 
    relatedId: n.related_id,
    isRead: n.is_read, 
    createdAt: n.created_at
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>(() => {
      try { return (localStorage.getItem('lynqed_role') as Role) || 'guest'; } catch { return 'guest'; }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
      try { return JSON.parse(localStorage.getItem('lynqed_cart') || '[]'); } catch { return []; }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
      try { return JSON.parse(localStorage.getItem('lynqed_favs') || '[]'); } catch { return []; }
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
      try { return (localStorage.getItem('lynqed_theme_last') as ThemeMode) || 'system'; } catch { return 'system'; }
  });
  const [isThemeSwitchingAllowed, setIsThemeSwitchingAllowed] = useState<boolean>(() => {
      try { return localStorage.getItem('lynqed_sys_theme_allowed') !== 'false'; } catch { return true; }
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const hasInitializedData = useRef(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
      setToast({ id: Date.now(), message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (!isThemeSwitchingAllowed) {
        root.classList.remove('dark');
    } else {
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
    }
  }, [theme, isThemeSwitchingAllowed]);

  const fetchEssentialData = useCallback(async () => {
    const [pData, vData] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('vendors').select('*')
    ]);
    if (pData.data) setProducts(pData.data.map(mapProduct));
    if (vData.data) setVendors(vData.data.map((v: any) => ({ ...v, vendorId: v.vendor_id, storeName: v.store_name, storeDescription: v.store_description, storeAvatarUrl: v.store_avatar_url, userId: v.user_id, isApproved: v.is_approved, contactPhone: v.contact_phone, campus: v.campus })));
  }, []);

  const fetchHeavyData = useCallback(async (role: Role) => {
    if (role === 'guest') return;
    
    const requests: Promise<any>[] = [
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ];

    if (role === 'admin' || role === 'courier') {
      requests.push(supabase.from('couriers').select('*'));
    }

    if (role === 'admin') {
      requests.push(supabase.from('profiles').select('*'));
    }

    const results = await Promise.all(requests);
    
    if (results[0]?.data) setOrders(results[0].data.map(mapOrder));
    
    if (role === 'admin' || role === 'courier') {
       const courierData = results.find(r => r?.data && (r.data.length === 0 || 'vehicle_type' in r.data[0]));
       if (courierData?.data) setCouriers(courierData.data.map((d: any) => ({ ...d, userId: d.user_id, vehicleType: d.vehicle_type, onlineStatus: d.online_status, status: d.status, verified: d.status === 'approved', payoutMethod: d.payout_method })));
    }

    if (role === 'admin') {
       const profileData = results.find(r => r?.data && r.data.length > 0 && 'roles' in r.data[0]);
       if (profileData?.data) setUsers(profileData.data as any);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase.from('reviews').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false });
    if (data) {
        setReviews(data.map(r => ({
            ...r, productId: r.product_id, vendorId: r.vendor_id,
            userId: r.user_id, createdAt: r.created_at,
            user: { name: r.profiles?.name || 'User', avatarUrl: r.profiles?.avatar_url || '' }
        })));
    }
  }, []);

  const fetchNotifications = useCallback(async (userId: string, role: Role) => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},target_scope.eq.global,target_scope.eq.role`)
      .order('created_at', { ascending: false });
    
    if (data) {
        const filtered = data.filter(n => n.target_scope !== 'role' || n.target_role === role);
        setNotifications(filtered.map(mapNotification));
    }
  }, []);

  const initialize = useCallback(async () => {
    if (hasInitializedData.current) return;
    
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    await fetchEssentialData(); 
    
    if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (profile) {
            const user: User = { ...profile, roles: profile.roles || ['buyer'], avatarUrl: profile.avatar_url, phoneNumber: profile.phone_number, defaultLocation: profile.address };
            setCurrentUser(user);
            
            const persistedRole = localStorage.getItem('lynqed_role') as Role;
            const finalRole: Role = (persistedRole && user.roles.includes(persistedRole)) ? persistedRole : (user.roles.includes('admin') ? 'admin' : (user.roles.includes('vendor') ? 'vendor' : 'buyer'));
            setCurrentRole(finalRole);
            
            fetchNotifications(session.user.id, finalRole);
            fetchHeavyData(finalRole);
            
            // Initialize Push Notifications
            setupPushNotifications(session.user.id);
        }
    }
    
    fetchReviews();
    setIsLoading(false);
    hasInitializedData.current = true;
  }, [fetchEssentialData, fetchHeavyData, fetchNotifications, fetchReviews]);

  const setupPushNotifications = async (userId: string) => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
      }

      // Get FCM Token
      const token = await getToken(messaging, { 
          vapidKey: 'BF1eh32QaHeoxYyO8O9HzxWKpjYo_UN72YDBxiPvfMRL9IfFQEKGwa0c3AtxSen25ueyko62rnDO1BX-_9d9QGQ'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        // Save token to profile
        await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
      }

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          showToast(payload.notification.title || 'New Notification', 'info');
        }
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  useEffect(() => {
    initialize();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            if (!hasInitializedData.current || (currentUser && currentUser.id !== session.user.id)) {
                hasInitializedData.current = false; 
                initialize();
            }
        } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null); 
            setCurrentRole('guest'); 
            setNotifications([]);
            hasInitializedData.current = false;
        }
    });
    
    return () => { subscription.unsubscribe(); };
  }, [initialize, currentUser]);

  useEffect(() => {
    if (isLoading) return;
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          if (payload.eventType === 'INSERT') setProducts(prev => [mapProduct(payload.new), ...prev]);
          if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? mapProduct(payload.new) : p));
          if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          if (payload.eventType === 'INSERT') setOrders(prev => [mapOrder(payload.new), ...prev]);
          if (payload.eventType === 'UPDATE') setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
          if (payload.eventType === 'INSERT') {
              const mapped = mapNotification(payload.new);
              if (mapped.targetScope === 'global' || (mapped.targetScope === 'role' && mapped.targetRole === currentRole) || (mapped.userId === currentUser?.id)) {
                  setNotifications(prev => [mapped, ...prev]);
              }
          }
          if (payload.eventType === 'UPDATE') {
              setNotifications(prev => prev.map(n => n.id === payload.new.id ? mapNotification(payload.new) : n));
          }
          if (payload.eventType === 'DELETE') {
              setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isLoading, currentRole, currentUser?.id]);

  const login = async (email: string, pass: string): Promise<{success: boolean, role?: Role, error?: string}> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { success: false, error: error.message };
      if (!data?.user) return { success: false, error: "Auth session not found" };
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      const roles = profile?.roles || ['buyer'];
      const primaryRole: Role = roles.includes('admin') ? 'admin' : (roles.includes('vendor') ? 'vendor' : (roles.includes('courier') ? 'courier' : 'buyer'));
      
      const user: User = { ...profile, roles: roles, avatarUrl: profile?.avatar_url, phoneNumber: profile?.phone_number, defaultLocation: profile?.address };
      setCurrentUser(user);
      setCurrentRole(primaryRole);
      localStorage.setItem('lynqed_role', primaryRole);
      
      hasInitializedData.current = true;
      
      fetchNotifications(data.user.id, primaryRole);
      fetchHeavyData(primaryRole);
      
      return { success: true, role: primaryRole };
  };

  const signup = async (email: string, password: string, fullName: string, role: Role, phoneNumber?: string): Promise<{success: boolean, error?: string, user?: any, role?: Role}> => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) return { success: false, error: error.message };
      if (!data?.user) return { success: false, error: "Account creation failed" };
      
      if (data.user) {
           const roles: Role[] = role === 'buyer' ? ['buyer'] : ['buyer', role];
           const profileObj = { id: data.user.id, email, name: fullName, roles: roles, phone_number: phoneNumber };
           await supabase.from('profiles').insert(profileObj);
           
           const user: User = { 
               id: data.user.id, 
               email, 
               name: fullName, 
               roles: roles, 
               phoneNumber: phoneNumber,
               avatarUrl: undefined, 
               defaultLocation: undefined 
           };
           setCurrentUser(user);
           setCurrentRole(role);
           localStorage.setItem('lynqed_role', role);
           
           hasInitializedData.current = true;
           return { success: true, user: data.user, role }; 
      }
      return { success: false };
  };

  const logout = async () => { 
    await supabase.auth.signOut(); 
    hasInitializedData.current = false;
    setCurrentUser(null);
    setCurrentRole('guest');
    setNotifications([]);
  };
  
  const switchRoleLocal = (role: Role) => { if(currentUser?.roles.includes(role)) { setCurrentRole(role); localStorage.setItem('lynqed_role', role); showToast(`Mode: ${role}`, 'info'); fetchHeavyData(role); } };
  
  const updateProfile = async (data: Partial<User>) => { 
      if(!currentUser) return { success: false }; 
      const { error } = await supabase.from('profiles').update({ name: data.name, avatar_url: data.avatarUrl, phone_number: data.phoneNumber, address: data.address }).eq('id', currentUser.id); 
      if(!error) { setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null); return { success: true }; } 
      return { success: false }; 
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
      try {
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${file.name.split('.').pop()}`;
          const { error: upErr } = await supabase.storage.from('lynqed-assets').upload(`${folder}/${fileName}`, file);
          if (upErr) throw upErr;
          return supabase.storage.from('lynqed-assets').getPublicUrl(`${folder}/${fileName}`).data.publicUrl;
      } catch (e) { return null; }
  };

  const registerVendor = async (data: any): Promise<{ success: boolean }> => {
      if(!currentUser) return { success: false };
      const ex = vendors.find(v => v.userId === currentUser.id);
      const vid = ex?.vendorId || `v-${Date.now()}`;
      const { error } = await supabase.from('vendors').upsert({ vendor_id: vid, user_id: currentUser.id, store_name: data.storeName, store_description: data.storeDescription, location: data.location, contact_phone: data.contactPhone, store_avatar_url: data.storeAvatarUrl, is_approved: ex ? ex.isApproved : false, rating: ex ? ex.rating : 5.0, campus: data.campus }, { onConflict: 'user_id' });
      if (!error) { if (!currentUser.roles.includes('vendor')) await supabase.from('profiles').update({ roles: [...new Set([...currentUser.roles, 'vendor' as Role, 'buyer' as Role])] }).eq('id', currentUser.id); fetchEssentialData(); return { success: true }; }
      return { success: false };
  };

  const addProduct = async (prod: any) => {
      if(!currentUser) return false;
      const v = vendors.find(v => v.userId === currentUser.id);
      if(!v) return false;
      
      const { data, error } = await supabase.from('products').insert({ 
          vendor_id: v.vendorId, 
          title: prod.title, 
          description: prod.description, 
          price: prod.price, 
          category: prod.category, 
          images: prod.images, 
          stock: prod.stock, 
          status: 'pending', 
          location: prod.location, 
          campus: v.campus, 
          contact_phone: prod.contact_phone 
      }).select().single();
      
      if (!error && data) { 
          setProducts(prev => [mapProduct(data), ...prev]);
          showToast("Listing Published Successfully", "success"); 
          return true; 
      }
      return false;
  };

  const updateProduct = async (id: string, data: any) => { 
      const { data: updated, error } = await supabase.from('products').update({ ...data, contact_phone: data.contactPhone }).eq('id', id).select().single(); 
      if (!error && updated) {
          setProducts(prev => prev.map(p => p.id === id ? mapProduct(updated) : p));
          showToast("Listing Updated", "success");
      }
  };

  const deleteProduct = async (id: string) => { 
      const { error } = await supabase.from('products').delete().eq('id', id); 
      if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStatus = async (id: string, status: string) => { 
      const { data, error } = await supabase.from('products').update({status}).eq('id', id).select().single(); 
      if (!error && data) setProducts(prev => prev.map(p => p.id === id ? mapProduct(data) : p));
  };

  const toggleTrendingStatus = async (id: string, isTrending: boolean) => { 
      const { data, error } = await supabase.from('products').update({ is_trending: isTrending }).eq('id', id).select().single(); 
      if (!error && data) setProducts(prev => prev.map(p => p.id === id ? mapProduct(data) : p));
  };

  const addToCart = useCallback((p: Product, q = 1) => { setCart(prev => { const x = prev.find(i => i.productId === p.id); return x ? prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + q } : i) : [...prev, { productId: p.id, quantity: q, product: p }]; }); showToast(`Added ${p.title}`, "success"); }, [showToast]);
  const removeFromCart = useCallback((pid: string) => { setCart(prev => prev.filter(i => i.productId !== pid)); showToast("Removed", "info"); }, [showToast]);
  const updateCartQuantity = useCallback((pid: string, qty: number) => { if(qty <= 0) removeFromCart(pid); else { setCart(prev => prev.map(i => i.productId === pid ? { ...i, quantity: qty } : i)); } }, [removeFromCart]);
  const clearCart = useCallback(() => { setCart([]); }, []);

  const placeOrder = async (option: 'delivery'|'pickup', fee = 0) => {
      if (!currentUser) return;
      const byVendor: any = {};
      cart.forEach(i => { if(!byVendor[i.product.vendorId]) byVendor[i.product.vendorId]=[]; byVendor[i.product.vendorId].push(i); });
      try {
          for(const vid in byVendor) {
              const items = byVendor[vid];
              const subtotal = items.reduce((s:number, i:any) => s + i.product.price * i.quantity, 0);
              const vendor = vendors.find(v => v.vendorId === vid);
              const { data, error } = await supabase.from('orders').insert({ buyer_id: currentUser.id, vendor_id: vid, items, total: subtotal+fee, delivery_fee: fee, status: 'placed', delivery_option: option, pickup_coordinates: vendor ? resolveCoordinates(vendor.location) : undefined, location_coordinates: resolveCoordinates(currentUser.address || 'campus') }).select().single();
              if (vendor) await sendNotification({ userId: vendor.userId, type: 'new_order', title: 'New Order!', message: `₵${(subtotal+fee).toFixed(2)} order received from ${currentUser.name}.`, relatedId: data.id, priority: 'high' });
              if (!error && data) setOrders(prev => [mapOrder(data), ...prev]);
          }
          showToast("Order Placed!", "success"); clearCart();
      } catch (e) { showToast("Order failed", "error"); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => { 
      const { data, error } = await supabase.from('orders').update({status}).eq('id', orderId).select().single(); 
      if (!error && data) { 
          setOrders(prev => prev.map(o => o.id === orderId ? mapOrder(data) : o));
          const order = orders.find(o => o.id === orderId);
          if (order) {
              await sendNotification({ userId: order.buyerId, type: 'order_update', title: 'Order Update', message: `Order #${orderId.slice(-4)}: Status changed to ${status.replace('_', ' ')}.`, relatedId: orderId }); 
              
              // TRIGGER COURIER NOTIFICATION
              if (status === 'ready_for_pickup' && order.deliveryOption === 'delivery') {
                  await sendNotification({
                      targetRole: 'courier',
                      targetScope: 'role',
                      type: 'delivery',
                      title: 'New Delivery Available!',
                      message: `A new order is ready for delivery at ${order.vendorId.slice(-4)}. Claim it now!`,
                      relatedId: orderId,
                      priority: 'high'
                  });
              }
          }
      } 
  };

  const approveVendor = async (vid: string, s: boolean) => { const { error } = await supabase.from('vendors').update({ is_approved: s }).eq('vendor_id', vid); if (!error) fetchEssentialData(); };
  const approveCourier = async (id: string, userId: string, status: string) => { await supabase.from('couriers').update({status}).eq('id', id); fetchHeavyData(currentRole); };
  const toggleDriverStatus = async (isOn: boolean) => { if(!currentUser) return; const c = couriers.find(d => d.userId === currentUser.id); if(c) { await supabase.from('couriers').update({ online_status: isOn }).eq('id', c.id); fetchHeavyData(currentRole); } };
  const updateDriverLocation = async (lat: number, lng: number) => { if(!currentUser) return; const c = couriers.find(d => d.userId === currentUser.id); if(c) supabase.from('couriers').update({ current_lat: lat, current_lng: lng }).eq('id', c.id).then(); };
  const assignDelivery = async (oid: string) => { if (!currentUser) return; await supabase.from('orders').update({ courier_id: currentUser.id, status: 'courier_assigned' }).eq('id', oid); fetchHeavyData(currentRole); };
  
  const updateTheme = (t: ThemeMode) => { setTheme(t); localStorage.setItem('lynqed_theme_last', t); };
  const toggleThemeSwitching = (allowed: boolean) => { setIsThemeSwitchingAllowed(allowed); localStorage.setItem('lynqed_sys_theme_allowed', String(allowed)); };
  const resetPassword = async (email: string) => { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/#/update-password` }); return { success: !error, error: error?.message }; };
  const updatePassword = async (newPassword: string) => { const { error } = await supabase.auth.updateUser({ password: newPassword }); return { success: !error, error: error?.message }; };
  const toggleFavorite = useCallback((pid: string) => { const isRem = favorites.includes(pid); setFavorites(prev => isRem ? prev.filter(i => i !== pid) : [...prev, pid]); showToast(isRem ? 'Removed' : 'Saved', isRem ? 'info' : 'success'); }, [favorites, showToast]);
  
  const markNotificationRead = async (id: string) => { 
      // Update local state first for instant UI feedback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)); 
      
      // Update DB
      const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id); 
      
      if (error) {
          console.error("Failed to mark notification as read in DB:", error);
          // Rollback local state if DB update failed
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      }
  };

  const markAllNotificationsRead = async () => { 
      if (!currentUser) return; 
      
      const oldState = [...notifications];
      const visibleIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      if (visibleIds.length === 0) return;

      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); 
      
      // Target all current unread notifications in the DB
      const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', visibleIds);
      
      if (error) {
          console.error("Failed to mark all as read:", error);
          setNotifications(oldState);
      }
  };

  const deleteNotification = async (id: string) => { 
      setNotifications(prev => prev.filter(n => n.id !== id)); 
      await supabase.from('notifications').delete().eq('id', id); 
  };

  const sendNotification = useCallback(async (payload: Partial<InAppNotification>) => {
    const { error, data } = await supabase.from('notifications').insert({ 
      user_id: payload.userId || null, 
      target_role: payload.targetRole || null, 
      target_scope: payload.targetScope || 'individual', 
      type: payload.type || 'system', 
      title: payload.title || 'Notification', 
      message: payload.message || '', 
      related_id: payload.relatedId || null, 
      priority: payload.priority || 'normal', 
      is_read: false 
    }).select().single();

    if (!error && payload.userId) {
        // Trigger Push Notification via Backend
        fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: payload.userId,
                title: payload.title,
                body: payload.message,
                data: {
                    relatedId: payload.relatedId,
                    type: payload.type
                }
            })
        }).catch(err => console.error("Push delivery failed:", err));
    }

    return !error;
  }, []);

  const submitReview = useCallback(async (review: Omit<Review, 'createdAt' | 'user'>) => { try { const { error } = await supabase.from('reviews').upsert({ id: review.id || undefined, product_id: review.productId, vendor_id: review.vendorId, user_id: review.userId, rating: review.rating, comment: review.comment, images: review.images }); if (error) throw error; showToast("Review submitted!", "success"); fetchReviews(); return true; } catch (e) { showToast("Failed to submit review", "error"); return false; } }, [showToast, fetchReviews]);
  const banUser = async (uid: string, s: boolean) => { await supabase.from('profiles').update({isBanned: s}).eq('id', uid); fetchHeavyData(currentRole); };
  const deleteUser = async (uid: string) => { await supabase.from('profiles').delete().eq('id', uid); fetchHeavyData(currentRole); };
  const registerCourier = async (data: any, explicitUserId?: string): Promise<{ success: boolean }> => { const uid = explicitUserId || currentUser?.id; if(!uid) return { success: false }; const { error } = await supabase.from('couriers').insert({ user_id: uid, status: 'pending', full_name: data.fullName, vehicle_type: data.vehicle_type }); fetchHeavyData(currentRole); return { success: !error }; };
  const submitContactMessage = async (name: string, email: string, message: string) => { await supabase.from('contact_messages').insert({ name, email, message }); showToast("Sent!", "success"); return { success: true }; };
  const requestPayout = async (amount: number, method: string) => { if(!currentUser) return { success: false }; await supabase.from('payout_requests').insert({ user_id: currentUser.id, amount, method, status: 'pending' }); showToast("Requested", "success"); return { success: true }; };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const contextValue = useMemo(() => ({
    currentUser, currentRole, products, vendors, orders, cart, couriers, users, notifications, reviews, unreadCount, isLoading, isDataLoading, connectionError, favorites, toast, theme, isThemeSwitchingAllowed,
    login, signup, logout, resetPassword, updatePassword, switchRole: switchRoleLocal, updateTheme, toggleThemeSwitching,
    updateProfile, submitContactMessage, requestPayout, uploadFile, registerCourier, registerVendor, refreshData: fetchEssentialData,
    addProduct, updateProduct, updateProductStatus, toggleTrendingStatus, deleteProduct, addToCart, updateCartQuantity, removeFromCart, clearCart, placeOrder, updateOrderStatus, assignDelivery, toggleFavorite,
    markNotificationRead, markAllNotificationsRead, deleteNotification, sendNotification, submitReview, banUser, deleteUser, approveVendor, approveCourier, toggleDriverStatus, updateDriverLocation, showToast, hideToast
  }), [currentUser, currentRole, products, vendors, orders, cart, couriers, users, notifications, reviews, unreadCount, isLoading, isDataLoading, connectionError, favorites, toast, theme, isThemeSwitchingAllowed, addToCart, removeFromCart, updateCartQuantity, fetchEssentialData, sendNotification, submitReview, toggleFavorite]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};