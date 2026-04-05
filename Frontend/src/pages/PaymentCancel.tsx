import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your payment was cancelled. No charges were made to your account.
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
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Your items are still in your cart.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
