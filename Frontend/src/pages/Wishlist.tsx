import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Sparkles, X } from 'lucide-react';
import { useApp, Product } from '../App';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart } = useApp();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };
  if (wishlist.length === 0) {
    return (
      <div className="py-8 sm:py-16 px-4 min-h-screen">
        <div className="container mx-auto text-center">
          <div className="max-w-sm sm:max-w-md mx-auto">
            <div className="mb-6 sm:mb-8 animate-bounce relative">
              <Heart className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-pink-300 mx-auto mb-4" />
              <Sparkles className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-400 animate-pulse absolute top-0 left-1/2 transform -translate-x-8 sm:-translate-x-12" />
              <Sparkles className="h-4 sm:h-6 w-4 sm:w-6 text-blue-400 animate-pulse absolute top-2 right-1/2 transform translate-x-8 sm:translate-x-12" />
            </div>            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Your Wishlist is Empty! 💔
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed px-4">
              Start adding your favorite  books to create your dream collection! 
              Every book you love deserves a special place in your wishlist! 🌈
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Heart className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Find Books to Love</span>
              <span className="sm:hidden">Find Books</span>
              <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 animate-pulse" />
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-4 sm:py-8 px-3 sm:px-4 min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Heart className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-pink-500 mr-2 sm:mr-3 animate-pulse" />            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              My Wishlist
            </h1>
            <Sparkles className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 text-yellow-400 ml-2 sm:ml-3 animate-bounce" />
          </div>
          <p className="text-gray-600 text-lg sm:text-xl px-4">
            {wishlist.length} magical book{wishlist.length !== 1 ? 's' : ''} waiting for you! ✨
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {wishlist.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 animate-fadeInUp border-4 border-transparent hover:border-pink-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Remove Button */}
              <div className="relative">
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  aria-label="Remove from wishlist"
                >
                  <X className="h-3 sm:h-4 w-3 sm:w-4" />
                </button>

                {/* Product Image */}
                <Link to={`/product/${product.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 sm:h-56 md:h-64 object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Floating Category Badge */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5 md:p-6">
                <Link to={`/product/${product.id}`}>                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Details */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center">
                    <Star className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-400 mr-1" />
                    {product.category}
                  </span>
                  <span>{product.pages} pages</span>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    ${product.price}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-1 sm:space-x-2"
                  >
                    <ShoppingCart className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="text-center mt-8 sm:mt-12 space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto mb-3 sm:mb-0"
          >
            <Heart className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">Find More Books</span>
            <span className="sm:hidden">Find More</span>
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">View Cart</span>
            <span className="sm:hidden">Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
