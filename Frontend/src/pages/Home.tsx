import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Download, Shield, BookOpen, ChevronLeft, ChevronRight, Sparkles, Rocket, Calculator, Book, LucideIcon, GraduationCap, Zap } from 'lucide-react';
import { useApp } from '../App';

const Home: React.FC = () => {
  const { products, loading, error } = useApp();

  // Auto-sliding state
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const intervalRefs = useRef<number[]>([]);

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);
  const categories = Object.keys(productsByCategory);
  // Get category-specific icon and colors
  const getCategoryVisualization = (category: string) => {
    const visualizations: Record<string, { icon: LucideIcon, gradient: string, bgColor: string, description: string }> = {
      'Learning': {
        icon: GraduationCap,
        gradient: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        description: 'Educational content and skill development'
      },
      'Math': {
        icon: Calculator,
        gradient: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        description: 'Numbers, counting, and mathematical concepts'
      },
      'Story': {
        icon: Book,
        gradient: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        description: 'Imaginative tales and storytelling adventures'
      },
      'Science': {
        icon: Rocket,
        gradient: 'from-cyan-500 to-blue-500',
        bgColor: 'bg-cyan-50',
        description: 'Discover the wonders of science and nature'
      },
      'Activity': {
        icon: Zap,
        gradient: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        description: 'Fun activities, puzzles, and games'
      },
      'Reading': {
        icon: BookOpen,
        gradient: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-50',
        description: 'Reading comprehension and literacy skills'
      }
    };

    return visualizations[category] || {
      icon: BookOpen,
      gradient: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Creative and educational content'
    };
  }; const scrollToSection = (direction: 'left' | 'right', categoryIndex: number) => {
    const scrollContainer = document.getElementById(`category-scroll-${categoryIndex}`);
    if (scrollContainer) {
      const scrollAmount = 168; // Width of one card plus gap (144 + 24)
      const currentScroll = scrollContainer.scrollLeft;
      const newScroll = direction === 'left'
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;

      scrollContainer.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };  // Auto-slide function
  const autoSlide = (categoryIndex: number) => {
    const scrollContainer = document.getElementById(`category-scroll-${categoryIndex}`);
    if (scrollContainer) {
      const scrollAmount = 168;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const currentScroll = scrollContainer.scrollLeft;

      // If we've reached the end, scroll back to the beginning
      if (currentScroll >= maxScroll - 10) {
        scrollContainer.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // Otherwise, scroll to the next item
        scrollContainer.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // Setup auto-sliding intervals
  useEffect(() => {
    if (isAutoSliding) {
      // Clear any existing intervals
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current = [];

      // Create intervals for each category
      categories.forEach((_, categoryIndex) => {
        const interval = window.setInterval(() => {
          autoSlide(categoryIndex);
        }, 4000 + (categoryIndex * 500)); // Stagger the sliding with different delays

        intervalRefs.current.push(interval);
      });
    }

    // Cleanup function
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current = [];
    };
  }, [isAutoSliding, categories]);

  // Pause auto-sliding when user interacts with navigation
  const handleUserInteraction = (categoryIndex: number, direction: 'left' | 'right') => {
    // Temporarily pause auto-sliding
    setIsAutoSliding(false);
    scrollToSection(direction, categoryIndex);

    // Resume auto-sliding after 10 seconds
    setTimeout(() => {
      setIsAutoSliding(true);
    }, 10000);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Loading Bright Minds...</h2>
          <p className="text-gray-600 dark:text-gray-300">Fetching our amazing collection of books</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg mb-4">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (<div>
    {/* Hero Section */}
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Floating Background Elements */}        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="floating-element cloud-element w-20 h-12 top-20 left-10 animate-cloudFloat opacity-60"></div>
        <div className="floating-element cloud-element w-16 h-10 top-40 right-20 animate-cloudFloat opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="floating-element cloud-element w-24 h-14 bottom-32 left-1/4 animate-cloudFloat opacity-40" style={{ animationDelay: '4s' }}></div>
        <div className="floating-element cloud-element w-18 h-11 top-60 right-1/3 animate-cloudFloat opacity-55" style={{ animationDelay: '1s' }}></div>

        {/* Sparkle Elements */}
        <div className="floating-element w-2 h-2 bg-magic-yellow rounded-full top-16 left-1/4 animate-magicSparkle"></div>
        <div className="floating-element w-3 h-3 bg-magic-pink rounded-full top-32 right-1/4 animate-magicSparkle" style={{ animationDelay: '1.5s' }}></div>
        <div className="floating-element w-2 h-2 bg-magic-blue rounded-full bottom-40 left-1/3 animate-magicSparkle" style={{ animationDelay: '3s' }}></div>
        <div className="floating-element w-4 h-4 bg-magic-purple rounded-full top-72 left-3/4 animate-magicSparkle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="absolute inset-0 bg-magic-rainbow opacity-20"></div>
      <div className="container mx-auto text-center relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-800 mb-6 leading-tight animate-fadeInUp">
          Unlock Your Child's
          <span className="bg-gradient-to-r p-3 from-orange-500 via-pink-500 to-blue-500 bg-clip-text text-transparent block animate-colorShift">
            Bright Minds
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Discover our complete collection of educational digital  books designed to spark creativity and learning.
          Browse by category, instant download, endless creative fun!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>            <a
          href="#books-collection"
          className="btn-magic inline-flex items-center gap-2 transform hover:scale-110 transition-all duration-300"
        >
          <span>Explore Collection</span>
          <ArrowRight className="h-5 w-5 animate-float" />
        </a>
          <Link
            to="/catalog"
            className="border-3 border-orange-400 text-orange-600 bg-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-400 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Advanced Search
          </Link>
        </div>        </div>

      {/* Kid-friendly Animated Elements */}
      <div className="absolute top-10 right-10 floating-sun"></div>
      <div className="absolute bottom-20 left-20 floating-rainbow"></div>
      <div className="absolute top-32 right-1/4 floating-butterfly">🦋</div>
      <div className="absolute bottom-40 right-10 floating-butterfly" style={{ animationDelay: '2s' }}>🌈</div>
      <div className="absolute top-1/3 left-10 floating-balloon">🎈</div>      </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave"></div>

    {/* What do we offer? Section */}
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 animate-fadeInUp">What do we offer?</h2>            <p className="text-xl text-gray-600 dark:text-gray-300 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Discover our educational categories designed for your child's development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">            {/* Learning */}
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border-2 border-blue-100 dark:border-blue-800">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Learning</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Educational books that improve reading and writing skills.
            </p>
          </div>

          {/* Math */}
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border-2 border-green-100 dark:border-green-800" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '0.5s' }}>
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Math</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Interactive books that simplify numbers.
            </p>
          </div>

          {/*  */}
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border-2 border-purple-100 dark:border-purple-800" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1s' }}>
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4"></h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Digital  books to unleash creativity.
            </p>
          </div>

          {/* Stories */}
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border-2 border-orange-100 dark:border-orange-800" style={{ animationDelay: '0.3s' }}>              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1.5s' }}>
            <Book className="h-8 w-8 text-white" />
          </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Stories</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Exciting stories that nurture children's imagination and values.
            </p>
          </div>            {/* Activities */}
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border-2 border-cyan-100 dark:border-cyan-800 md:col-span-2 lg:col-span-1" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '2s' }}>
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Activities</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Books with educational games and puzzles to enhance thinking skills.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave"></div>

    {/* All Books by Category */}
    <section id="books-collection" className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">Our Complete Collection</h2>

            {/* Auto-slide toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Auto-slide:</span>
              <button
                onClick={() => setIsAutoSliding(!isAutoSliding)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isAutoSliding
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isAutoSliding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAutoSliding
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
                }`}>
                {isAutoSliding ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our entire library of magical  books, organized by category
          </p>
        </div>

        {categories.map((category, categoryIndex) => {
          const categoryViz = getCategoryVisualization(category);
          const CategoryIcon = categoryViz.icon;

          return (<div key={category} className="mb-8">
            {/* Compact Category Header */}
            <div className={`${categoryViz.bgColor} dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-100 dark:border-gray-700 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`bg-gradient-to-r ${categoryViz.gradient} p-2 rounded-lg shadow-md`}>
                    <CategoryIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{category}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                      {productsByCategory[category].length} books • {categoryViz.description}
                    </p>
                  </div>
                </div>                  <Link
                  to={`/catalog?category=${encodeURIComponent(category)}`}
                  className={`flex items-center space-x-1 bg-gradient-to-r ${categoryViz.gradient} text-white px-3 py-1 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs`}
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Books Container with Navigation */}
            <div
              className="relative group"
              onMouseEnter={() => setIsAutoSliding(false)}
              onMouseLeave={() => setIsAutoSliding(true)}
            >
              {/* Auto-slide indicator */}
              {isAutoSliding && (
                <div className="absolute top-0 right-4 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Auto-sliding</span>
                  </div>
                </div>
              )}
              {/* Left Navigation Button */}
              <button
                onClick={() => handleUserInteraction(categoryIndex, 'left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 z-20 p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 shadow-xl hover:shadow-2xl opacity-90 hover:opacity-100 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" />
              </button>

              {/* Right Navigation Button */}
              <button
                onClick={() => handleUserInteraction(categoryIndex, 'right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 z-20 p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 shadow-xl hover:shadow-2xl opacity-90 hover:opacity-100 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" />
              </button>                {/* Horizontal Sliding Books - Image Only */}
              <div
                id={`category-scroll-${categoryIndex}`}
                className="flex space-x-3 overflow-x-auto pb-3 hide-scrollbar px-1 py-1"
              >{productsByCategory[category].map((product, productIndex) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="flex-none w-36 h-48 group transform transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ animationDelay: `${productIndex * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Overlay with title on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">{product.category}</span>
                          <span className="text-white font-bold text-lg">${product.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`bg-gradient-to-r ${categoryViz.gradient} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              </div>                {/* Enhanced Scroll Progress Indicator */}
              <div className="flex justify-center mt-2 space-x-1">
                {Array.from({ length: Math.max(1, Math.ceil(productsByCategory[category].length / 4)) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const scrollContainer = document.getElementById(`category-scroll-${categoryIndex}`);
                      if (scrollContainer) {
                        const scrollAmount = 168 * 4; // 4 cards worth
                        scrollContainer.scrollTo({
                          left: index * scrollAmount,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-125 ${index === 0
                        ? `bg-gradient-to-r ${categoryViz.gradient} shadow-md`
                        : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            </div>              {/* Category Separator */}
            {categoryIndex < categories.length - 1 && (
              <div className="mt-6 flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="px-3">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getCategoryVisualization(categories[categoryIndex + 1] || category).gradient}`}></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            )}
          </div>
          );
        })}

        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center"
          >
            Browse with Filters
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>          </div>
      </div>      </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave reverse"></div>

    {/* About Bright Minds Section */}
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"></div>
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 animate-fadeInUp">About Bright Minds</h2>
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100 transform hover:scale-105 transition-all duration-500 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <p className="text-xl text-gray-700 leading-relaxed">
              Welcome to Bright Minds, the online platform that combines learning and fun for children through a unique collection of digital books. We offer educational and entertaining content that helps kids develop their skills in an engaging and easy way.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave"></div>

    {/* Features */}
    <section className="py-16 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-pink-50 to-blue-100"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fadeInUp">Why Choose Bright Minds?</h2>
          <p className="text-xl text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>Educational  experiences that nurture creativity and learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border border-green-100">
            <div className="bg-magic-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-float shadow-lg">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Download</h3>
            <p className="text-gray-600">Get your  books immediately after purchase. No waiting, no shipping fees!</p>
          </div>

          <div className="text-center p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border border-purple-100" style={{ animationDelay: '0.1s' }}>
            <div className="bg-magic-purple p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '0.5s' }}>
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Quality</h3>
            <p className="text-gray-600">High-resolution artwork designed by professional illustrators for the best  experience.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border border-orange-100" style={{ animationDelay: '0.2s' }}>
            <div className="bg-magic-orange p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1s' }}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Family Friendly</h3>
            <p className="text-gray-600">Age-appropriate content carefully curated for children from 3 to 12 years old.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fadeInUp border border-blue-100" style={{ animationDelay: '0.3s' }}>
            <div className="bg-magic-pink p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1.5s' }}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payment</h3>
            <p className="text-gray-600">Safe and secure PayPal checkout. Your payment information is always protected.</p>            </div></div>
      </div>      </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave"></div>

    {/* Stats Section */}
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-magic-rainbow opacity-10"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 animate-fadeInUp">By the Numbers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>Trusted by families worldwide</p>
        </div>

        {/* Stats - Horizontal on mobile, grid on larger screens */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 max-w-4xl mx-auto">
          <div className="text-center min-w-0 flex-1 p-6 bg-white rounded-3xl shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300 animate-fadeInUp">
            <div className="text-4xl md:text-5xl text-black font-bold text-transparent bg-magic-orange bg-clip-text mb-2 animate-colorShift">{products.length}+</div>
            <div className="text-lg  dark:text-gray-300 font-semibold" > Books</div>
          </div>
          <div className="text-center min-w-0 flex-1 p-6 bg-white rounded-3xl shadow-xl border border-pink-100 transform hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl md:text-5xl text-black font-bold text-transparent bg-magic-pink bg-clip-text mb-2 animate-colorShift" style={{ animationDelay: '1s' }}>{categories.length}</div>
            <div className="text-lg text-gray-600 dark:text-gray-300 font-semibold">Educational Categories</div>
          </div>
          <div className="text-center min-w-0 flex-1 p-6 bg-white rounded-3xl shadow-xl border border-blue-100 transform hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl md:text-5xl text-black font-bold text-transparent bg-magic-blue bg-clip-text mb-2 animate-colorShift" style={{ animationDelay: '2s' }}>4.9★</div>
            <div className="text-lg text-gray-600 dark:text-gray-300 font-semibold">Parent Rating</div>
          </div>          </div>
      </div>      </section>

    {/* Moving Wave Separator */}
    <div className="moving-wave reverse"></div>

    {/* Call to Action */}
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-magic-rainbow"></div>
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInUp">Ready to Spark Brilliance?</h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          Browse our complete collection above or use our advanced search to find exactly what you're looking for.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <a
            href="#books-collection"
            className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-110 shadow-2xl border-2 border-white animate-float"
          >
            Browse Categories
          </a>
          <Link
            to="/catalog"
            className="border-3 border-white text-white bg-transparent px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-110 shadow-2xl animate-float"
            style={{ animationDelay: '0.5s' }}
          >
            Search & Filter
          </Link>
        </div>
      </div>
    </section>
  </div>
  );
};

export default Home;