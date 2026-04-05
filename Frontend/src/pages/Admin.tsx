import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, FileText, Tag, DollarSign, ShoppingCart, FileDown } from 'lucide-react';
import { useApp, Product } from '../App';
import { apiService, Category, CreateBookRequest, CreateCategoryRequest, UpdateCategoryRequest, AdminApiBook } from '../services/api';
import UpdateBookForm from '../components/UpdateBookForm';

interface BookFormData {
  title: string;
  description: string;
  price: number;
  categoryName: string;
  discount: number;
  // startAge: number;
  // endAge: number;
  pagesNumber: number;
  imageUrls: string[];
  pdf: string;
  // Additional fields for form UI
  image?: string;
  previewImages?: string[];
  ageRange?: string;
  pages?: number;
  category?: string;
}

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts } = useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'categories'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Admin books state with additional fields
  const [adminBooks, setAdminBooks] = useState<AdminApiBook[]>([]);
  const [adminBooksLoading, setAdminBooksLoading] = useState(false);
  
  // Category management state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryRequest | UpdateCategoryRequest>({
    title: '',
    description: ''
  });
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    price: 0,
    categoryName: '',
    discount: 0,
    // startAge: 3,
    // endAge: 5,
    pagesNumber: 0,
    imageUrls: [],
    pdf: '',
    // UI fields
    image: '',
    previewImages: [],
    ageRange: '',
    pages: 0,
    category: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load categories and admin books on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await apiService.getCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    const fetchAdminBooks = async () => {
      setAdminBooksLoading(true);
      try {
        const books = await apiService.adminGetAllBooks();
        setAdminBooks(books);
      } catch (error) {
        console.error('Error fetching admin books:', error);
      } finally {
        setAdminBooksLoading(false);
      }
    };
    
    fetchCategories();
    fetchAdminBooks();
  }, []);

  // Function to refresh admin books
  const refreshAdminBooks = async () => {
    setAdminBooksLoading(true);
    try {
      const books = await apiService.adminGetAllBooks();
      setAdminBooks(books);
    } catch (error) {
      console.error('Error refreshing admin books:', error);
    } finally {
      setAdminBooksLoading(false);
    }
  };

  // Category management functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLoading(true);
    setCategoryError(null);
    setCategorySuccess(null);

    try {
      if (editingCategory) {
        // Update existing category
        await apiService.updateCategory(editingCategory.id, categoryFormData as UpdateCategoryRequest);
        setCategorySuccess('Category updated successfully');
        setEditingCategory(null);
      } else {
        // Create new category
        await apiService.createCategory(categoryFormData as CreateCategoryRequest);
        setCategorySuccess('Category created successfully');
      }

      // Reset form and refresh categories
      setCategoryFormData({ title: '', description: '' });
      const categoryData = await apiService.getCategories();
      setCategories(categoryData);
    } catch (error: unknown) {
      setCategoryError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      title: category.title,
      description: category.description
    });
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setCategoryLoading(true);
    setCategoryError(null);

    try {
      await apiService.deleteCategory(categoryId);
      setCategorySuccess('Category deleted successfully');
      const categoryData = await apiService.getCategories();
      setCategories(categoryData);
    } catch (error: unknown) {
      setCategoryError(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryFormData({ title: '', description: '' });
    setCategoryError(null);
    setCategorySuccess(null);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [imageFiles]);

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      categoryName: '',
      discount: 0,
      // startAge: 3,
      // endAge: 5,
      pagesNumber: 0,
      imageUrls: [],
      pdf: '',
      // UI fields
      image: '',
      previewImages: [],
      ageRange: '',
      pages: 0,
      category: ''
    });
    setPdfFile(null);
    setImageFiles([]);
    setEditingProduct(null);
    setError(null);
    setSuccess(null);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('PDF file size should be less than 50MB');
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the 5-image limit
    if (imageFiles.length + files.length > 5) {
      setError(`You can only upload a maximum of 5 images. Currently you have ${imageFiles.length} images selected.`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image files should be less than 5MB each');
        return;
      }
    }

    setImageFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const removeImageFile = (index: number) => {
    const fileToRemove = imageFiles[index];
    if (fileToRemove) {
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
    }
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removePdfFile = () => {
    setPdfFile(null);
  };

  const handleEdit = (product: Product) => {
    setBookToUpdate(product);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = async (updatedBook: Product) => {
    updateProduct(updatedBook.id, updatedBook);
    setShowUpdateForm(false);
    setBookToUpdate(null);
    
    // Refresh the product list to get the latest data
    await refreshProducts();
  };

  const handleUpdateCancel = () => {
    setShowUpdateForm(false);
    setBookToUpdate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingProduct) {
        // Update existing product (keep existing logic)
        const bookData: CreateBookRequest = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categoryName: formData.categoryName || formData.category || '',
          discount: formData.discount,
          // startAge: formData.startAge,
          // endAge: formData.endAge,
          pagesNumber: formData.pagesNumber || formData.pages || 0,
          imageUrls: formData.imageUrls.concat(formData.previewImages || []),
          pdf: formData.pdf
        };

        await apiService.updateBook(editingProduct.id, bookData);
        const updatedProduct: Product = {
          ...editingProduct,
          ...bookData,
          image: formData.image || editingProduct.image,
          previewImages: formData.previewImages || [],
          // ageRange: formData.ageRange || '',
          pages: formData.pages || formData.pagesNumber,
          category: formData.category || formData.categoryName,
          featured: false,
          language: 'english'
        };
        updateProduct(editingProduct.id, updatedProduct);
      } else {
        // Create new product using FormData
        const formDataToSend = new FormData();
        
        // Add text fields
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('discount', formData.discount.toString()); 
        formDataToSend.append('categoryName', formData.categoryName || formData.category || '');
        formDataToSend.append('pagesNumber', (formData.pagesNumber || formData.pages || 0).toString());
        
        // Add PDF file
        if (pdfFile) {
          formDataToSend.append('Pdf', pdfFile);
        }
        
        // Add image files
        imageFiles.forEach((file) => {
          formDataToSend.append('Images', file);
        });

        const newBook = await apiService.createBookWithFormData(formDataToSend);
        
        // Convert to Product format for local state
        const productData: Product = {
          ...newBook,
          image: newBook.imageUrls[0] || '',
          previewImages: newBook.imageUrls.slice(1),
          // ageRange: `${newBook.startAge}-${newBook.endAge}`,
          pages: newBook.pagesNumber,
          category: newBook.category,
          featured: false,
          language: 'english'
        };
        
        addProduct(productData);
      }

      resetForm();
      setActiveTab('list');
      
      // Refresh both product list and admin books to get the latest data
      await refreshProducts();
      await refreshAdminBooks();
      
      setSuccess(editingProduct ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (error) {
      console.error('Error saving book:', error);
      setError('Failed to save book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await apiService.deleteBook(id);
        deleteProduct(id);
        
        // Refresh both product list and admin books to get the latest data
        await refreshProducts();
        await refreshAdminBooks();
        
        setSuccess('Book deleted successfully!');
      } catch (error) {
        console.error('Error deleting book:', error);
        setError('Failed to delete book. Please try again.');
      }
    }
  };

  const handleInputChange = (field: keyof BookFormData, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Sync category and categoryName
      if (field === 'category') {
        updated.categoryName = value as string;
      } else if (field === 'categoryName') {
        updated.category = value as string;
      }
      
      // Sync pages and pagesNumber
      if (field === 'pages') {
        updated.pagesNumber = value as number;
      } else if (field === 'pagesNumber') {
        updated.pages = value as number;
      }
      
      // // Update age range when start/end age changes
      // if (field === 'startAge' || field === 'endAge') {
      //   const startAge = field === 'startAge' ? value as number : updated.startAge;
      //   const endAge = field === 'endAge' ? value as number : updated.endAge;
      //   updated.ageRange = `${startAge}-${endAge}`;
      // }
      
      return updated;
    });
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-purple-100">Manage your book collection</p>
        </div>

        {/* Summary Cards */}
        {!adminBooksLoading && adminBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Books</p>
                  <p className="text-2xl font-bold text-gray-900">{adminBooks.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminBooks.reduce((sum, book) => sum + book.sellCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Tag className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mx-8 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}
          {error && activeTab === 'list' && (
            <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('list');
                setSuccess(null);
                setError(null);
              }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Book List ({products.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('add');
                resetForm();
                setSuccess(null);
                setError(null);
              }}
              className={`px-6 py-4 font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'add'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Book</span>
            </button>
            {editingProduct && (
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-6 py-4 font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'edit'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Edit className="h-4 w-4" />
                <span>Edit Book</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('categories');
                handleCancelCategoryEdit();
              }}
              className={`px-6 py-4 font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Categories ({categories.length})</span>
            </button>
          </div>
        </div>

        {/* Book List */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Final Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Sales Count
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      PDF
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminBooksLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                          <span>Loading admin books...</span>
                        </div>
                      </td>
                    </tr>
                  ) : adminBooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No books found
                      </td>
                    </tr>
                  ) : (
                    adminBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={book.image || book.imageUrls?.[0]}
                              alt={book.title}
                              className="w-12 h-12 object-cover rounded-lg mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">{book.category} • {book.pagesNumber} pages</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${book.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {book.discount || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${((book.price || 0) * (1 - ((book.discount || 0) / 100))).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <ShoppingCart className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="font-medium">{book.sellCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{book.totalEarning.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {book.pdfPath ? (
                            <a
                              href={book.pdfPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <FileDown className="h-3 w-3 mr-1" />
                              View PDF
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No PDF</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(book as unknown as Product)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter book description"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pages *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.pagesNumber}
                        onChange={(e) => handleInputChange('pagesNumber', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Number of pages"
                        required
                      />
                    </div>

                   
                  </div>

                
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.categoryName}
                        onChange={(e) => handleInputChange('categoryName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.title}>{category.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Images
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images * (Maximum 5 images)
                    </label>
                    
                    {/* Image Preview Section */}
                    {imageFiles.length > 0 && (
                      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Image Previews</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeImageFile(index)}
                                  className="text-white bg-red-600 hover:bg-red-700 p-1 rounded-full transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          imageFiles.length >= 5 
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`w-8 h-8 mb-2 ${imageFiles.length >= 5 ? 'text-gray-300' : 'text-gray-400'}`} />
                            <p className={`mb-2 text-sm ${imageFiles.length >= 5 ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="font-semibold">
                                {imageFiles.length >= 5 ? 'Maximum images reached' : 'Click to upload'}
                              </span>
                              {imageFiles.length < 5 && ' images'}
                            </p>
                            <p className={`text-xs ${imageFiles.length >= 5 ? 'text-gray-400' : 'text-gray-500'}`}>
                              PNG, JPG, JPEG (MAX. 5MB each, 5 images max)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            required={!editingProduct && imageFiles.length === 0}
                            disabled={imageFiles.length >= 5}
                          />
                        </label>
                      </div>
                      
                      {imageFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Selected Images ({imageFiles.length}/5)</h4>
                          {imageFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImageFile(index)}
                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {imageFiles.length >= 5 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Maximum of 5 images reached. Remove some images to add more.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF File *
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> PDF file
                            </p>
                            <p className="text-xs text-gray-500">PDF files only (MAX. 50MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            required={!editingProduct}
                          />
                        </label>
                      </div>
                      
                      {pdfFile && (
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-blue-50">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{pdfFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removePdfFile}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                  </div>
                )}

                {isLoading && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    Uploading book... Please wait.
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingProduct ? 'Update Book' : 'Add Book'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                {editingCategory && (
                  <button
                    onClick={handleCancelCategoryEdit}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {categoryError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {categoryError}
                </div>
              )}

              {categorySuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {categorySuccess}
                </div>
              )}

              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="categoryTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Category Title
                    </label>
                    <input
                      type="text"
                      id="categoryTitle"
                      value={categoryFormData.title}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="categoryDescription"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelCategoryEdit}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={categoryLoading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {categoryLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Category List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Categories ({categories.length})</h3>
              </div>
              
              {categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No categories yet</p>
                  <p>Create your first category to organize your books</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Books Count
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {products.filter(p => p.category === category.title).length}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Category"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Category"
                                disabled={products.filter(p => p.category === category.title).length > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Update Book Modal */}
      {showUpdateForm && bookToUpdate && (
        <UpdateBookForm
          book={bookToUpdate}
          onUpdateSuccess={handleUpdateSuccess}
          onCancel={handleUpdateCancel}
        />
      )}
    </div>
  );
};

export default Admin;