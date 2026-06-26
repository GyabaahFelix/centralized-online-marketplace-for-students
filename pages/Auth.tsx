
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Button, Input } from '../components/UI';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { LOGO_URL } from '../constants';

export const Login: React.FC = () => {
    const { login } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            const role = result.role;
            if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'vendor') {
                navigate('/vendor/dashboard', { replace: true });
            } else if (role === 'courier') {
                navigate('/delivery/dashboard', { replace: true });
            } else {
                navigate('/buyer/dashboard', { replace: true });
            }
        } else {
            setIsLoading(false);
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Back to Home Button */}
            <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full bg-white/40 dark:bg-darkSurface/40 backdrop-blur-xl shadow-lg flex items-center justify-center text-gray-900 dark:text-white border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-darkSurface transition-all active:scale-90"
                title="Back to Home"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            {/* Login Specific Radiant Accents - HIDDEN IN DARK MODE */}
            <div className="absolute top-[-5%] right-[-10%] w-72 h-72 bg-purple-200/50 rounded-full blur-[100px] opacity-60 animate-blob dark:hidden"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-200/50 rounded-full blur-[120px] opacity-60 animate-blob animation-delay-2000 dark:hidden"></div>

            <div className="flex-1 flex flex-col justify-center px-8 py-12 relative z-10 max-w-md mx-auto w-full animate-fade-in">
                <div className="mb-8 text-center">
                    <div 
                        className="mb-6 inline-block cursor-pointer group active:scale-95 transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <img 
                          src={LOGO_URL} 
                          alt="LYNQED" 
                          className="h-44 w-44 md:h-48 md:w-48 rounded-full object-cover border-4 border-white/50 dark:border-white/10 mx-auto bg-white/40 dark:bg-darkSurface shadow-2xl p-1 backdrop-blur-xl group-hover:shadow-primary/30 transition-all duration-500" 
                        />
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Sign in to continue to LYNQED</p>
                </div>

                {error && (
                    <div className="bg-red-50/80 backdrop-blur-md dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl mb-4 flex items-center shadow-sm">
                        <i className="fa-solid fa-circle-exclamation mr-3"></i>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <div className="bg-white/40 dark:bg-darkSurface/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-white/5">
                  <form onSubmit={handleLogin} className="space-y-6">
                      <Input 
                          label="Email Address" 
                          icon="envelope" 
                          type="email"
                          placeholder="you@university.edu" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          required
                      />
                      
                      <div>
                          <Input 
                              label="Password" 
                              icon="lock" 
                              type="password"
                              placeholder="••••••••" 
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              required
                          />
                          <div className="flex justify-end -mt-3 mb-2">
                              <Link 
                                  to="/forgot-password"
                                  className="text-xs font-black text-primary dark:text-primaryLight hover:text-primaryDark transition-colors uppercase tracking-widest"
                              >
                                  Forgot Password?
                              </Link>
                          </div>
                      </div>

                      <Button 
                          fullWidth 
                          size="lg" 
                          type="submit"
                          disabled={isLoading}
                          className="shadow-xl shadow-primary/30 h-14 uppercase tracking-[0.2em] font-black"
                      >
                          {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                  </form>
                </div>

                <div className="mt-10 text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    Don't have an account? <Link to="/register" className="font-black text-primary dark:text-primaryLight hover:text-primaryDark transition-colors underline whitespace-nowrap">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export const ForgotPassword: React.FC = () => {
    const { resetPassword, showToast } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleReset = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (timer > 0) return;

        setError('');
        setIsLoading(true);

        const result = await resetPassword(email);
        setIsLoading(false);

        if (result.success) {
            setSent(true);
            setTimer(60); 
            if (!e) showToast("Reset link sent again!", "success");
        } else {
            setError(result.error || 'Failed to send reset email.');
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden transition-colors duration-300">
                <div className="flex-1 flex flex-col justify-center px-8 py-12 relative z-10 max-w-md mx-auto w-full text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-100 dark:border-green-800 shadow-xl backdrop-blur-md">
                        <i className="fa-solid fa-paper-plane text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Check Your Inbox</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed px-4 font-medium">
                        We've sent a secure password reset link to <br /><span className="font-black text-primary dark:text-white underline">{email}</span>.
                    </p>
                    
                    <div className="mt-12 p-8 bg-white/40 dark:bg-darkSurface/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 dark:border-gray-800 shadow-xl">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-black uppercase tracking-widest">
                            Didn't receive the email?
                        </p>
                        <button 
                            onClick={() => handleReset()}
                            disabled={timer > 0 || isLoading}
                            className={`text-sm font-black uppercase tracking-[0.15em] transition-all px-6 py-3 rounded-2xl ${timer > 0 ? 'bg-gray-100 text-gray-300' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95'}`}
                        >
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend Link Now'}
                        </button>
                    </div>

                    <Link to="/login" className="mt-10 inline-block text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider whitespace-nowrap">
                        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Back to Home Button */}
            <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full bg-white/40 dark:bg-darkSurface/40 backdrop-blur-xl shadow-lg flex items-center justify-center text-gray-900 dark:text-white border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-darkSurface transition-all active:scale-90"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-primary/15 rounded-full blur-[100px] opacity-50 animate-blob dark:hidden"></div>
            <div className="flex-1 flex flex-col justify-center px-8 py-12 relative z-10 max-w-md mx-auto w-full animate-slide-up">
                <div className="mb-10 text-center">
                    <div 
                        className="mb-6 inline-block cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <img 
                          src={LOGO_URL} 
                          alt="LYNQED" 
                          className="h-32 w-32 rounded-full object-cover border-2 border-white/50 dark:border-white/10 mx-auto" 
                        />
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tight">Forgot Password?</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm px-8 font-medium">No worries, it happens. Enter your email and we'll help you get back in.</p>
                </div>

                <div className="bg-white/40 dark:bg-darkSurface/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-white/5">
                  <form onSubmit={handleReset} className="space-y-6">
                      <Input 
                          label="Email Address" 
                          icon="envelope" 
                          type="email" 
                          placeholder="you@university.edu" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          required
                      />
                      <Button 
                          fullWidth 
                          size="lg" 
                          type="submit"
                          disabled={isLoading}
                          className="shadow-xl shadow-primary/30 h-14 font-black uppercase tracking-widest"
                      >
                          {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                  </form>
                </div>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider whitespace-nowrap">
                        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const UpdatePassword: React.FC = () => {
    const { updatePassword, showToast } = useApp();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        const result = await updatePassword(password);
        setIsLoading(false);

        if (result.success) {
            showToast("Password updated successfully!", "success");
            navigate('/login');
        } else {
            setError(result.error || 'Failed to update password.');
        }
    };

    const isMatch = password && confirmPassword && password === confirmPassword;

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden transition-colors duration-300">
             <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full bg-white/40 dark:bg-darkSurface/40 backdrop-blur-xl shadow-lg flex items-center justify-center text-gray-900 dark:text-white border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-darkSurface transition-all active:scale-90"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="absolute bottom-[-5%] right-[-5%] w-72 h-72 bg-secondary/15 rounded-full blur-[100px] opacity-50 animate-blob dark:hidden"></div>
            <div className="flex-1 flex flex-col justify-center px-8 py-12 relative z-10 max-w-md mx-auto w-full animate-slide-up">
                <div className="mb-6 text-center">
                    <div 
                        className="mb-6 inline-block cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <img 
                          src={LOGO_URL} 
                          alt="LYNQED" 
                          className="h-24 w-24 rounded-full object-cover" 
                        />
                    </div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight uppercase">New Password</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Create a strong, secure password for your account</p>
                </div>

                <div className="bg-white/40 dark:bg-darkSurface/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-white/5">
                  <form onSubmit={handleUpdate} className="space-y-6">
                      <div>
                          <Input 
                              label="New Password" 
                              icon="lock" 
                              type="password"
                              placeholder="New secure password" 
                              value={password}
                              onChange={e => setPassword(e.target.value)} 
                              required
                              minLength={6}
                          />
                          <p className={`text-[10px] ml-1 -mt-4 mb-4 font-black uppercase tracking-tight ${password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}>
                              {password.length >= 6 ? '✓ Strong enough' : 'Min. 6 characters required'}
                          </p>
                      </div>

                      <div>
                          <Input 
                              label="Confirm New Password" 
                              icon="lock" 
                              type="password"
                              placeholder="Re-type your new password" 
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)} 
                              required
                              minLength={6}
                          />
                          {confirmPassword && (
                              <p className={`text-[10px] ml-1 -mt-4 mb-4 font-black uppercase tracking-tight ${isMatch ? 'text-green-500' : 'text-red-500'}`}>
                                  {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                              </p>
                          )}
                      </div>

                      <Button 
                          fullWidth 
                          size="lg" 
                          type="submit"
                          disabled={isLoading || !isMatch || password.length < 6}
                          className="shadow-xl shadow-primary/30 h-14 font-black uppercase tracking-widest mt-2"
                      >
                          {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                  </form>
                </div>
            </div>
        </div>
    );
};

export const Register: React.FC = () => {
    const { signup, registerCourier } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialRole = (location.state as any)?.role || 'buyer';
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState<Role>(initialRole);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await signup(email, password, fullName, role, phoneNumber);
        
        if (result.success) {
            const finalRole = result.role;
            if (finalRole === 'courier') {
                const userId = result.user?.id;
                const courierRes = await registerCourier({ fullName, phoneNumber }, userId);
                setIsLoading(false);
                if (courierRes.success) {
                    alert("Courier account created! Please wait for admin verification.");
                    navigate('/buyer/profile', { replace: true });
                } else {
                    setError("Account created but failed to submit courier application.");
                }
            } else if (finalRole === 'vendor') {
                 setIsLoading(false);
                 navigate('/vendor/onboarding', { replace: true });
            } else {
                 setIsLoading(false);
                 navigate('/buyer/dashboard', { replace: true });
            }
        } else {
            setIsLoading(false);
            setError(result.error || 'Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden transition-colors duration-300 pb-10">
             <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full bg-white/40 dark:bg-darkSurface/40 backdrop-blur-xl shadow-lg flex items-center justify-center text-gray-900 dark:text-white border border-white/50 dark:border-white/10 hover:bg-white dark:hover:bg-darkSurface transition-all active:scale-90"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

             <div className="absolute top-[-5%] left-[-5%] w-80 h-80 bg-primary/10 rounded-full blur-[120px] opacity-50 animate-blob dark:hidden"></div>

             <div className="flex-1 flex flex-col justify-center px-8 py-12 relative z-10 max-w-md mx-auto w-full animate-slide-up">
                <div className="mb-8 text-center">
                    <div 
                        className="mb-6 inline-block cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <img 
                          src={LOGO_URL} 
                          alt="LYNQED" 
                          className="h-24 w-24 rounded-full object-cover" 
                        />
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tight">Create Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Join the campus marketplace</p>
                </div>

                <div className="bg-white/40 dark:bg-darkSurface/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-white/5">
                  {error && (
                      <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 text-center">
                          {error}
                      </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                      <Input 
                          label="Full Name" 
                          icon="user" 
                          placeholder="John Doe" 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                          required
                      />

                      <Input 
                          label="Email Address" 
                          icon="envelope" 
                          type="email" 
                          placeholder="you@university.edu" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          required
                      />
                      
                      <Input 
                          label="Phone Number" 
                          icon="phone" 
                          type="tel" 
                          placeholder="050 123 4567" 
                          value={phoneNumber} 
                          onChange={e => setPhoneNumber(e.target.value)} 
                          required
                      />

                      <Input 
                          label="Password" 
                          icon="lock" 
                          type="password"
                          placeholder="Create a password" 
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                      />

                      <div>
                          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Choose your identity</label>
                          <div className="grid grid-cols-3 gap-2">
                              <div 
                                  onClick={() => setRole('buyer')}
                                  className={`cursor-pointer rounded-2xl p-2 border-2 text-center transition-all flex flex-col items-center justify-center gap-1 h-20 ${role === 'buyer' ? 'border-primary bg-primary/10 text-primary font-black shadow-sm' : 'border-white/40 bg-white/40 text-gray-400'}`}
                              >
                                  <i className="fa-solid fa-bag-shopping text-lg"></i>
                                  <span className="text-[10px] uppercase font-black">Buy</span>
                              </div>
                              <div 
                                  onClick={() => setRole('vendor')}
                                  className={`cursor-pointer rounded-2xl p-2 border-2 text-center transition-all flex flex-col items-center justify-center gap-1 h-20 ${role === 'vendor' ? 'border-secondary bg-secondary/10 text-secondary font-black shadow-sm' : 'border-white/40 bg-white/40 text-gray-400'}`}
                              >
                                  <i className="fa-solid fa-store text-lg"></i>
                                  <span className="text-[10px] uppercase font-black">Sell</span>
                              </div>
                              <div 
                                  onClick={() => setRole('courier')}
                                  className={`cursor-pointer rounded-2xl p-2 border-2 text-center transition-all flex flex-col items-center justify-center gap-1 h-20 ${role === 'courier' ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-black shadow-sm' : 'border-white/40 bg-white/40 text-gray-400'}`}
                              >
                                  <i className="fa-solid fa-motorcycle text-lg"></i>
                                  <span className="text-[10px] uppercase font-black">Deliver</span>
                              </div>
                          </div>
                      </div>

                      <Button 
                          fullWidth 
                          size="lg" 
                          type="submit"
                          disabled={isLoading}
                          className="shadow-xl shadow-primary/30 h-14 font-black uppercase tracking-widest mt-2"
                      >
                          {isLoading ? 'Creating...' : 'Sign Up'}
                      </Button>
                  </form>
                </div>

                <div className="mt-10 text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    Already have an account? <Link to="/login" className="font-black text-primary dark:text-primaryLight hover:text-primaryDark transition-colors underline whitespace-nowrap">Log In</Link>
                </div>
             </div>
        </div>
    );
}

export const AdminLogin: React.FC = () => {
    const { login } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const result = await login(email, password);
        
        if (result.success) {
            if (result.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                setIsLoading(false);
                setError("Access Denied: Insufficient Privileges");
            }
        } else {
            setIsLoading(false);
            setError(result.error || 'Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-sm">
                <div className="flex items-center justify-center mb-8 gap-3 opacity-50">
                     <i className="fa-solid fa-shield-halved text-2xl"></i>
                     <span className="font-mono tracking-widest text-sm uppercase">System Access</span>
                </div>

                {error && <div className="text-red-500 text-center text-xs font-mono mb-4">{error}</div>}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase">ID</label>
                        <input 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="off"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase">Key</label>
                        <input 
                            type="password"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        disabled={isLoading}
                        className="w-full bg-white text-black py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors mt-4 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</> : 'Authenticate'}
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/')} className="text-gray-600 text-[10px] hover:text-gray-400 font-mono">Exit to Surface</button>
                </div>
            </div>
        </div>
    );
};