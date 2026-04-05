import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { apiService, ApiBook, CreateBookRequest } from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import { Analytics } from "@vercel/analytics/react"

export interface User {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  purchasedBooks?: number[];
  name?: string; // For backward compatibility
  isAdmin?: boolean;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  // ageRange: string;
  pages: number;
  image: string;
  previewImages: string[];
  featured: boolean;
  language: 'english' | 'arabic';
  discount?: number | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Theme = 'light' | 'dark';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  theme: Theme;
  toggleTheme: () => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Component to handle authentication redirects
const AuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const profile = await apiService.getUserProfile();
          const userData = {
            id: profile.id,
            userName: profile.userName,
            email: profile.email,
            roles: profile.roles,
            name: profile.userName, // For backward compatibility
            isAdmin: profile.roles.includes('Admin'),
            purchasedBooks: [] // Initialize with empty array
          };
          setUser(userData);

          // Redirect based on user role if on login/signup pages
          if (location.pathname === '/login' || location.pathname === '/signup') {
            if (profile.roles.includes('Admin')) {
              navigate('/admin');
            } else {
              navigate('/account');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Clear invalid token and redirect to login
        apiService.clearAuthToken();
        setUser(null);
        if (location.pathname === '/admin' || location.pathname === '/account') {
          navigate('/login');
        }
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location.pathname, setUser]);

  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization
    const savedCart = localStorage.getItem('colorCraftsCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  // Helper function to transform ApiBook to Product
  const transformApiBookToProduct = useCallback((book: ApiBook): Product => ({
    id: book.id,
    title: book.title,
    description: book.description,
    price: book.price,
    category: book.category,
    // ageRange: book.ageRange || `${book.startAge}-${book.endAge}`,
    pages: book.pages || book.pagesNumber,
    image: book.image || book.imageUrls?.[0] || '',
    previewImages: book.previewImages || book.imageUrls?.slice(1) || [],
    featured: book.featured || false,
    language: book.language || 'english',
    discount: book.discount,
  }), []);

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBooks = await apiService.getAllBooks();
      // Transform ApiBook to Product format
      const transformedProducts: Product[] = apiBooks.map(transformApiBookToProduct);
      setProducts(transformedProducts);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('Error loading products:', err);
      // Fallback to empty array or show error message
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [transformApiBookToProduct]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Persist cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('colorCraftsCart', JSON.stringify(cart));
  }, [cart]);

  // Refresh products function
  const refreshProducts = async () => {
    await loadProducts();
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        // For digital books, don't increase quantity - just keep it as 1
        return prev; // No change if item already exists
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    // For digital books, quantity should always remain 1
    // This function is kept for compatibility but doesn't change quantity
    return;
  };  const clearCart = () => {
    setCart([]);
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      // Transform Product to CreateBookRequest format
      const createBookData = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        categoryName: productData.category,
        discount: productData.discount,
        // startAge: parseInt(productData.ageRange.split('-')[0]),
        // endAge: parseInt(productData.ageRange.split('-')[1]),
        pagesNumber: productData.pages,
        imageUrls: [productData.image, ...productData.previewImages],
        pdf: '', // This would need to be handled separately
      };
      const newApiBook = await apiService.createBook(createBookData);
      const newProduct = transformApiBookToProduct(newApiBook);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      // Transform partial Product to partial CreateBookRequest format
      const updateBookData: Partial<CreateBookRequest> = {};
      if (productData.title) updateBookData.title = productData.title;
      if (productData.description) updateBookData.description = productData.description;
      if (productData.price !== undefined) updateBookData.price = productData.price;
      if (productData.category) updateBookData.categoryName = productData.category;
      if (productData.discount !== undefined) updateBookData.discount = productData.discount;
       
      if (productData.pages !== undefined) updateBookData.pagesNumber = productData.pages;
      if (productData.image || productData.previewImages) {
        updateBookData.imageUrls = [productData.image || '', ...(productData.previewImages || [])].filter(Boolean);
      }
      
      const updatedApiBook = await apiService.updateBook(id, updateBookData);
      const updatedProduct = transformApiBookToProduct(updatedApiBook);
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiService.deleteBook(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    theme,
    toggleTheme,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
    refreshProducts,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Analytics />
      <Router>
        <AuthHandler>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={
                  user ? (
                    user.isAdmin ? <Navigate to="/admin" /> : <Account />
                  ) : (
                    <Navigate to="/login" />
                  )
                } />
                <Route path="/login" element={user ? (user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/account" />) : <Login />} />
                <Route path="/signup" element={user ? (user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/account" />) : <Signup />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthHandler>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
