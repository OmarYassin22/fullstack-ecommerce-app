import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ChevronDown, Tag, ArrowUpDown, X, Globe } from 'lucide-react';
import { useApp } from '../App';
import ProductCard from '../components/ProductCard';

const Catalog: React.FC = () => {
  const { products, loading, error } = useApp();
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const languages = ['All', 'English', 'Arabic'];

  // Initialize search query from URL on component mount
  useEffect(() => {
    const searchQueryFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');
    
    if (searchQueryFromUrl && !searchQuery) {
      setSearchQuery(searchQueryFromUrl);
    }
    
    if (categoryFromUrl && selectedCategory === 'All') {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);
  useEffect(() => {
    let filtered = [...products];

    // Apply local search filter (real-time search)
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    const categoryFromUrl = searchParams.get('category');
    const activeCategory = categoryFromUrl || selectedCategory;
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Apply language filter
    if (selectedLanguage && selectedLanguage !== 'All') {
      filtered = filtered.filter(product => product.language === selectedLanguage.toLowerCase());
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchParams, selectedCategory, selectedLanguage, sortBy, searchQuery]);

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Advanced Book Search</h1>
          <p className="text-xl text-gray-600 mb-6">
            Use powerful filters and search to find exactly what you're looking for
          </p>
          
          {/* Search Input */}
          <div className="max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search  books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-lg text-lg font-medium placeholder-gray-400 transition-all duration-200 hover:shadow-xl group"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-lg border border-purple-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 bg-white text-purple-600 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-purple-200"
            >
              <Filter className="h-5 w-5" />
              <span>Show Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="ml-2 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedLanguage !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <Globe className="h-3 w-3 mr-1" />
                  {selectedLanguage}
                  <button
                    onClick={() => setSelectedLanguage('All')}
                    className="ml-2 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Filters */}
            <div className={`flex flex-col sm:flex-row gap-4 w-full lg:w-auto ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <div className="flex-1 min-w-0">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-purple-600" />
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-purple-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-green-600" />
                  Language
                </label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-green-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-1 text-indigo-600" />
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-indigo-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <option value="featured">⭐ Featured</option>
                    <option value="title">📝 Title A-Z</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>            {/* Clear All Filters Button */}
            {(selectedCategory !== 'All' || selectedLanguage !== 'All' || searchQuery) && (
              <button                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedLanguage('All');
                  setSearchQuery('');
                }}
                className="flex items-center space-x-2 bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-full hover:bg-red-200 transition-all duration-200 border border-red-200 whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count and Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Book' : 'Books'} Found
                </p>
                <p className="text-sm text-gray-600">
                  {filteredProducts.length === products.length 
                    ? 'Showing all  books' 
                    : `Filtered from ${products.length} total books`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* {filteredProducts.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                {Math.ceil(filteredProducts.length / 12)} {Math.ceil(filteredProducts.length / 12) === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
          )} */}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading amazing  books...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-3xl border-2 border-dashed border-red-200">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">⚠️</div>
              <h3 className="text-3xl font-bold text-red-800 mb-3">Error Loading Books</h3>
              <p className="text-red-600 mb-8 text-lg">
                We couldn't load the  books. Please try again later.
              </p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">🎨</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">No Books Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                We couldn't find any  books matching your criteria. 
                Try adjusting your filters or search terms to discover more amazing books!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedLanguage('All');
                    setSortBy('featured');
                    setSearchQuery('');
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <X className="h-4 w-4" />
                  <span>Clear All Filters</span>
                </button>
                
                <button
                  onClick={() => setSearchQuery('')}
                  className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Search className="h-4 w-4" />
                  <span>Clear Search</span>
                </button>
              </div>
              
              <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                      <p className="text-sm text-gray-600 mb-2 font-medium">💡 Try searching for:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                  {['Learning', 'Math', 'Science', 'Story', 'Activity'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors border border-purple-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;