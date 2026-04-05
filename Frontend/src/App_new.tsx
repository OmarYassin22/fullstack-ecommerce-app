import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiService } from './services/api';
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
import { Analytics } from "@vercel/analytics/react"

export interface User {
  id: number;
  name: string;
  email: string;
  purchasedBooks: number[];
  isAdmin?: boolean;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  ageRange: string;
  pages: number;
  image: string;
  previewImages: string[];
  featured: boolean;
  language: 'english' | 'arabic';
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBooks = await apiService.getAllBooks();
      setProducts(apiBooks);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('Error loading products:', err);
      // Fallback to empty array or show error message
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Refresh products function
  const refreshProducts = async () => {
    await loadProducts();
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
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
    setCart(prev => prev.map(item =>
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
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
      const newProduct = await apiService.createBook(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const updatedProduct = await apiService.updateBook(id, productData);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={user ? <Account /> : <Navigate to="/login" />} />
              <Route path="/login" element={user ? <Navigate to="/account" /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/account" /> : <Signup />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
