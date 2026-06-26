import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { Layout } from './components/Layout';
import { Welcome, BuyerDashboard } from './pages/Home';
import { SearchPage } from './pages/Search';
import { ProductDetail, Cart, Checkout, StorePage } from './pages/Product';
import { VendorDashboard, VendorProducts, AddProduct, EditProduct, VendorOrders, VendorOnboarding } from './pages/Vendor';
import { AdminDashboard } from './pages/Admin';
import { UserProfile, OrdersPage, WishlistPage } from './pages/Profile';
import { Login, Register, AdminLogin, ForgotPassword, UpdatePassword } from './pages/Auth';
import { DeliveryDashboard } from './pages/Delivery';
import { AboutPage } from './pages/About';
import { PrivacyPage } from './pages/Privacy';
import { TermsPage } from './pages/Terms';
import { FAQPage } from './pages/FAQ';
import { supabase } from './supabaseClient';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
    const { currentUser, currentRole, isLoading } = useApp();
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-b-transparent mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Session...</p>
            </div>
        );
    }
    
    if (!currentUser) return <Navigate to="/login" replace />;

    if (role && currentRole !== 'admin') {
        if (!currentUser.roles.includes(role as any)) {
            return <Navigate to="/" replace />;
        }
        if (currentRole !== role) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

const AuthEventHandler = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Handle explicit Supabase Auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/update-password');
            }
        });

        // Robust manual detection for recovery links
        const checkRecovery = () => {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const searchParams = new URLSearchParams(window.location.search);
            
            if (hashParams.get('type') === 'recovery' || searchParams.get('type') === 'recovery') {
                navigate('/update-password');
            }
        };

        checkRecovery();

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    return null;
}

const AppContent = () => {
  return (
    <Layout>
      <AuthEventHandler />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        <Route path="/store/:vendorId" element={<StorePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="/secret-access" element={<AdminLogin />} />

        <Route path="/buyer/dashboard" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />
        <Route path="/buyer/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/buyer/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/buyer/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/buyer/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/buyer/orders" element={<ProtectedRoute role="buyer"><OrdersPage /></ProtectedRoute>} />
        <Route path="/buyer/wishlist" element={<ProtectedRoute role="buyer"><WishlistPage /></ProtectedRoute>} />
        <Route path="/buyer/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        <Route path="/vendor/onboarding" element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>} />
        <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/products" element={<ProtectedRoute role="vendor"><VendorProducts /></ProtectedRoute>} />
        <Route path="/vendor/products/new" element={<ProtectedRoute role="vendor"><AddProduct /></ProtectedRoute>} />
        <Route path="/vendor/products/:id/edit" element={<ProtectedRoute role="vendor"><EditProduct /></ProtectedRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoute role="vendor"><VendorOrders /></ProtectedRoute>} />
        <Route path="/vendor/profile" element={<ProtectedRoute role="vendor"><UserProfile /></ProtectedRoute>} />
        
        <Route path="/delivery/dashboard" element={<ProtectedRoute role="courier"><DeliveryDashboard /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
         <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;