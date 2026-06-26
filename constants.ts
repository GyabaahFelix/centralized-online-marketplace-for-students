
import { Product, User, Vendor, Category, Order } from './types';

// Points to: Project URL + /storage/v1/object/public/ + Bucket Name + / + File Name
export const LOGO_URL = "https://suschmjoogvoufhozbet.supabase.co/storage/v1/object/public/lynqed-assets/Lynqed_Logo.png";

export const CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', icon: 'utensils', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'basket-shopping', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-clothing', name: 'Clothing', icon: 'shirt', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-sneakers', name: 'Sneakers', icon: 'shoe-prints', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-electronics', name: 'Electronics', icon: 'bolt', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-gadgets', name: 'Gadgets', icon: 'mobile-screen', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-beauty', name: 'Beauty', icon: 'spa', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-personal-care', name: 'Personal Care', icon: 'pump-soap', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-jewellery', name: 'Jewellery', icon: 'gem', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-home', name: 'Home & Living', icon: 'house-chimney', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-decor', name: 'Room Decor', icon: 'couch', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-stationery', name: 'Stationery', icon: 'pen-ruler', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-books', name: 'Books', icon: 'book', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-sports', name: 'Sports', icon: 'person-running', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-toys', name: 'Toys', icon: 'gamepad', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-health', name: 'Health', icon: 'heart-pulse', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-auto', name: 'Auto', icon: 'car', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=300&q=80' },
  { id: 'cat-services', name: 'Services', icon: 'hand-holding-heart', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=300&auto=format&fit=crop' },
  { id: 'cat-tickets', name: 'Tickets', icon: 'ticket', image: 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=300&q=80' },
];

// READ-ONLY: EXISTING LEGON (UG) CACHE
export const INITIAL_LOCATION_CACHE: Record<string, [number, number]> = {
  'mensah sarbah hall': [5.6517, -0.1932],
  'sarbah hall': [5.6517, -0.1932],
  'sarbah main': [5.6517, -0.1932],
  'sarbah annex a': [5.6514, -0.1935],
  'sarbah annex b': [5.6520, -0.1929],
  'mensah sarbah crescent': [5.6525, -0.1938],
  'legon hall': [5.6505, -0.1875],
  'legon main': [5.6505, -0.1875],
  'legon hall annex a': [5.6502, -0.1870],
  'legon hall annex b': [5.6508, -0.1878],
  'legon hall annex c': [5.6505, -0.1882],
  'legon ladies hall': [5.6498, -0.1872],
  'akuafo hall': [5.6521, -0.1895],
  'akuafo main': [5.6521, -0.1895],
  'akuafo hall annex a': [5.6524, -0.1898],
  'akuafo hall annex b': [5.6518, -0.1892],
  'akuafo hall annex c': [5.6522, -0.1905],
  'volta hall': [5.6510, -0.1865],
  'volta annex': [5.6507, -0.1862],
  'commonwealth hall': [5.6536, -0.1873],
  'vandals': [5.6536, -0.1873],
  'commonwealth annex': [5.6532, -0.1878],
  'jean nelson hall': [5.6590, -0.1850],
  'jean nelson aka': [5.6590, -0.1850],
  'elizabeth sey hall': [5.6592, -0.1845],
  'sey hall': [5.6592, -0.1845],
  'alexander kwapong hall': [5.6595, -0.1870],
  'alex kwapong': [5.6595, -0.1870],
  'hilla limann hall': [5.6598, -0.1860],
  'limann hall': [5.6598, -0.1860],
  'pentagon': [5.6600, -0.1930],
  'pent block a': [5.6598, -0.1925],
  'pent block b': [5.6602, -0.1932],
  'pent block c': [5.6605, -0.1935],
  'african union hall': [5.6600, -0.1930],
  'evandy hostel': [5.6585, -0.1915],
  'evandy': [5.6585, -0.1915],
  'tf hostel': [5.6565, -0.1910],
  'bani hostel': [5.6575, -0.1900],
  'james topp nelson yankah': [5.6565, -0.1910],
  'srf hostel': [5.6578, -0.1920],
  'international students hostel': [5.6588, -0.1925],
  'ug hospital': [5.6468, -0.1918],
  'university hospital': [5.6468, -0.1918],
  'student clinic': [5.6475, -0.1908],
  'ug dental clinic': [5.6460, -0.1925],
  'balme library': [5.6515, -0.1885],
  'main library': [5.6515, -0.1885],
  'jqb': [5.6525, -0.1860],
  'jones quartey building': [5.6525, -0.1860],
  'ugbs': [5.6520, -0.1855],
  'business school': [5.6520, -0.1855],
  'school of law': [5.6508, -0.1848],
  'law school': [5.6508, -0.1848],
  'school of engineering': [5.6545, -0.1958],
  'engineering block': [5.6545, -0.1958],
  'computer science department': [5.6535, -0.1955],
  'cs department': [5.6535, -0.1955],
  'night market': [5.6540, -0.1920],
  'bush canteen': [5.6510, -0.1950],
  'central cafeteria': [5.6528, -0.1882],
  'legon food court': [5.6526, -0.1878],
  'papaye legon': [5.6502, -0.1888],
  'campus plaza': [5.6529, -0.1870],
  'ug sports stadium': [5.6548, -0.1935],
  'recreational center': [5.6530, -0.1900],
  'great hall': [5.6510, -0.1880],
  'vice chancellors lodge': [5.6495, -0.1905],
  'main gate': [5.6506, -0.1962],
  'okponglo gate': [5.6465, -0.1935],
  'pantang gate': [5.6615, -0.2005],
  'legon': [5.6506, -0.1962],
  'accra': [5.6037, -0.1870],
  'kumasi': [6.6885, -1.6244],
};

// EXTENSION: NEW UPSA CACHE
export const UPSA_LOCATION_CACHE: Record<string, [number, number]> = {
  // ACADEMIC & ADMIN
  'upsa administration block': [5.6508, -0.1685],
  'main administration block': [5.6508, -0.1685],
  'vice-chancellor’s office': [5.6509, -0.1686],
  'registrar’s office': [5.6507, -0.1684],
  'finance office': [5.6506, -0.1683],
  'admissions office': [5.6505, -0.1682],
  'faculty of accounting & finance': [5.6512, -0.1690],
  'faculty of management studies': [5.6513, -0.1691],
  'faculty of it & communication studies': [5.6514, -0.1692],
  'graduate school': [5.6515, -0.1693],
  'lecture theatre complex': [5.6510, -0.1680],
  'it laboratory': [5.6511, -0.1681],
  'cbt centre': [5.6512, -0.1682],
  'upsa library': [5.6520, -0.1688],
  'e-library': [5.6521, -0.1689],

  // STUDENT SERVICES & CLINIC
  'students’ affairs': [5.6504, -0.1678],
  'counseling & career services': [5.6503, -0.1677],
  'upsa clinic': [5.6498, -0.1672],
  'id card office': [5.6502, -0.1676],

  // HOSTELS & RESIDENTIAL
  'upsa main hostel': [5.6495, -0.1680],
  'upsa female hostel': [5.6492, -0.1678],
  'postgraduate hostel area': [5.6488, -0.1675],
  'private hostels zone': [5.6485, -0.1672],

  // FOOD & SOCIAL
  'main cafeteria': [5.6518, -0.1675],
  'upsa food court': [5.6519, -0.1676],
  'night vendors area': [5.6522, -0.1678],
  'staff canteen': [5.6517, -0.1674],
  'student chill area': [5.6516, -0.1679],

  // SECURITY & ACCESS
  'upsa main gate': [5.6510, -0.1675],
  'back gate': [5.6500, -0.1698],
  'security posts': [5.6505, -0.1688],
  'car parks': [5.6502, -0.1692],
  'ride pickup point': [5.6511, -0.1674],
  
  // DELIVERY ZONES
  'main gate area': [5.6510, -0.1675],
  'back gate area': [5.6500, -0.1698],
  'hostels zone': [5.6494, -0.1679],
  'food court zone': [5.6519, -0.1676],
  'lecture blocks zone': [5.6511, -0.1685],
  'administration zone': [5.6508, -0.1685],

  // REGIONAL
  'upsa': [5.6508, -0.1685],
  'madina': [5.6680, -0.1650],
};

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Jane Doe', email: 'jane@lynqed.com', roles: ['buyer'], avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff' },
  { id: 'user-2', name: 'John Vendor', email: 'john@lynqed.com', roles: ['vendor'], avatarUrl: 'https://ui-avatars.com/api/?name=John+Vendor&background=random' },
  { id: 'user-3', name: 'Admin User', email: 'admin@lynqed.com', roles: ['admin'], avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff' },
];

export const MOCK_VENDORS: Vendor[] = [
  { 
    vendorId: 'vendor-1', 
    userId: 'user-2', 
    storeName: "John's Groceries", 
    storeDescription: "Fresh essentials and daily provisions.", 
    location: "Mensah Sarbah Hall", 
    campus: 'UG',
    isApproved: true, 
    rating: 4.5, 
    storeAvatarUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80" 
  },
  { 
    vendorId: 'vendor-upsa-1', 
    userId: 'user-upsa-1', 
    storeName: "UPSA Tech Hub", 
    storeDescription: "Laptops, gadgets and repairs for scholars.", 
    location: "Lecture Theatre Complex", 
    campus: 'UPSA',
    isApproved: true, 
    rating: 4.8, 
    storeAvatarUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80" 
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    vendorId: 'vendor-1',
    title: 'Fresh Eggs (Crate)',
    description: 'Farm fresh eggs, delivered daily.',
    price: 35,
    currency: 'GHS',
    category: 'Groceries',
    images: ['https://images.unsplash.com/photo-1582722878654-c2bea702dfbf?auto=format&fit=crop&w=600&q=80'],
    stock: 20,
    status: 'approved',
    location: 'Mensah Sarbah Hall',
    campus: 'UG',
    contactPhone: '233500000001',
    rating: 4.8
  },
  {
    id: 'prod-upsa-1',
    vendorId: 'vendor-upsa-1',
    title: 'MacBook Air Charger',
    description: 'Original Apple Magsafe 2 charger.',
    price: 450,
    currency: 'GHS',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'],
    stock: 5,
    status: 'approved',
    location: 'UPSA Food Court',
    campus: 'UPSA',
    contactPhone: '233200000001',
    rating: 4.9
  }
];

export const MOCK_ORDERS: Order[] = [];