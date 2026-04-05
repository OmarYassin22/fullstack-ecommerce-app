import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useApp } from '../App';
import { apiService, CreateOrderRequest } from '../services/api';

const Checkout: React.FC = () => {
  const { cart, user, removeFromCart } = useApp();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownedBookIds, setOwnedBookIds] = useState<number[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    phoneNumber: '',
    email: user?.email || '',
    notes: ''
  });

  // Calculate final price for each item (considering discounts)
  const getItemFinalPrice = (product: { price: number; discount?: number | null }) => {
    return product.discount && product.discount > 0 
      ? product.price * (1 - product.discount / 100)
      : product.price;
  };

  const subtotal = cart.reduce((total, item) => total + (getItemFinalPrice(item.product) * item.quantity), 0);
  // const tax = subtotal * 0.08;
  // const total = subtotal + tax;
  const total = subtotal; // No tax for simplicity

  // Check for owned books when component mounts or user changes
  useEffect(() => {
    const checkOwnedBooks = async () => {
      if (!user) return;
      
      try {
        const userBooks = await apiService.getUserBooks();
        const ownedIds = userBooks.map(book => book.id);
        setOwnedBookIds(ownedIds);
        
        // Check if any cart items are already owned
        const conflictingBooks = cart.filter(item => ownedIds.includes(item.product.id));
        if (conflictingBooks.length > 0) {
          const bookTitles = conflictingBooks.map(item => item.product.title).join(', ');
          setError(`You already own the following books: ${bookTitles}. Please remove them from your cart to continue.`);
        }
      } catch (err) {
        console.error('Error checking owned books:', err);
      }
    };

    checkOwnedBooks();
  }, [user, cart]);

  const handlePayment = async () => {
    if (!user) {
      setError('Please log in to continue with payment');
      return;
    }

    if (!customerInfo.phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderData: CreateOrderRequest = {
        BookIds: cart.map(item => item.product.id),
        TotalPrice: total,
        PhoneNumber: customerInfo.phoneNumber,
        Email: customerInfo.email,
        notes: customerInfo.notes
      };

      const orderResponse = await apiService.createOrder(orderData);

      // Step 2: Create payment with the order ID
      const paymentData = {
        orderId: orderResponse.id,
        amount: orderResponse.totalPrice,
        currency: "USD",
        paymentMethod: 1,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };

      const paymentResponse = await apiService.createPayment(paymentData);

      // Store payment info in session storage for potential use in success page
      sessionStorage.setItem('payPalOrderId', paymentResponse.payPalOrderId);
      sessionStorage.setItem('orderId', orderResponse.id.toString());

      // Step 3: Redirect to PayPal approval URL
      if (paymentResponse.approvalUrl) {
        window.location.href = paymentResponse.approvalUrl;
      } else {
        throw new Error('No approval URL received from payment service');
      }

    } catch (error: unknown) {
      console.error('Error processing payment:', error);
      
      // Check if the error is about already owning books
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (apiError.response?.status === 400) {
          const errorMessage = apiError.response?.data?.message || apiError.message;
          if (errorMessage && errorMessage.toLowerCase().includes('already have these books')) {
            setError('You already own some of these books in your library. Please remove them from your cart and try again.');
          } else {
            setError(errorMessage || 'Failed to process order. Please try again.');
          }
        } else {
          setError('Failed to process payment. Please try again.');
        }
      } else {
        setError('Failed to process payment. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const isOwned = ownedBookIds.includes(item.product.id);
                return (
                  <div key={item.product.id} className={`flex items-center gap-4 p-4 border rounded-lg ${isOwned ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{item.product.title}</h3>
                        {isOwned && (
                          <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full font-medium">
                            Already Owned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.product.category} • Digital Copy</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {isOwned ? 'In Your Library' : 'Digital Book'}
                        </span>
                        <div className="text-right">
                          {item.product.discount && item.product.discount > 0 ? (
                            <>
                              <div className="text-xs text-gray-500 line-through">
                                ${item.product.price.toFixed(2)}
                              </div>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                ${getItemFinalPrice(item.product).toFixed(2)}
                              </span>
                              <div className="text-xs text-green-600">{item.product.discount}% OFF</div>
                            </>
                          ) : (
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              ${item.product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {/* <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div> */}
              <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total</span>
                <span className="text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Payment Method</h2>

            {/* Security Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 font-medium">Secure SSL Encrypted Payment</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your payment information is protected with bank-level security
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <div className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Order Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {error.toLowerCase().includes('already own') && (
                        <>
                          <button
                            onClick={() => navigate('/account?tab=library')}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm underline"
                          >
                            View your library →
                          </button>
                          <button
                            onClick={() => {
                              // Remove owned books from cart
                              ownedBookIds.forEach(bookId => {
                                const cartItem = cart.find(item => item.product.id === bookId);
                                if (cartItem) removeFromCart(bookId);
                              });
                              setError(null);
                            }}
                            className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Remove owned books from cart
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || user?.userName || ''}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phoneNumber}
                    onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special instructions or notes"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* PayPal Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Choose Payment Method</h3>
              
              {/* Order Processing Option */}
              <div className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-purple-600 dark:bg-purple-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Order</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">Complete Order</span>
                  </div>
                  <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Your order will be processed and books will be available for download immediately.
                </p>
                
                {/* PayPal Friends and Family Notice */}
           
                
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Complete Order - ${total.toFixed(2)}</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Order Info */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Secure Order Processing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your order will be processed securely and you'll receive immediate access to download your  books.
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
              <p>
                By completing your purchase, you agree to our{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Why Choose Bright Minds?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-1">Secure Processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your order is processed with enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-1">Instant Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Download your books immediately after order completion</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 font-bold">∞</span>
              </div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-1">Lifetime Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Download your books anytime, forever</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
