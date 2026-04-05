import React, { useState, useEffect } from 'react';
import { Download, User, Heart, ShoppingBag, Settings, CheckCircle, X, BookOpen } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import { ApiBook, apiService } from '../services/api';
import BookReader from '../components/BookReader';

const Account: React.FC = () => {
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('library');
  const [userBooks, setUserBooks] = useState<ApiBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ApiBook | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [downloadingBooks, setDownloadingBooks] = useState<Set<number>>(new Set());

  // Check for success message from payment
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    // Check if coming from successful payment
    const transactionId = sessionStorage.getItem('lastTransactionId');
    if (transactionId && tab === 'library') {
      setShowSuccessMessage(true);
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clean up session storage
        sessionStorage.removeItem('lastTransactionId');
        sessionStorage.removeItem('lastPaymentId');
      }, 10000);
    }
  }, [searchParams]);

  // Fetch user books from API
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const books = await apiService.getUserBooks();
        setUserBooks(books);
      } catch (error) {
        console.error('Error fetching user books:', error);
        setError('Failed to load your books. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [user]);

  if (!user) return null;

  const purchasedBooks = userBooks;

  // Function to refresh user books
  const refreshUserBooks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const books = await apiService.getUserBooks();
      setUserBooks(books);
    } catch (error) {
      console.error('Error fetching user books:', error);
      setError('Failed to load your books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reading a book online
  const handleReadBook = (book: ApiBook) => {
    setSelectedBook(book);
    setIsReaderOpen(true);
  };

  // Handle closing the book reader
  const handleCloseReader = () => {
    setIsReaderOpen(false);
    setSelectedBook(null);
  };

  // Handle downloading a book
  const handleDownloadBook = async (book: ApiBook) => {
    setDownloadingBooks(prev => new Set(prev).add(book.id));
    
    try {
       const pdfUrl = await apiService.downloadBook(book.id);
       
      // Use fetch to get the blob and force download
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
       
      if (blob.size === 0) {
        throw new Error('Received empty file');
      }
      
      // Create blob URL and force download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
       link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
     } catch (error) {
      console.error('Error downloading book:', error);
      if (error instanceof Error) {
        alert(`Failed to download book: ${error.message}`);
      } else {
        alert('Failed to download book. Please try again.');
      }
    } finally {
      setDownloadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  const tabs = [
    { id: 'library', name: 'My Library', icon: ShoppingBag },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    // { id: 'profile', name: 'Profile', icon: User },
    // { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name || user.userName}</h1>
              <p className="text-purple-100 dark:text-purple-200">{user.email}</p>
              <p className="text-purple-100 dark:text-purple-200 text-sm">
                {user.roles.includes('Admin') ? 'Admin' : 'Member'} • {purchasedBooks.length} books owned
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === 'library') {
                            refreshUserBooks();
                          }
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'library' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                {/* Success Message */}
                {showSuccessMessage && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                          🎉 Purchase Successful!
                        </h3>
                        <p className="text-green-700 dark:text-green-400 mb-3">
                          Your  books have been added to your library and are ready to download!
                        </p>
                        {sessionStorage.getItem('lastTransactionId') && (
                          <p className="text-sm text-green-600 dark:text-green-500">
                            Transaction ID: <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                              {sessionStorage.getItem('lastTransactionId')}
                            </span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Books</h2>
                  <button
                    onClick={refreshUserBooks}
                    disabled={isLoading}
                    className="bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">{error}</span>
                      <button
                        onClick={refreshUserBooks}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading your books...</p>
                  </div>
                ) : purchasedBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {purchasedBooks.map((book) => (
                      <div key={book.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="flex gap-4">
                          <img
                            src={book.imageUrls?.[0] || book.image || '/placeholder-book.png'}
                            alt={book.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{book.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {book.category} • pages: {book.pagesNumber || book.pages} 
                              {book.discount && book.discount > 0 && (
                                <span className="ml-2 text-green-600 dark:text-green-400">
                                  ({book.discount}% off)
                                </span>
                              )}
                            </p>
                            {book.pdfPath ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleReadBook(book)}
                                  className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2"
                                >
                                  <BookOpen className="h-4 w-4" />
                                  <span>Read Online</span>
                                </button>
                                <button 
                                  onClick={() => handleDownloadBook(book)}
                                  disabled={downloadingBooks.has(book.id)}
                                  className="bg-green-600 dark:bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {downloadingBooks.has(book.id) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Downloading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4" />
                                      <span>Download</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                                📝 PDF is being prepared and will be available soon
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No books yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Start building your book collection!</p>
                    <Link
                      to="/catalog"
                      className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors inline-block"
                    >
                      Browse Collection
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Wishlist</h2>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Save your favorite  books for later!</p>
                  <a
                    href="/catalog"
                    className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                  >
                    Discover Books
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Profile Information</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name || user.userName}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-['Fredoka']">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates about new  books</p>
                    </div>
                    <input type="checkbox" className="h-5 w-5 text-purple-600 dark:text-purple-400" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Marketing Emails</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Special offers and promotions</p>
                    </div>
                    <input type="checkbox" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Book Reader Modal */}
        {selectedBook && (
          <BookReader
            bookId={selectedBook.id}
            bookTitle={selectedBook.title}
            isOpen={isReaderOpen}
            onClose={handleCloseReader}
          />
        )}
      </div>
    </div>
  );
};

export default Account;