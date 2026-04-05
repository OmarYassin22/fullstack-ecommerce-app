import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { apiService, Category, CreateBookRequest } from '../services/api';
import { Product } from '../App';

interface UpdateBookFormProps {
  book: Product;
  onUpdateSuccess: (updatedBook: Product) => void;
  onCancel: () => void;
}

interface ValidationErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: { [key: string]: string[] };
  traceId: string;
}

const UpdateBookForm: React.FC<UpdateBookFormProps> = ({ book, onUpdateSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: book.title,
    description: book.description,
    price: book.price,
    categoryName: book.category,
    discount: 0, // Will be updated after fetching full book data
    // startAge: 3,
    // endAge: 5,
    pagesNumber: book.pages || 0,
    imageUrls: book.previewImages || [],
    pdf: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await apiService.getCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load full book data to get discount and other fields
  useEffect(() => {
    const fetchFullBookData = async () => {
      try {
        const fullBook = await apiService.getBookById(book.id);
        setFormData(prev => ({
          ...prev,
          discount: fullBook.discount || 0,
          // startAge: fullBook.startAge,
          // endAge: fullBook.endAge,
          pdf: fullBook.pdfPath || ''
        }));
      } catch (error) {
        console.error('Error fetching full book data:', error);
        // Continue with existing data if fetch fails
      }
    };

    fetchFullBookData();
  }, [book.id]);

  const getFieldErrors = (fieldName: string): string[] => {
    return validationErrors[fieldName] || [];
  };

  const hasFieldError = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0;
  };

  const renderFieldError = (fieldName: string) => {
    const errors = getFieldErrors(fieldName);
    if (errors.length === 0) return null;
    
    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-red-600 text-sm">
            {error}
          </p>
        ))}
      </div>
    );
  };

  const handleInputChange = (field: keyof CreateBookRequest, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('PDF file size should be less than 50MB');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }

      setPdfFile(file);
      setUploadProgress(prev => ({ ...prev, pdf: 0 }));
      
      try {
        const base64 = await handleFileToBase64(file);
        setFormData(prev => ({ ...prev, pdf: base64 }));
        setUploadProgress(prev => ({ ...prev, pdf: 100 }));
        setError(null);
      } catch (error) {
        console.error('Error converting PDF to base64:', error);
        setError('Error processing PDF file');
        setUploadProgress(prev => ({ ...prev, pdf: 0 }));
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image files should be less than 5MB each');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
    }

    setError(null);

    // Store the files for FormData submission
    setImageFiles(prev => [...prev, ...files]);

    // Convert to base64 for preview
    const base64Images: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressKey = `image_${Date.now()}_${i}`;
      
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
      
      try {
        const base64 = await handleFileToBase64(file);
        base64Images.push(base64);
        setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
      } catch (error) {
        console.error('Error converting image to base64:', error);
        setError('Error processing image files');
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
      }
    }

    if (base64Images.length > 0) {
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...base64Images]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
    
    // Also remove from imageFiles if it exists
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removePdf = () => {
    setPdfFile(null);
    setFormData(prev => ({ ...prev, pdf: '' }));
    setUploadProgress(prev => ({ ...prev, pdf: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('categoryName', formData.categoryName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('discount', formData.discount?.toString() || '0');
      // formDataToSend.append('endAge', formData.endAge.toString());
      formDataToSend.append('pagesNumber', formData.pagesNumber.toString());
      formDataToSend.append('price', formData.price.toString());
      // formDataToSend.append('startAge', formData.startAge.toString());
      formDataToSend.append('title', formData.title);
      
      // Add a flag to indicate this is an update operation
      formDataToSend.append('isUpdate', 'true');
      
      // Add PDF file only if user selected a new one
      if (pdfFile) {
        formDataToSend.append('Pdf', pdfFile);
        formDataToSend.append('updatePdf', 'true');
      } else {
        formDataToSend.append('updatePdf', 'false');
      }
      
      // Add image files only if user selected new ones
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataToSend.append('Images', file);
        });
        formDataToSend.append('updateImages', 'true');
      } else {
        formDataToSend.append('updateImages', 'false');
      }


      // Call the API service with FormData
      const updatedBook = await apiService.updateBookWithFormData(book.id, formDataToSend);
      
      // Convert API response to Product format
      const productData: Product = {
        ...updatedBook,
        image: updatedBook.imageUrls[0] || book.image,
        previewImages: updatedBook.imageUrls.slice(1),
        // ageRange: `${updatedBook.startAge}-${updatedBook.endAge}`,
        pages: updatedBook.pagesNumber,
        category: updatedBook.category,
        featured: book.featured || false,
        language: book.language || 'english'
      };

      onUpdateSuccess(productData);
    } catch (error: unknown) {
      console.error('Error updating book:', error);
      
      // Handle 400 validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: ValidationErrorResponse } };
        
        if (axiosError.response && axiosError.response.status === 400) {
          const errorData = axiosError.response.data;
          
          if (errorData.errors) {
            setValidationErrors(errorData.errors);
            setError('Please fix the validation errors below.');
          } else {
            setError(errorData.title || 'Validation failed. Please check your input.');
          }
        } else {
          setError('Failed to update book. Please try again.');
        }
      } else {
        setError('Failed to update book. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Update Book</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium mb-2">Validation Errors:</h4>
              <ul className="space-y-1">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <li key={field} className="text-red-600 text-sm">
                    <strong>{field}:</strong> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      hasFieldError('Title') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter book title"
                    required
                  />
                  {renderFieldError('Title')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      hasFieldError('Description') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter book description"
                    required
                  />
                  {renderFieldError('Description')}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        hasFieldError('Price') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      required
                    />
                    {renderFieldError('Price')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pages *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pagesNumber}
                      onChange={(e) => handleInputChange('pagesNumber', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        hasFieldError('PagesNumber') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Number of pages"
                      required
                    />
                    {renderFieldError('PagesNumber')}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        hasFieldError('CategoryName') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={isLoadingCategories}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.title}>{category.title}</option>
                      ))}
                    </select>
                    {renderFieldError('CategoryName')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount || 0}
                      onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

              
              </div>

              {/* Files */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Files
                </h3>

                {/* PDF Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File (Optional - leave empty to keep existing)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                        hasFieldError('Pdf') ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> new PDF file
                          </p>
                          <p className="text-xs text-gray-500">PDF (MAX. 50MB) - Optional</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                        />
                      </label>
                    </div>
                    {renderFieldError('Pdf')}
                    
                    {/* Show existing PDF info */}
                    {!formData.pdf && (
                      <div className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Current PDF will be kept
                            </p>
                            <p className="text-xs text-gray-500">
                              Upload a new PDF to replace it
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formData.pdf && (
                      <div className="p-3 border border-gray-200 rounded-lg bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-red-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {pdfFile ? pdfFile.name : 'PDF File'}
                              </p>
                              {pdfFile && (
                                <p className="text-xs text-gray-500">
                                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removePdf}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {uploadProgress.pdf && uploadProgress.pdf < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.pdf}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {uploadProgress.pdf}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (Optional - leave empty to keep existing)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                        hasFieldError('Images') ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <div className="flex flex-col items-center justify-center py-2">
                          <Plus className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-sm text-gray-500">Add new images</p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB each) - Optional</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    {renderFieldError('Images')}
                    
                    {/* Show existing images info */}
                    {formData.imageUrls.length === 0 && (
                      <div className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                        <div className="flex items-center">
                          <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Current images will be kept
                            </p>
                            <p className="text-xs text-gray-500">
                              Upload new images to replace them
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formData.imageUrls.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          New Images ({formData.imageUrls.length})
                        </h4>
                        <p className="text-xs text-gray-500">
                          These will replace the current images when you update
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {formData.imageUrls.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`New Image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show current book images for reference */}
                    {book.previewImages && book.previewImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Current Images ({book.previewImages.length})
                        </h4>
                        <p className="text-xs text-gray-500">
                          These will be kept if no new images are uploaded
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {book.previewImages.map((imageUrl, index) => (
                            <div key={`current-${index}`} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Current Image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 opacity-75"
                              />
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Current
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Book</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBookForm;
