import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Settings, Heart, ChevronDown, BookOpen, Sparkles, Rocket, Sun, Moon, LucideIcon, Calculator, Book, Zap, GraduationCap } from 'lucide-react';
import { useApp } from '../App';
import { apiService } from '../services/api';

const Header: React.FC = () => {
  const { user, setUser, cart, wishlist, products, theme, toggleTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category))];  // Get category icons
  const getCategoryIcon = (category: string): LucideIcon => {
    const categoryIcons: Record<string, LucideIcon> = {
      'Learning': GraduationCap,
      'Math': Calculator,
      'Story': Book,
      'Science': Rocket,
      'Activity': Zap,
      'Reading': BookOpen,
    };
    return categoryIcons[category] || BookOpen;
  };

  const handleLogout = () => {
    // Clear authentication token
    apiService.clearAuthToken();
    // Clear user state
    setUser(null);
    // Navigate to home page
    navigate('/');
  };

  // Helper function to close mobile menu and reset states
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsMobileCategoriesOpen(false);
  };

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCategoriesOpen && !(event.target as Element).closest('.categories-dropdown')) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoriesOpen]);
  return (
    <header className="bg-white dark:bg-gray-800 shadow-xl border-b-4 border-magic-rainbow sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">          {/* Brand Name */}
          <Link to="/" className="hover:scale-105 transition-transform duration-300 group">            <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-heading">
              Bright Minds
            </span>
          </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/catalog" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
              Browse Books
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group categories-dropdown">
              <button
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors py-2"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                onMouseEnter={() => setIsCategoriesOpen(true)}
              >
                <span>Categories</span>
                <ChevronDown className="h-4 w-4 transform transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-3 transition-all duration-300 transform ${isCategoriesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-t-2xl">
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    <span>Browse by Category</span>
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {categories.map((category) => {
                    const CategoryIcon = getCategoryIcon(category);
                    const categoryProducts = products.filter(p => p.category === category);

                    return (
                      <Link
                        key={category}
                        to={`/catalog?category=${encodeURIComponent(category)}`}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all duration-200 group rounded-xl mx-2"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 transform group-hover:scale-110">
                          <CategoryIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                            {category}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-400 transition-colors">
                            {categoryProducts.length} magical book{categoryProducts.length !== 1 ? 's' : ''} ✨
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronDown className="h-4 w-4 text-purple-500 transform -rotate-90" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 mt-2 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/50 rounded-b-2xl">
                  <Link
                    to="/catalog"
                    className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-all duration-200 text-sm py-2 px-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-800/50 transform hover:scale-105"
                    onClick={() => setIsCategoriesOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View All Books</span>
                    <Sparkles className="h-3 w-3 text-pink-500 animate-pulse" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin Link */}
            {user?.isAdmin && (
              <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Theme Toggle */}
            {/* <button
              onClick={toggleTheme}
              className="relative text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/50"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="relative w-6 h-6">
                <Sun className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                <Moon className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </button> */}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-300 hover:text-pink-600 transition-colors group p-1">
              <Heart className="h-6 w-6 group-hover:animate-pulse" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium animate-bounce text-[10px] sm:text-xs">
                  {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-purple-600 transition-colors p-1">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium text-[10px] sm:text-xs">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/account" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors">
                    My Account
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              if (isMenuOpen) {
                closeMobileMenu();
              } else {
                setIsMenuOpen(true);
              }
            }}
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="space-y-4">
              <Link
                to="/catalog"
                className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                Browse Books
              </Link>

              {/* Categories in Mobile Menu */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="w-full flex items-center justify-between py-3 px-3 text-sm font-semibold text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Categories</span>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
                      {categories.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isMobileCategoriesOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileCategoriesOpen
                    ? 'max-h-96 opacity-100 mt-3'
                    : 'max-h-0 opacity-0'
                  }`}>
                  <div className="space-y-1 pl-2">
                    {categories.map((category) => {
                      const CategoryIcon = getCategoryIcon(category);
                      const categoryProducts = products.filter(p => p.category === category);

                      return (
                        <Link
                          key={category}
                          to={`/catalog?category=${encodeURIComponent(category)}`}
                          className="flex items-center space-x-3 py-3 px-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 group"
                          onClick={closeMobileMenu}
                        >
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {category}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {categoryProducts.length} book{categoryProducts.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <ChevronDown className="h-3 w-3 text-gray-400 dark:text-gray-500 rotate-[-90deg] group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Admin Panel
                </Link>
              )}

              <Link
                to="/wishlist"
                className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 px-1"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">My Wishlist</span>
                </div>
                {wishlistItemCount > 0 && (
                  <span className="bg-pink-500 dark:bg-pink-400 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                    {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 px-1"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Shopping Cart</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-red-500 dark:bg-red-400 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle in Mobile Menu */}
              {/* <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 py-2 px-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-full"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div> */}

              {user ? (
                <>
                  <Link
                    to="/account"
                    className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                    onClick={closeMobileMenu}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;