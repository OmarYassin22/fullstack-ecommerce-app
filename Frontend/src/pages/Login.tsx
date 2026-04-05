import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../App';
import { apiService, ApiError, ValidationError } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ApiError[]>([]);
  const { setUser } = useApp();
  const navigate = useNavigate();

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName: string) => {
    return errors.some(error => error.code.toLowerCase() === fieldName.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      await apiService.login({ email, password });
      
      // Get user profile from API
      const profile = await apiService.getUserProfile();
      
      // Update app state with profile data
      setUser({
        id: profile.id,
        userName: profile.userName,
        email: profile.email,
        roles: profile.roles,
        name: profile.userName, // For backward compatibility
        isAdmin: profile.roles.includes('Admin'),
        purchasedBooks: [] // Initialize with empty array
      });
      
      // Navigate to appropriate page
      if (profile.roles.includes('Admin')) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (error) {
      console.error('Login error:', error);
      
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
        setErrors([{ code: 'LoginError', description: 'Login failed. Please check your credentials and try again.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to access your  books</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('email') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    hasFieldError('password') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {/* <div className="text-right">
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                Forgot your password?
              </a>
            </div> */}

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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>

     
        </div>
      </div>
    </div>
  );
};

export default Login;