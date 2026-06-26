import React, { useEffect, useState, useRef } from 'react';
import { ToastMessage } from '../types';
import { useNavigate } from 'react-router-dom';

// --- Avatar ---
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '', onClick }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = name
    ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-24 h-24 text-xl",
    '2xl': "w-32 h-32 text-3xl"
  };

  const colors = [
    'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  ];
  const colorIndex = name.length % colors.length;
  const colorClass = colors[colorIndex];

  const baseClasses = `rounded-full flex items-center justify-center font-bold object-cover shadow-sm border border-white dark:border-gray-800 flex-shrink-0 ${sizeClasses[size]} ${className}`;

  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={`${baseClasses} bg-gray-100 dark:bg-gray-800`}
        onError={() => setImgError(true)}
        onClick={onClick}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${colorClass}`} onClick={onClick} title={name}>
      {initials}
    </div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', fullWidth, size = 'md', icon, className = '', ...props 
}) => {
  const base = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100 tracking-tight";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primaryDark text-white hover:shadow-glow shadow-lg shadow-primary/30 border border-transparent",
    secondary: "bg-white dark:bg-darkSurface text-gray-800 dark:text-white border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm",
    outline: "border-2 border-primary/20 text-primary dark:text-primaryLight bg-transparent hover:bg-primary/5",
    ghost: "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white shadow-none",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-100 dark:border-red-900/30",
    success: "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <i className={`fa-solid fa-${icon} mr-2.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}></i>}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === 'password';
  const effectiveType = isPasswordInput ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`mb-5 ${className}`}>
      {label && <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className={`fa-solid fa-${icon} text-gray-400 group-focus-within:text-primary transition-colors duration-300`}></i>
          </div>
        )}
        <input 
          type={effectiveType}
          className={`block w-full rounded-2xl border-transparent bg-white dark:bg-darkSurface shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 py-3.5 ${icon ? 'pl-11' : 'pl-5'} ${isPasswordInput ? 'pr-12' : 'pr-4'} text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:bg-white dark:focus:bg-darkSurface focus:ring-2 focus:ring-primary/20 transition-all duration-300 ease-out sm:text-sm`}
          {...props}
        />
        {isPasswordInput && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors focus:outline-none"
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'violet', className = '' }) => {
    const colors: Record<string, string> = {
        violet: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        purple: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-indigo-900/30 dark:text-emerald-400 dark:border-emerald-800',
        red: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
        yellow: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        gray: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };
    
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${colors[color] || colors.violet} ${className}`}>
            {children}
        </span>
    )
}

// --- Card ---
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, className = '', onClick, style }) => (
  <div 
    onClick={onClick} 
    style={style}
    className={`bg-white dark:bg-darkSurface rounded-3xl shadow-card border border-gray-50 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-float ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-spin rounded-full h-6 w-6 border-2 border-gray-200 dark:border-gray-700 border-b-primary ${className}`}></div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`}></div>
);

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-darkSurface rounded-2xl overflow-hidden shadow-card border border-gray-100 dark:border-gray-800 h-full flex flex-col">
        <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        <div className="p-3 flex flex-col justify-between flex-grow">
            <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center mt-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

// --- Toast Notification ---
export const Toast: React.FC<{ toast: ToastMessage | null; onClose: () => void }> = ({ toast, onClose }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (toast) {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            setIsVisible(true);
            closeTimerRef.current = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => { onClose(); }, 300);
            }, 3000);
        } else {
            setIsVisible(false);
        }
        return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
    }, [toast?.id]);

    if (!toast) return null;

    const icons = { success: 'circle-check', error: 'circle-exclamation', info: 'circle-info' };
    const colors = {
        success: 'bg-green-600 text-white shadow-green-500/40',
        error: 'bg-red-500 text-white shadow-red-500/40',
        info: 'bg-primary text-white shadow-primary/40' // Use Brand Purple
    };

    const isWishlistAction = toast.message.toLowerCase().includes('wishlist') || toast.message.toLowerCase().includes('saved');

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ease-out pointer-events-none ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-90'}`}>
            <div className={`flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl ${colors[toast.type]} min-w-[280px] max-w-sm border border-white/20 backdrop-blur-md pointer-events-auto`}>
                <i className={`fa-solid fa-${icons[toast.type]} text-xl`}></i>
                <div className="flex-1">
                   <p className="text-xs font-bold leading-tight tracking-wide">{toast.message}</p>
                </div>
                {isWishlistAction && (
                    <button 
                        onClick={() => { setIsVisible(false); onClose(); navigate('/buyer/wishlist'); }}
                        className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors border border-white/10 ml-2"
                    >
                        View
                    </button>
                )}
            </div>
        </div>
    );
};