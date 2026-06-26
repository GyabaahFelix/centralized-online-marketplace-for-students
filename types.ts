

export type Role = 'buyer' | 'vendor' | 'admin' | 'courier' | 'guest';

export type TransportType = 'Bike' | 'Bicycle' | 'Motorbike' | 'Walking' | 'Other';

export type CampusCode = 'UG' | 'UPSA';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: Role[];
  defaultLocation?: string;
  phoneNumber?: string;
  isBanned?: boolean;
  address?: string;
  locationCoordinates?: { lat: number, lng: number };
}

export interface Review {
  id: string;
  productId: string;
  vendorId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user?: { name: string; avatarUrl: string }; // Joined data
}

export interface Vendor {
  id?: string;
  vendorId: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  storeAvatarUrl?: string;
  location: string;
  campus?: CampusCode; // Added for multi-campus support
  locationCategory?: string; // Added for map categorization
  isApproved: boolean;
  rating: number;
  totalReviews?: number;
  createdAt?: string;
  contactPhone?: string;
  businessHours?: string;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
}

export interface Courier {
  id: string;
  userId: string;
  fullName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  vehicleType: string;
  transportType?: TransportType;
  nationalIdFront?: string;
  nationalIdBack?: string;
  profilePhoto?: string;
  deliveryRadius?: number;
  totalDeliveries?: number;
  rating?: number;
  onlineStatus?: boolean; 
  verified?: boolean;     
  availabilityStatus?: string; 
  currentLat?: number;
  currentLng?: number;
  isDelivering?: boolean;
  payoutMethod?: string;
}

export type ProductStatus = 'pending' | 'approved' | 'rejected';

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  contactPhone?: string;
  stock: number;
  status: ProductStatus;
  location: string;
  campus?: CampusCode; // Added for filtering
  rating?: number;
  reviewCount?: number;
  isTrending?: boolean; 
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export type OrderStatus = 
  | 'placed' 
  | 'received' 
  | 'preparing'
  | 'ready_for_pickup'
  | 'courier_assigned'
  | 'picked_up'
  | 'delivering'
  | 'in_route'
  | 'delivered' 
  | 'declined' 
  | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  // Fix: Changed 'text' type to 'string' to resolve TypeScript error on line 118
  vendorId: string;
  courierId?: string;
  items: CartItem[];
  total: number;
  deliveryFee?: number;
  status: OrderStatus;
  deliveryOption: 'delivery' | 'pickup';
  createdAt: string;
  locationCoordinates?: { lat: number; lng: number };
  pickupCoordinates?: { lat: number; lng: number };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export type NotificationScope = 'individual' | 'role' | 'global';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  userId?: string;
  targetRole?: Role;
  targetScope: NotificationScope;
  type: 'order_update' | 'new_order' | 'system' | 'message' | 'approval' | 'promotion' | 'delivery';
  title: string;
  message: string;
  relatedId?: string; // Order ID, Product ID, etc.
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  globalEnabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  categories: {
    orders: boolean;
    messages: boolean;
    delivery: boolean;
    promotions: boolean;
    system: boolean;
  };
}

export interface VendorNotificationPreferences {
  userId: string;
  newOrders: boolean;
  productApproval: boolean;
  announcements: boolean;
  policyChanges: boolean;
}