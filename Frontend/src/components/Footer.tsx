import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">          {/* Brand */}
          <div>            <div className="mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-heading">
                Bright Minds
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4">
              Inspiring creativity and developing Bright minds through educational books for children of all ages.
            </p>
            <div className="flex items-center text-pink-400 dark:text-pink-300">
              <Heart className="h-4 w-4 mr-2" />
              <span className="text-sm">Made with love for bright minds</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Browse Books
                </Link>
              </li>              <li>
                <Link to="/catalog?category=Learning" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Learning
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Math" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Math
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=Science" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  My Books
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400 dark:text-gray-300">
                <Mail className="h-4 w-4 mr-3" />
                <span>contact@example.com</span>
              </div>
              {/* <div className="flex items-center text-gray-400 dark:text-gray-300">
                <Phone className="h-4 w-4 mr-3" />
                <span>1-800-Bright</span>
              </div> */}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400 dark:text-gray-300 mb-2">Follow us for new releases!</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                  f
                </div>
                <a 
                  href="https://example.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Y
                </a>
                <a 
                  href="https://example.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-500 dark:hover:to-pink-500 transition-colors"
                >
                  I
                </a>
              </div>
            </div>
          </div>
        </div>        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-300 text-sm">
            © 2025 Bright Minds. All rights reserved. | 
            <span className="text-purple-400 dark:text-purple-300"> Developed by Development Team </span>
            <span className="text-gray-400 dark:text-gray-300"> | Privacy Policy | Terms of Service</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;