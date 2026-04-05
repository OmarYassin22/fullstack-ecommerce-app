import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { apiService } from '../services/api';

interface BookReaderProps {
  bookId: number;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ bookId, bookTitle, isOpen, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (!isOpen) return;

    const loadPdfUrl = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user owns the book and get PDF URL
        const isOwned = await apiService.checkBookOwnership(bookId);
        if (!isOwned) {
          setError('You do not own this book or the PDF is not available. Please purchase it first.');
          setIsLoading(false);
          return;
        }

        // Get PDF URL
        const url = await apiService.getBookPdfUrl(bookId);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load book. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPdfUrl();
  }, [isOpen, bookId]);

  const handleDownload = async () => {
    try {
      const blob = await apiService.downloadBook(bookId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bookTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading book:', error);
      if (error instanceof Error) {
        alert(`Failed to download book: ${error.message}`);
      } else {
        alert('Failed to download book. Please try again.');
      }
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold truncate">{bookTitle}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <span className="text-sm bg-gray-800 px-3 py-1 rounded">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-600 mx-2" />
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="h-5 w-5" />
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close Reader"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading book...</p>
          </div>
        ) : error ? (
          <div className="text-center text-white">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Book</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : pdfUrl ? (
          <div className="w-full h-full flex justify-center">
            <iframe
              src={`${pdfUrl}#zoom=${scale * 100}`}
              className="w-full h-full border-none"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${scale})`,
                transformOrigin: 'center top'
              }}
              title={bookTitle}
            />
          </div>
        ) : (
          <div className="text-center text-white">
            <p>No PDF available for this book.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;
