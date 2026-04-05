import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../App';

const Cart: React.FC = () => {
  const { cart, removeFromCart } = useApp();

  // Handle remove with confirmation
  const handleRemoveItem = (productId: number, productTitle: string) => {
    if (window.confirm(`Are you sure you want to remove "${productTitle}" from your cart?`)) {
      removeFromCart(productId);
    }
  };

  // Handle remove all items from the same category
  const handleRemoveCategory = (category: string) => {
    const itemsInCategory = cart.filter(item => item.product.category === category);
    if (itemsInCategory.length > 0) {
      if (window.confirm(`Are you sure you want to remove all ${category} books from your cart? (${itemsInCategory.length} items)`)) {
        itemsInCategory.forEach(item => removeFromCart(item.product.id));
      }
    }
  };

  // Calculate final price for each item (considering discounts)
  const getItemFinalPrice = (product: { price: number; discount?: number | null }) => {
    return product.discount && product.discount > 0 
      ? product.price * (1 - product.discount / 100)
      : product.price;
  };

  const subtotal = cart.reduce((total, item) => total + (getItemFinalPrice(item.product) * item.quantity), 0);
  // const tax = subtotal * 0.08; // 8% tax
  // const total = subtotal + tax;
  const total = subtotal; // No tax for simplicity

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <ShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Discover amazing coloring books and start your creative journey!
            </p>
            <Link
              to="/catalog"
              className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 inline-flex items-center"
            >
              Browse Books
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
          
          {cart.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all items from your cart?')) {
                  cart.forEach(item => removeFromCart(item.product.id));
                }
              }}
              className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Clear All</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {cart.map((item) => (
                <div key={item.product.id} className="p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link 
                        to={`/product/${item.product.id}`}
                        className="text-xl font-bold text-gray-800 dark:text-white mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors block"
                      >
                        {item.product.title}
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{item.product.category} • Digital Copy</span>
                        {cart.filter(cartItem => cartItem.product.category === item.product.category).length > 1 && (
                          <button
                            onClick={() => handleRemoveCategory(item.product.category)}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                            title={`Remove all ${item.product.category} books`}
                          >
                            (Remove all {item.product.category})
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        {item.product.discount && item.product.discount > 0 ? (
                          <>
                            <p className="text-sm text-gray-500 line-through">${item.product.price.toFixed(2)}</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              ${getItemFinalPrice(item.product).toFixed(2)}
                            </p>
                            <p className="text-sm text-green-600 font-semibold">
                              {item.product.discount}% OFF
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${item.product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      {/* Digital Book Badge */}
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          Digital Copy
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                        className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-gray-800 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax</span>
                  <span className="font-semibold text-gray-800 dark:text-white">${tax.toFixed(2)}</span>
                </div> */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 flex items-center justify-center mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                to="/catalog"
                className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-center font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
