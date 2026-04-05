import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, FileText, Download, Heart, Home, BookOpen } from 'lucide-react';
import { useApp } from '../App';
import { apiService } from '../services/api';
import BookReader from '../components/BookReader';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user, addToWishlist, removeFromWishlist, isInWishlist, loading, error } = useApp();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  // Scroll to top when component mounts or when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  // Fetch product details if not found locally
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const productId = parseInt(id);
      const localProduct = products.find(p => p.id === productId);
      
      if (!localProduct && !loading && !error) {
        try {
          setProductLoading(true);
          setProductError('');
          await apiService.getBookById(productId);
          // If we got a product from API, we might want to add it to local state
          // This depends on how you want to manage the state
        } catch (err) {
          console.error('Error fetching product:', err);
          setProductError('Failed to load product details');
        } finally {
          setProductLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id, products, loading, error]);

  const product = products.find(p => p.id === parseInt(id || ''));

  // Check ownership when component mounts or user/product changes
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !product) {
        setIsOwned(false);
        return;
      }

      try {
        const owned = await apiService.checkBookOwnership(product.id);
        setIsOwned(owned);
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwned(false);
      }
    };

    checkOwnership();
  }, [user, product]);

  if (loading || productLoading) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-gray-600 mt-4">Loading product details...</p>
      </div>
    );
  }

  if (error || productError) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-red-800 mb-4">Error Loading Product</h1>
        <p className="text-red-600 mb-4">{error || productError}</p>
        <Link to="/" className="text-purple-600 hover:text-purple-700">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="text-8xl mb-6">🎨</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
        <p className="text-gray-600 mb-4">The  book you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-purple-600 hover:text-purple-700">
          ← Back to home
        </Link>
      </div>
    );
  }
  
  const allImages = [product.image, ...product.previewImages];

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleReadBook = () => {
    setIsReaderOpen(true);
  };

  const handleCloseReader = () => {
    setIsReaderOpen(false);
  };

  const handleDownloadBook = async () => {
    setIsDownloading(true);
    
    try {
      const downloadUrl = await apiService.downloadBook(product.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${product.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading book:', error);
      if (error instanceof Error) {
        alert(`Failed to download book: ${error.message}`);
      } else {
        alert('Failed to download book. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="py-8 px-4 relative">
      {/* Sticky Back Button */}
      <button
        onClick={handleBackToHome}
        className="fixed top-20 left-4 z-50 bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-800 px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 backdrop-blur-sm bg-white/95"
        aria-label="Go back to home page"
      >
        <Home className="h-4 w-4" />
        <span className="font-medium text-sm sm:text-base hidden sm:inline">Home</span>
        <span className="font-medium text-sm sm:hidden">←</span>
      </button>

      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="mb-4">
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={allImages[selectedImage]}
                  alt={product.title}
                  className="w-full h-96 object-contain"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                </div>
                {isOwned && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Owned
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail gallery */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-purple-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.title}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-gray-600 ml-2">(127 reviews)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  <span>{product.category}</span>
                </div> */}
                <div className="flex items-center text-gray-600">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  <span>{product.pages} pages</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Download className="h-5 w-5 mr-2 text-purple-600" />
                  <span>Instant download</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 mr-2 text-purple-600" />
                  <span>Premium quality</span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    {product.discount && product.discount > 0 ? (
                      <>
                        <div className="text-2xl text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="text-4xl font-bold text-purple-600">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </div>
                        <div className="text-lg text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full inline-block w-fit">
                          {product.discount}% OFF
                        </div>
                      </>
                    ) : (
                      <div className="text-4xl font-bold text-purple-600">
                        ${product.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      isInWishlist(product.id)
                        ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-6 w-6 transition-all duration-300 ${isInWishlist(product.id) ? 'fill-current animate-pulse' : ''}`} />
                  </button>
                </div>                {isOwned ? (
                  <div className="space-y-3">
                    <button 
                      onClick={handleReadBook}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg border border-blue-400"
                    >
                      <BookOpen className="h-5 w-5 mr-2 text-white" />
                      <span className="text-white font-bold">Read Online</span>
                    </button>
                    <button 
                      onClick={handleDownloadBook}
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-full text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg border border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span className="text-white font-bold">Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2 text-white" />
                          <span className="text-white font-bold">Download PDF</span>
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      You own this book. Read it online or download the PDF anytime.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </button>
                    <Link
                      to="/cart"
                      className="block w-full border-2 border-purple-600 text-purple-600 py-4 rounded-full text-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-center"
                    >
                      Buy Now
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What's Included</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  High-resolution PDF ready for printing
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  {product.pages} unique  pages
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Lifetime access and re-download
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Compatible with all devices
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 3)
              .map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-contain hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-purple-600 transition-colors font-heading">
                        {relatedProduct.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {relatedProduct.discount && relatedProduct.discount > 0 ? (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                ${relatedProduct.price.toFixed(2)}
                              </span>
                              <span className="text-2xl font-bold text-purple-600">
                                ${(relatedProduct.price * (1 - relatedProduct.discount / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-green-600 font-semibold">
                                {relatedProduct.discount}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-purple-600">
                              ${relatedProduct.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>
            
            <Link
              to="/catalog"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse All Books
            </Link>
          </div>
        </div>
      </div>

      {/* Book Reader Modal */}
      <BookReader
        bookId={product.id}
        bookTitle={product.title}
        isOpen={isReaderOpen}
        onClose={handleCloseReader}
      />
    </div>
  );
};

export default ProductDetail;