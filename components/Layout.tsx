
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Toast, Avatar } from './UI';
import { LOGO_URL } from '../constants';
import { NotificationCenter } from './Notifications';

export const BottomNav: React.FC = () => {
  const { currentRole, cart, unreadCount } = useApp();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (currentRole === 'admin') return null;
  
  const isAuthPage = location.pathname.startsWith('/auth') || location.pathname === '/' || location.pathname === '/forgot-password' || location.pathname === '/update-password' || location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;
  if (location.pathname.includes('/product/') || location.pathname.includes('/checkout')) return null;

  const NavItem = ({ to, icon, label, active, badge }: { to: string, icon: string, label: string, active: boolean, badge?: number }) => (
    <Link to={to} className="relative flex-1 flex flex-col items-center justify-center group active:scale-95 transition-transform">
       <div className="relative">
           <i className={`fa-solid fa-${icon} text-xl mb-1 transition-all ${active ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}></i>
           {badge ? (
               <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-darkSurface animate-pulse">
                   {badge > 9 ? '9+' : badge}
               </span>
           ) : null}
       </div>
       <span className={`text-[10px] font-bold transition-colors ${active ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
    </Link>
  );

  const CentralCartButton = () => (
    <Link 
      to="/buyer/cart" 
      className="relative -top-6 flex flex-col items-center justify-center group z-50 px-2"
    >
      <div className={`w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white dark:border-darkBg transition-all active:scale-90 group-hover:scale-105 ${location.pathname === '/buyer/cart' ? 'scale-110 ring-4 ring-primary/20' : ''}`}>
        <i className="fa-solid fa-cart-shopping text-white text-xl"></i>
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-darkBg animate-bounce-slight shadow-sm">
            {cart.length}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <>
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[75px] bg-white/95 dark:bg-darkSurface/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center z-40 pb-safe px-2">
        {currentRole === 'vendor' ? (
            <>
              <NavItem to="/vendor/dashboard" icon="chart-pie" label="Stats" active={location.pathname === '/vendor/dashboard'} />
              <NavItem to="/vendor/products" icon="box-open" label="Shop" active={location.pathname === '/vendor/products'} />
              <NavItem to="/vendor/orders" icon="receipt" label="Orders" active={location.pathname === '/vendor/orders'} />
              <button 
                  onClick={() => setIsNotifOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center relative active:scale-95 transition-all"
              >
                  <div className="relative">
                      <i className="fa-solid fa-bell text-xl mb-1 text-gray-400 dark:text-gray-500"></i>
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-darkSurface animate-pulse"></span>}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Inbox</span>
              </button>
              <NavItem to="/vendor/profile" icon="user" label="Profile" active={location.pathname === '/vendor/profile'} />
            </>
        ) : (
            <>
              <NavItem to="/buyer/dashboard" icon="house" label="Home" active={location.pathname === '/buyer/dashboard'} />
              <NavItem to="/buyer/search" icon="magnifying-glass" label="Map" active={location.pathname === '/buyer/search'} />
              <CentralCartButton />
              <button 
                  onClick={() => setIsNotifOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center relative active:scale-95 transition-all"
              >
                  <div className="relative">
                      <i className="fa-solid fa-bell text-xl mb-1 text-gray-400 dark:text-gray-500"></i>
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-darkSurface animate-pulse"></span>}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Inbox</span>
              </button>
              <NavItem to="/buyer/profile" icon="user" label="Me" active={location.pathname === '/buyer/profile'} />
            </>
        )}
      </div>
    </>
  );
};

export const Navbar: React.FC = () => {
  const { currentUser, currentRole, logout, switchRole, cart, favorites, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isAuthPage = location.pathname === '/' || location.pathname.startsWith('/auth') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/update-password';
  if (isAuthPage) return null;

  const isAdmin = currentUser?.roles.includes('admin');

  const NavLink = ({ to, label, icon, active }: { to: string, label: string, icon: string, active: boolean }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active 
        ? 'bg-primary/10 text-primary shadow-sm' 
        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-800'
      }`}
    >
      <i className={`fa-solid fa-${icon} text-xs`}></i>
      {label}
    </Link>
  );

  return (
    <>
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <nav className="sticky top-0 z-40 w-full glass border-b border-gray-100 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
               <img 
                 src={LOGO_URL} 
                 className="h-16 w-16 rounded-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-md border-2 border-white dark:border-gray-800" 
               />
               <span className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tighter">LYNQED</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {currentRole === 'vendor' ? (
                <>
                  <NavLink to="/vendor/dashboard" label="Stats" icon="chart-pie" active={location.pathname === '/vendor/dashboard'} />
                  <NavLink to="/vendor/products" label="Shop" icon="box-open" active={location.pathname === '/vendor/products'} />
                  <NavLink to="/vendor/orders" label="Orders" icon="receipt" active={location.pathname === '/vendor/orders'} />
                </>
              ) : currentRole === 'buyer' ? (
                <>
                  <NavLink to="/buyer/dashboard" label="Home" icon="house" active={location.pathname === '/buyer/dashboard'} />
                  <NavLink to="/buyer/search" label="Map" icon="location-dot" active={location.pathname === '/buyer/search'} />
                  <NavLink to="/buyer/orders" label="Orders" icon="box" active={location.pathname === '/buyer/orders'} />
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
               {currentUser ? (
                 (currentRole as string) === 'admin' ? (
                   <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl select-none">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Admin Mode</span>
                   </div>
                 ) : (
                  <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <button 
                        onClick={() => setIsNotifOpen(true)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/40 dark:hover:bg-gray-800 transition-all text-gray-500 group"
                    >
                        <i className={`fa-solid fa-bell text-xl transition-all ${unreadCount > 0 ? 'text-primary animate-bounce-slight' : ''}`}></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-darkBg animate-pulse shadow-glow"></span>
                        )}
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => setShowDropdown(!showDropdown)} 
                        className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-white/60 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-white dark:hover:border-gray-700"
                      >
                        <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="sm" className="shadow-sm" />
                        <span className="hidden sm:block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">{currentUser.name.split(' ')[0]}</span>
                        <i className={`fa-solid fa-chevron-down text-[8px] text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}></i>
                      </button>
                      
                      {showDropdown && (
                          <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                              <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 border border-white/50 dark:border-white/5 overflow-hidden animate-fade-in p-2.5">
                                  <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2 bg-gray-50/50 dark:bg-darkBg/50 rounded-2xl">
                                      <p className="text-sm font-black text-gray-900 dark:text-white font-display truncate">{currentUser.name}</p>
                                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mt-1">{currentRole} mode</p>
                                  </div>
                                  
                                  {isAdmin && (currentRole as string) !== 'admin' && (
                                    <button 
                                      onClick={() => { switchRole('admin'); navigate('/admin/dashboard'); setShowDropdown(false); }}
                                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-black text-primary rounded-2xl bg-primary/5 hover:bg-primary hover:text-white transition-all duration-300 group mb-1 border border-primary/10"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm transition-colors">
                                            <i className="fa-solid fa-shield-halved"></i>
                                        </div>
                                        Admin Panel
                                        <i className="fa-solid fa-arrow-right text-[8px] ml-auto opacity-50 group-hover:translate-x-1 transition-all"></i>
                                    </button>
                                  )}

                                  {currentRole === 'buyer' && (
                                    <>
                                      <Link 
                                        to="/buyer/cart" 
                                        className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 group mb-1"
                                        onClick={() => setShowDropdown(false)}
                                      >
                                          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                              <i className="fa-solid fa-cart-shopping"></i>
                                          </div>
                                          My Cart
                                          {cart.length > 0 && <span className="ml-auto bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-primary">{cart.length}</span>}
                                      </Link>
                                      <Link 
                                        to="/buyer/wishlist" 
                                        className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 group mb-1"
                                        onClick={() => setShowDropdown(false)}
                                      >
                                          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                              <i className="fa-solid fa-heart"></i>
                                          </div>
                                          My Wishlist
                                          {favorites.length > 0 && <span className="ml-auto bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-primary">{favorites.length}</span>}
                                      </Link>
                                    </>
                                  )}

                                  {currentRole !== 'admin' && (
                                    <Link 
                                      to={currentRole === 'vendor' ? "/vendor/profile" : "/buyer/profile"} 
                                      className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 group mb-1"
                                      onClick={() => setShowDropdown(false)}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                            <i className="fa-solid fa-user-gear"></i>
                                        </div>
                                        Profile Settings
                                        <i className="fa-solid fa-chevron-right text-[8px] ml-auto opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                                    </Link>
                                  )}
                                  
                                  <button 
                                    onClick={async () => { await logout(); navigate('/'); }} 
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300 group"
                                  >
                                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                          <i className="fa-solid fa-power-off"></i>
                                      </div>
                                      Sign Out
                                      <i className="fa-solid fa-arrow-right-from-bracket text-[10px] ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                                  </button>
                              </div>
                          </>
                      )}
                    </div>
                  </div>
               )
             ) : (
               <Link to="/login" className="bg-primary text-white text-xs font-black uppercase px-5 py-2 rounded-full shadow-lg hover:shadow-glow hover:-translate-y-0.5 transition-all active:scale-95">Login</Link>
             )}
          </div>
        </div>
      </nav>
    </>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast, hideToast } = useApp();
  const location = useLocation();
  const isSearchPage = location.pathname === '/buyer/search';
  const isWelcome = location.pathname === '/';

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-800 dark:text-slate-200 overflow-x-hidden">
      {/* RADIANT DECORATIVE BLOBS (Light Mode Only) */}
      <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden dark:hidden">
          <div className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] bg-pink-200/50 rounded-full blur-[140px] animate-blob"></div>
          <div className="absolute bottom-[-15%] right-[-15%] w-[80vw] h-[80vw] bg-indigo-200/50 rounded-full blur-[160px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[35%] right-[5%] w-[45vw] h-[45vw] bg-purple-100/40 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
          <div className="absolute top-[60%] left-[-10%] w-[40vw] h-[40vw] bg-rose-100/40 rounded-full blur-[110px] animate-blob animation-delay-3000"></div>
      </div>
      
      <Toast toast={toast} onClose={hideToast} />
      {!isWelcome && !isSearchPage && <Navbar />}
      <main className="flex-grow flex flex-col pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
};