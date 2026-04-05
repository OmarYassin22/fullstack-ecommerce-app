import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Sparkles } from 'lucide-react';
import { Product, useApp } from '../App';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-105 overflow-hidden border-2 border-orange-100 hover:border-orange-300 animate-fadeInUp hover:animate-magicSparkle">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-64 object-contain group-hover:scale-110 transition-transform duration-500 filter group-hover:brightness-110"
          />
          
          {/* Floating sparkles */}
          <Sparkles className="h-6 w-6 text-yellow-400 absolute top-2 right-2 animate-magicSparkle" />
          <Sparkles className="h-4 w-4 text-pink-400 absolute top-8 left-2 animate-magicSparkle" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="h-3 w-3 text-blue-400 absolute bottom-4 right-8 animate-magicSparkle" style={{ animationDelay: '1s' }} />
          
          <div className="absolute top-4 left-4">
            <span className="bg-magic-rainbow text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-float border border-white">
              {product.category}
            </span>
          </div>
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-4 right-12 p-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
              isInWishlist(product.id)
                ? 'bg-pink-500 text-white animate-heartbeat'
                : 'bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
            } shadow-lg backdrop-blur-sm`}
            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
          
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center space-x-1 shadow-lg">
              <Star className="h-4 w-4 text-yellow-400 fill-current animate-sparkle" />
              <span className="text-sm font-bold text-gray-800">4.8</span>
            </div>
          </div>
        </div>        {/* Content */}
        <div className="p-6 bg-gradient-to-br from-white to-orange-50">
          <div className="flex items-center justify-end mb-3">
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold border border-blue-200">{product.pages} pages</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
            {product.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col min-h-[80px] justify-end">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full inline-block w-fit">
                    {product.discount}% OFF
                  </span>
                </>
              ) : (
                <>
                  <div className="h-6"></div>
                  <span className="text-2xl font-bold text-gray-800">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="h-6"></div>
                </>
              )}
            </div>
              <button
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 hover:scale-110 transition-all duration-300 transform flex items-center gap-2 shadow-lg font-semibold border border-blue-400 hover:border-blue-300"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;