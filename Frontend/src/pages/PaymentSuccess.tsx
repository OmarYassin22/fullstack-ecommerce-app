import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { useApp } from '../App';
import { apiService } from '../services/api';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useApp();
  const [isCapturing, setIsCapturing] = useState(true);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const captureAttempted = useRef(false); // Flag to prevent multiple capture attempts

  const capturePayment = useCallback(async () => {
    // Prevent multiple capture attempts
    if (captureAttempted.current) {
      return;
    }

    // Mark as attempted immediately to prevent duplicate calls
    captureAttempted.current = true;

    // Get PayPal order ID from URL parameters or session storage
    const payPalOrderId = searchParams.get('token') || 
                         searchParams.get('payPalOrderId') || 
                         sessionStorage.getItem('payPalOrderId');
    
    if (!payPalOrderId) {
      setCaptureError('Missing payment information. Please try again.');
      setIsCapturing(false);
      return;
    }

    // Check if this payment has already been processed
    const processedPayments = JSON.parse(localStorage.getItem('processedPayments') || '[]');
    if (processedPayments.includes(payPalOrderId)) {
      setCaptureError('This payment has already been processed.');
      setIsCapturing(false);
      return;
    }

    // Clean up old processed payments (keep only last 100)
    const cleanedProcessedPayments = processedPayments.slice(-100);

    try {
      
      // Capture the payment
      const captureResponse = await apiService.capturePayment({
        payPalOrderId: payPalOrderId
      });


      // Check if payment was successful based on the actual response structure
      // Status 2 typically means successful payment in PayPal
      if (captureResponse.transactionId && !captureResponse.errorMessage && captureResponse.status === 2) {
        setCaptureSuccess(true);
        clearCart(); // Clear cart only after successful capture
        
        // Mark this payment as processed
        const updatedProcessedPayments = [...cleanedProcessedPayments, payPalOrderId];
        localStorage.setItem('processedPayments', JSON.stringify(updatedProcessedPayments));
        
        // Store transaction ID for success message in account page
        sessionStorage.setItem('lastTransactionId', captureResponse.transactionId);
        sessionStorage.setItem('lastPaymentId', captureResponse.paymentId.toString());
        
        // Clean up session storage
        sessionStorage.removeItem('payPalOrderId');
        sessionStorage.removeItem('orderId');
        
        // Auto-redirect to account page after 3 seconds
        setTimeout(() => {
          navigate('/account?tab=library');
        }, 3000);
      } else {
        setCaptureError(captureResponse.errorMessage || 'Payment capture failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error capturing payment:', error);
      setCaptureError('Failed to complete payment. Please contact support.');
      // Reset the flag if there was an error so user can retry
      captureAttempted.current = false;
    } finally {
      setIsCapturing(false);
    }
  }, [searchParams, clearCart, navigate]);

  useEffect(() => {
    capturePayment();
  }, [capturePayment]);

  if (isCapturing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader className="h-16 w-16 text-purple-500 mx-auto mb-6 animate-spin" />
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Processing Payment...
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please wait while we complete your payment.
          </p>
        </div>
      </div>
    );
  }

  if (captureError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Payment Error
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {captureError}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (captureSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your purchase! Your  books are now available in your library.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/account?tab=library')}
              className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              View My Library
            </button>
            
            <button
              onClick={() => navigate('/catalog')}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Redirecting to your library in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;
