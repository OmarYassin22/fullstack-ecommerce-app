import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { apiService, ApiError, ValidationError } from '../services/api';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName: string) => {
    return errors.some(error => error.code.toLowerCase() === fieldName.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    if (password !== confirmPassword) {
      setErrors([{ code: 'PasswordMismatch', description: 'Passwords do not match' }]);
      return;
    }

    setIsLoading(true);

    try {
      await apiService.register({
        email,
        password,
        userName: name,
        phoneNumber
      });

      // On successful registration (200 status), show success message and redirect
      setIsSuccess(true);
      
      // Redirect to login page after a brief delay to show success message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if the error is a validation error with field-specific errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const validationError = error as ValidationError;
        const errorList: ApiError[] = [];
        
        // Convert validation errors to our ApiError format
        Object.entries(validationError.errors).forEach(([field, messages]) => {
          messages.forEach(message => {
            errorList.push({
              code: field,
              description: message
            });
          });
        });
        
        setErrors(errorList);
      } else if (Array.isArray(error)) {
        // Handle array of ApiError objects
        setErrors(error as ApiError[]);
      } else {
        // Handle generic errors
        setErrors([{ code: 'RegistrationError', description: 'Registration failed. Please try again.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-300">Join thousands of happy families!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('name') 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('email') 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('phoneNumber') 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('password') 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('confirmPassword') 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-800 dark:text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 text-purple-600 dark:text-purple-400 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Privacy Policy</a>
              </label>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-medium text-green-800">Registration Successful!</p>
                <p className="text-sm text-green-600">Your account has been created. Redirecting to login page...</p>
              </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-medium text-red-800">{error.code}</p>
                    <p className="text-sm text-red-600">{error.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSuccess ? 'Redirecting...' : isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;