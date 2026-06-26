import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Button, Badge, Card, Avatar, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Role, NotificationScope, NotificationPriority } from '../types';

type AdminView = 'dashboard' | 'users' | 'vendors' | 'products' | 'logistics' | 'broadcast' | 'system';

export const AdminDashboard: React.FC = () => {
  const { 
    products, users, vendors, orders, couriers,
    updateProductStatus, toggleTrendingStatus, deleteProduct, 
    approveVendor, banUser, approveCourier, sendNotification,
    logout, theme, updateTheme, isThemeSwitchingAllowed, toggleThemeSwitching, showToast
  } = useApp();
  
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Broadcast State ---
  const [bcScope, setBcScope] = useState<NotificationScope>('global');
  const [bcRole, setBcRole] = useState<Role>('buyer');
  const [bcUserId, setBcUserId] = useState('');
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcPriority, setBcPriority] = useState<NotificationPriority>('normal');
  const [isSending, setIsSending] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Stats
  const revenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingProducts = products.filter(p => p.status === 'pending');
  const trendingProductsCount = products.filter(p => p.isTrending).length;
  const pendingVendors = vendors.filter(v => !v.isApproved);
  const pendingCouriers = couriers.filter(d => d.status === 'pending');
  const activeUserCount = users.filter(u => !u.isBanned).length;

  const filteredUsersForSearch = useMemo(() => {
      if (!userSearch) return [];
      return users.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 5);
  }, [users, userSearch]);

  const handleSendBroadcast = async () => {
      if (!bcTitle || !bcMessage) return showToast("Please fill title and message", "error");
      if (bcScope === 'individual' && !bcUserId) return showToast("Select a target user", "error");

      setIsSending(true);
      const success = await sendNotification({
          userId: bcScope === 'individual' ? bcUserId : undefined,
          targetRole: bcScope === 'role' ? bcRole : undefined,
          targetScope: bcScope,
          type: 'system',
          title: bcTitle,
          message: bcMessage,
          priority: bcPriority
      });

      if (success) {
          showToast("Broadcast sent successfully!", "success");
          setBcTitle('');
          setBcMessage('');
          setBcUserId('');
          setUserSearch('');
      } else {
          showToast("Failed to send broadcast", "error");
      }
      setIsSending(false);
  };

  const handleSidebarClick = (id: AdminView) => {
      setView(id);
      setIsSidebarOpen(false); 
  };

  const SidebarItem = ({ id, icon, label, badge }: { id: AdminView, icon: string, label: string, badge?: number }) => (
      <div 
        onClick={() => handleSidebarClick(id)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${view === id ? 'bg-primary text-white shadow-glow' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
      >
          <div className="flex items-center gap-3">
            <i className={`fa-solid fa-${icon} w-5 text-center`}></i>
            <span className="font-bold text-sm">{label}</span>
          </div>
          {badge ? <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${view === id ? 'bg-white text-primary' : 'bg-gray-800 text-gray-400'}`}>{badge}</span> : null}
      </div>
  );

  const ThemeToggle = () => (
      <div className="flex bg-black/20 dark:bg-black/40 p-1 rounded-xl mb-4">
          {[
              { id: 'light', icon: 'sun' },
              { id: 'dark', icon: 'moon' },
              { id: 'system', icon: 'circle-half-stroke' }
          ].map((mode) => (
              <button
                  key={mode.id}
                  onClick={() => updateTheme(mode.id as any)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${theme === mode.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  title={`${mode.id.charAt(0).toUpperCase() + mode.id.slice(1)} Mode`}
              >
                  <i className={`fa-solid fa-${mode.icon} text-xs`}></i>
              </button>
          ))}
      </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-darkBg flex flex-col lg:flex-row transition-colors duration-300">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 dark:bg-darkSurface text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <span className="font-display font-extrabold text-lg tracking-tight">Admin<span className="text-primary">Panel</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="text-white hover:text-primary transition-colors">
                <i className="fa-solid fa-bars text-2xl"></i>
            </button>
        </div>

        {/* Sidebar Backdrop */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
            ></div>
        )}

        {/* Sidebar */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white p-6 flex flex-col 
            transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 border-r border-white/5
        `}>
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
                        <i className="fa-solid fa-shield-halved text-lg"></i>
                    </div>
                    <div>
                        <h2 className="font-display font-black text-xl tracking-tight leading-none">LYNQED</h2>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin Control</span>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto hide-scrollbar">
                <SidebarItem id="dashboard" icon="chart-simple" label="Overview" />
                <SidebarItem id="users" icon="users-gear" label="Manage Users" />
                <SidebarItem id="vendors" icon="shop" label="Vendor Verification" badge={pendingVendors.length || undefined} />
                <SidebarItem id="products" icon="box-archive" label="Product Moderation" badge={pendingProducts.length || undefined} />
                <SidebarItem id="logistics" icon="truck-fast" label="Fleet Logistics" badge={pendingCouriers.length || undefined} />
                <SidebarItem id="broadcast" icon="bullhorn" label="Broadcast Hub" />
                <SidebarItem id="system" icon="sliders" label="System Controls" />
            </div>

            <div className="pt-6 border-t border-white/5 mt-6">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-2">Preferences</p>
                <ThemeToggle />
                <div 
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket w-5"></i>
                    <span className="font-bold text-sm">Terminate Session</span>
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-10 overflow-x-hidden pb-20">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 glass p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-soft">
                <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                        <i className={`fa-solid fa-${
                            view === 'dashboard' ? 'chart-simple' : 
                            view === 'users' ? 'users-gear' : 
                            view === 'vendors' ? 'shop' : 
                            view === 'logistics' ? 'truck-fast' : 
                            view === 'system' ? 'sliders' : 
                            view === 'broadcast' ? 'bullhorn' :
                            'box-archive'
                        } text-2xl`}></i>
                     </div>
                     <div>
                        <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white capitalize">{view.replace('_', ' ')}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">System operational and secure.</p>
                     </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">Admin Mode</span>
                    </div>
                </div>
            </header>

            {/* VIEWS */}

            {view === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-darkSurface dark:to-gray-900 border-l-4 border-primary">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Gross Revenue</p>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-none">₵{revenue.toFixed(2)}</h2>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-darkSurface dark:to-gray-900 border-l-4 border-accent">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Promoted Ads</p>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-none">{trendingProductsCount}</h2>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-darkSurface dark:to-gray-900 border-l-4 border-success">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Users</p>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-none">{activeUserCount}</h2>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-darkSurface dark:to-gray-900 border-l-4 border-warning">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Attention Req.</p>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 leading-none">{pendingProducts.length + pendingVendors.length + pendingCouriers.length}</h2>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8 border-2 border-primary/10 dark:border-primary/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <i className="fa-solid fa-gears text-lg"></i>
                                </div>
                                <h3 className="font-display font-black text-xl text-gray-800 dark:text-white">System Governance</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Root administrative access granted. Managing security protocols and marketplace integrity.</p>
                                <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
                                    <i className="fa-solid fa-circle-check text-success text-[10px]"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-primaryLight">Security: Tier 1 Root Active</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-display font-black text-xl text-gray-800 dark:text-white">Moderation Queue</h3>
                                <Badge color="violet">Awaiting Review</Badge>
                            </div>
                            <div className="space-y-4">
                                {pendingProducts.length === 0 && pendingVendors.length === 0 && pendingCouriers.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 italic font-medium bg-gray-50 dark:bg-black/20 rounded-3xl">
                                        <i className="fa-solid fa-circle-check text-success text-3xl mb-3 block opacity-20"></i>
                                        No pending items to review.
                                    </div>
                                ) : (
                                    <>
                                        {pendingProducts.slice(0, 2).map(p => (
                                            <div key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-white/10">
                                                        <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Product Listing</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => setView('products')}>Review</Button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {view === 'broadcast' && (
                <div className="animate-fade-in space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Composer Card */}
                        <Card className="xl:col-span-2 p-8 border-none shadow-soft">
                            <div className="mb-8">
                                <h3 className="text-xl font-display font-black text-gray-900 dark:text-white mb-1">Announcement Center</h3>
                                <p className="text-sm text-gray-500 font-medium">Compose and dispatch system-wide alerts.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Scope Selector */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'global', label: 'Global', icon: 'earth-africa' },
                                            { id: 'role', label: 'By Role', icon: 'users' },
                                            { id: 'individual', label: 'Single User', icon: 'user' }
                                        ].map(s => (
                                            <button 
                                                key={s.id}
                                                onClick={() => setBcScope(s.id as any)}
                                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all font-bold text-xs ${bcScope === s.id ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                            >
                                                <i className={`fa-solid fa-${s.icon}`}></i>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Conditional Targeting */}
                                {bcScope === 'role' && (
                                    <div className="animate-slide-up">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Select Role</label>
                                        <div className="flex gap-2">
                                            {['buyer', 'vendor', 'courier'].map(r => (
                                                <button 
                                                    key={r}
                                                    onClick={() => setBcRole(r as Role)}
                                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bcRole === r ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                                                >
                                                    {r}s
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {bcScope === 'individual' && (
                                    <div className="animate-slide-up relative">
                                        <Input 
                                            label="Find User" 
                                            placeholder="Search name or email..." 
                                            icon="magnifying-glass"
                                            value={userSearch}
                                            onChange={e => { setUserSearch(e.target.value); setBcUserId(''); }}
                                        />
                                        {filteredUsersForSearch.length > 0 && !bcUserId && (
                                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-darkSurface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                                                {filteredUsersForSearch.map(u => (
                                                    <div 
                                                        key={u.id}
                                                        onClick={() => { setBcUserId(u.id); setUserSearch(u.name); }}
                                                        className="p-3 flex items-center gap-3 hover:bg-primary/5 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                    >
                                                        <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                                                        <div>
                                                            <p className="text-xs font-bold dark:text-white">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {bcUserId && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl mt-[-10px] mb-4">
                                                <i className="fa-solid fa-circle-check text-green-500 text-xs"></i>
                                                <span className="text-[10px] font-black text-green-600 uppercase">Target Selected</span>
                                                <button onClick={() => { setBcUserId(''); setUserSearch(''); }} className="ml-auto text-[10px] text-gray-400 hover:text-red-500">Change</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Input label="Notification Title" placeholder="What's the update?" value={bcTitle} onChange={e => setBcTitle(e.target.value)} />
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Message Body</label>
                                        <textarea 
                                            className="w-full rounded-2xl bg-white dark:bg-darkSurface border-transparent ring-1 ring-gray-100 dark:ring-gray-800 p-4 text-sm h-32 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                                            placeholder="Write the announcement details here..."
                                            value={bcMessage}
                                            onChange={e => setBcMessage(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bcPriority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 shadow-glow' : 'bg-primary/5 dark:bg-primary/20 text-primary'}`}>
                                            <i className={`fa-solid fa-${bcPriority === 'high' ? 'bolt' : 'bell'}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black dark:text-white uppercase tracking-wider">Priority Mode</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{bcPriority} Reach</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setBcPriority(p => p === 'normal' ? 'high' : 'normal')}
                                        className={`w-12 h-6 rounded-full transition-all relative px-1 ${bcPriority === 'high' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${bcPriority === 'high' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                <Button 
                                    fullWidth 
                                    size="lg" 
                                    icon={isSending ? 'spinner' : 'paper-plane'} 
                                    disabled={isSending || !bcTitle || !bcMessage}
                                    onClick={handleSendBroadcast}
                                    className="h-16 shadow-xl shadow-primary/20 font-black text-base uppercase tracking-widest"
                                >
                                    {isSending ? 'Dispatching Signals...' : 'Dispatch Broadcast'}
                                </Button>
                            </div>
                        </Card>

                        {/* Preview Card */}
                        <div className="space-y-6">
                            <div className="sticky top-10">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 ml-1">Live Inbox Preview</h4>
                                <Card className="p-5 border-2 border-primary/20 bg-white dark:bg-darkSurface shadow-xl relative overflow-hidden group">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-glow">
                                            <i className="fa-solid fa-bullhorn text-lg"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-black dark:text-white truncate">{bcTitle || 'Announcement Title'}</h4>
                                                <span className="text-[8px] font-black text-gray-400 uppercase">Now</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                {bcMessage || 'Type a message to see how it will appear in the user inbox...'}
                                            </p>
                                        </div>
                                    </div>
                                    {bcPriority === 'high' && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-glow"></div>}
                                </Card>

                                <div className="mt-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                    <h5 className="text-[10px] font-black text-primary dark:text-primaryLight uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <i className="fa-solid fa-circle-info text-xs"></i> Broadcaster Tips
                                    </h5>
                                    <ul className="space-y-4">
                                        {[
                                            { t: 'Reach Everyone', d: 'Global scope notifies all buyers, vendors, and couriers instantly.' },
                                            { t: 'High Priority', d: 'Pulsing indicators draw immediate eye attention.' },
                                            { t: 'Targeting', d: 'Role-based allows for segmented community management.' }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mt-1.5 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">{item.t}</p>
                                                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{item.d}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'users' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(u => (
                            <Card key={u.id} className="p-6 relative group overflow-visible">
                                <div className="flex items-center gap-4 mb-5">
                                    <Avatar name={u.name} src={u.avatarUrl} size="lg" className="border-2 border-white dark:border-darkBg shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-gray-900 dark:text-white truncate">{u.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {u.isBanned ? <Badge color="red">Banned</Badge> : <Badge color="green">Active</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex gap-1 flex-wrap">
                                        {u.roles.map(r => <Badge key={r} color="gray" className="text-[9px] lowercase px-2">{r}</Badge>)}
                                    </div>
                                    <Button size="sm" variant={u.isBanned ? 'success' : 'danger'} onClick={() => banUser(u.id, !u.isBanned)}>
                                        {u.isBanned ? 'Reinstate' : 'Suspend'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {view === 'products' && (
                 <div className="space-y-6 animate-fade-in">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                         <div>
                            <h2 className="font-black text-xl text-gray-900 dark:text-white font-display">System Inventory</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Moderation Hub</p>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                            <i className="fa-solid fa-fire text-orange-500 text-[10px]"></i>
                            <span className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-black tracking-widest">Sponsored: {trendingProductsCount}</span>
                         </div>
                     </div>

                     <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        {products.map(p => (
                            <Card 
                                key={p.id} 
                                className={`flex flex-col h-full border-2 transition-all duration-300 group overflow-hidden ${p.isTrending ? 'border-orange-400/50 shadow-md shadow-orange-500/5' : 'border-gray-50 dark:border-white/5'}`}
                            >
                                <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-darkBg">
                                    <img 
                                        src={p.images[0]} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        alt={p.title}
                                    />
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <Badge color={p.status === 'approved' ? 'green' : p.status === 'pending' ? 'yellow' : 'red'} className="text-[7px] px-1.5 py-0.5 shadow-sm backdrop-blur-sm">
                                            {p.status}
                                        </Badge>
                                    </div>
                                    <button 
                                        onClick={() => { if(confirm('Delete?')) deleteProduct(p.id); }}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border border-red-500/20"
                                    >
                                        <i className="fa-solid fa-trash-can text-[9px]"></i>
                                    </button>
                                </div>

                                <div className="p-2.5 flex flex-col flex-1 gap-1.5">
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 dark:text-white leading-tight line-clamp-1 font-display text-[10px] uppercase tracking-tight">{p.title}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-sm font-black text-primary">₵{p.price.toFixed(0)}</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Qty: {p.stock}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                        <p className="text-[9px] font-bold text-gray-400 truncate max-w-[60%]">VND_{p.vendorId.slice(-4).toUpperCase()}</p>
                                        <button 
                                            onClick={() => toggleTrendingStatus(p.id, !p.isTrending)}
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${p.isTrending ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-darkBg text-gray-400 hover:text-orange-500'}`}
                                        >
                                            <i className="fa-solid fa-fire text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>

                                {p.status === 'pending' ? (
                                    <div className="grid grid-cols-2 p-1 gap-1 bg-gray-50 dark:bg-darkBg border-t border-gray-50 dark:border-white/5">
                                        <button 
                                            className="h-8 rounded-lg text-[8px] font-black uppercase bg-success text-white hover:bg-success/90 transition-colors"
                                            onClick={() => updateProductStatus(p.id, 'approved')}
                                        >
                                            OK
                                        </button>
                                        <button 
                                            className="h-8 rounded-lg text-[8px] font-black uppercase bg-danger text-white hover:bg-danger/90 transition-colors"
                                            onClick={() => updateProductStatus(p.id, 'rejected')}
                                        >
                                            NO
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-1 bg-gray-50 dark:bg-darkBg border-t border-gray-50 dark:border-white/5">
                                        <button 
                                            onClick={() => updateProductStatus(p.id, 'pending')}
                                            className="w-full py-1.5 text-[8px] font-black text-gray-300 uppercase hover:text-primary tracking-widest transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                )}
                            </Card>
                        ))}
                     </div>

                     {products.length === 0 && (
                        <div className="text-center py-40 text-gray-300">
                            <i className="fa-solid fa-box-open text-5xl mb-4 opacity-10"></i>
                            <p className="font-black uppercase tracking-widest text-[10px]">Archive Empty</p>
                        </div>
                     )}
                 </div>
            )}

            {view === 'vendors' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {vendors.map(v => (
                        <Card key={v.vendorId} className="p-6 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <Avatar src={v.storeAvatarUrl} name={v.storeName} size="lg" className="border-2 border-white dark:border-darkBg shadow-sm" />
                                <div>
                                    <p className="font-black text-gray-900 dark:text-white leading-tight text-lg">{v.storeName}</p>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">📍 {v.location}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge color={v.isApproved ? 'green' : 'yellow'}>{v.isApproved ? 'Verified' : 'Pending'}</Badge>
                                {v.isApproved ? (
                                    <button onClick={() => approveVendor(v.vendorId, false)} className="text-xs font-bold text-red-500 hover:underline">Revoke License</button>
                                ) : (
                                    <Button size="sm" onClick={() => approveVendor(v.vendorId, true)}>Authorize</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            {view === 'logistics' && (
                <div className="space-y-10 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {couriers.map(d => (
                            <Card key={d.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${d.onlineStatus ? 'bg-green-500 shadow-glow' : 'bg-gray-300'}`}></div>
                                        <p className="font-black text-gray-900 dark:text-white truncate">{d.fullName}</p>
                                    </div>
                                    <Badge color={d.status === 'approved' ? 'green' : d.status === 'pending' ? 'yellow' : 'red'}>{d.status}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    {d.status === 'pending' ? (
                                        <div className="flex w-full gap-2">
                                            <Button fullWidth size="sm" variant="success" onClick={() => approveCourier(d.id, d.userId, 'approved')}>Approve</Button>
                                            <Button fullWidth size="sm" variant="danger" onClick={() => approveCourier(d.id, d.userId, 'rejected')}>Reject</Button>
                                        </div>
                                    ) : d.status === 'approved' ? (
                                        <Button fullWidth size="sm" variant="danger" onClick={() => approveCourier(d.id, d.userId, 'suspended')}>Suspend Driver</Button>
                                    ) : (
                                        <Button fullWidth size="sm" variant="success" onClick={() => approveCourier(d.id, d.userId, 'approved')}>Reinstate</Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {view === 'system' && (
                <div className="max-w-xl animate-fade-in space-y-8">
                    <Card className="p-0 overflow-hidden border-none shadow-soft">
                        <div className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-white dark:from-gray-800/20 dark:to-darkSurface">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow">
                                    <i className="fa-solid fa-sliders text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-display font-black text-xl text-gray-800 dark:text-white leading-none">Control Center</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">System Wide Permissions</p>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-gray-800/40 rounded-3xl border transition-all duration-300 ${isThemeSwitchingAllowed ? 'border-primary/20 shadow-md' : 'border-gray-100 dark:border-white/5 opacity-80'}`}>
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isThemeSwitchingAllowed ? 'bg-primary text-white shadow-glow' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                            <i className={`fa-solid fa-${isThemeSwitchingAllowed ? 'paint-roller' : 'palette'} text-lg`}></i>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white text-sm">Personalization</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Toggle User Theme Access</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 bg-gray-50 dark:bg-darkBg sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none">
                                         <div className="text-right">
                                             <span className={`block text-[10px] font-black uppercase tracking-[0.1em] ${isThemeSwitchingAllowed ? 'text-success' : 'text-gray-400'}`}>
                                                {isThemeSwitchingAllowed ? 'Active' : 'Locked'}
                                             </span>
                                             <span className="text-[8px] font-bold text-gray-400 block uppercase">Mode Status</span>
                                         </div>
                                         <button 
                                            onClick={() => toggleThemeSwitching(!isThemeSwitchingAllowed)}
                                            className={`w-14 h-7 rounded-full transition-all duration-500 relative flex items-center px-1.5 ${isThemeSwitchingAllowed ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                         >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 transform ${isThemeSwitchingAllowed ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                         </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                            <div className="flex gap-4">
                                <i className="fa-solid fa-circle-info text-primary mt-1"></i>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Administrator Note</p>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Disabling this control forces all user interfaces into System Default mode (Light) to standardize visual reporting during maintenance cycles.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-transparent opacity-40">
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
                                <i className="fa-solid fa-lock text-xs"></i>
                            </div>
                            <h4 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Secure Core Hooks</h4>
                            <p className="text-[10px] text-gray-400 mt-2 max-w-[180px]">Automated infrastructure scaling controls pending deployment.</p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
};