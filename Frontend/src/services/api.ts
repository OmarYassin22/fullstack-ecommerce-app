// API Service for Brilliant Minds
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7118/api').replace(/\/+$/, '');
const ROOT_BASE_URL = (import.meta.env.VITE_ROOT_BASE_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/+$/, '');
const IMAGE_BASE_URL = (import.meta.env.VITE_IMAGE_BASE_URL || `${ROOT_BASE_URL}/`).replace(/\/?$/, '/');

// Types for API responses
export interface ApiBook {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  category: string;
  discount: number | null;
  // startAge: number;
  // endAge: number;
  pagesNumber: number;
  imageUrls: string[];
  pdfPath: string;
  // Computed properties for compatibility
  image?: string;
  previewImages?: string[];
  // ageRange?: string;
  pages?: number;
  featured?: boolean;
  language?: 'english' | 'arabic';
}

export interface AdminApiBook extends ApiBook {
  totalEarning: number;
  sellCount: number;
  // pdfPath is already included from ApiBook
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  isAdmin: boolean;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  roles: string[];
}

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  jti: string;
  given_name: string;
  roles: string[];
  exp: number;
  iss: string;
  aud: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
}

export interface ApiError {
  code: string;
  description: string;
}

export interface ValidationError {
  type: string;
  title: string;
  status: number;
  errors: Record<string, string[]>;
  traceId: string;
}

export interface CreateBookRequest {
  title: string;
  description: string;
  price: number;
  categoryName: string;
  discount?: number | null;
  // startAge: number;
  // endAge: number;
  pagesNumber: number;
  imageUrls: string[];
  pdf: string;
}

export interface Category {
  id: number;
  title: string;
  description?: string;
  books?: null;
}

export interface CreateCategoryRequest {
  title: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  title?: string;
  description?: string;
}

export interface CreateOrderRequest {
  BookIds: number[];
  TotalPrice: number;
  PhoneNumber: string;
  Email: string;
  notes?: string;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  books: unknown | null;
}

export interface OrderResponse {
  id: number;
  active: boolean;
  userId: string;
  user: User;
  books: string[];
  totalPrice: number;
  status: string;
  address: string;
  phoneNumber: string;
  email: string;
  notes: string;
  transactionId: string | null;
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  paymentId: number;
  payPalOrderId: string;
  approvalUrl: string;
  status: number;
  errorMessage: string | null;
}

export interface CapturePaymentRequest {
  payPalOrderId: string;
}

export interface CapturePaymentResponse {
  paymentId: number;
  transactionId: string;
  status: number;
  errorMessage: string | null;
}

// API Service Class
class ApiService {
  private baseUrl = API_BASE_URL;
  private token: string | null = null;
  private ongoingRequests = new Set<string>(); // Track ongoing requests to prevent duplicates
  private axiosInstance = axios.create({
    baseURL: this.baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    
    // Set up axios interceptors
    this.setupInterceptors();
  }

  // Set up axios interceptors for authentication and error handling
  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it
          this.clearAuthToken();
          throw new Error('Authentication failed');
        }
        throw error;
      }
    );
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
    // Update axios instance with new token
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    // Remove token from axios instance
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${ROOT_BASE_URL}/me/login`,
        credentials
      );
      const authData = response.data;
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Handle specific login errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          throw axiosError.response.data;
        }
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${ROOT_BASE_URL}/me/register`,
        userData
      );
      const authData = response.data;
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Handle specific registration errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          throw axiosError.response.data;
        }
      }
      throw error;
    }
  }

  // Helper method to decode JWT token (basic decoding without verification)
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as JWTPayload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Get user info from token
  getUserFromToken(): JWTPayload | null {
    if (!this.token) return null;
    return this.decodeJWT(this.token);
  }

  // Get user profile from API
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.axiosInstance.get<UserProfile>(
      `${ROOT_BASE_URL}/me/Profile`
    );
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Book APIs
  async getAllBooks(): Promise<ApiBook[]> {
    const response = await this.axiosInstance.get<ApiBook[]>('/books/GetAllBooks');
    return response.data.map(transformImageUrls);
  }

  async adminGetAllBooks(): Promise<AdminApiBook[]> {
    const response = await this.axiosInstance.get<AdminApiBook[]>('/books/AdminGetAllBooks');
    return response.data.map(book => ({
      ...transformImageUrls(book),
      totalEarning: book.totalEarning,
      sellCount: book.sellCount
    }));
  }

  async getBookById(id: number): Promise<ApiBook> {
    const response = await this.axiosInstance.get<ApiBook>(`/books/GetBookById/${id}`);
    return transformImageUrls(response.data);
  }

  async createBook(bookData: CreateBookRequest): Promise<ApiBook> {
    const response = await this.axiosInstance.post<ApiBook>('/books/CreateBook', bookData);
    return transformImageUrls(response.data);
  }

  async createBookWithFormData(formData: FormData): Promise<ApiBook> {
    const response = await this.axiosInstance.post<ApiBook>('/books/AddBook', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return transformImageUrls(response.data);
  }

  async updateBook(id: number, bookData: Partial<CreateBookRequest>): Promise<ApiBook> {
    const response = await this.axiosInstance.put<ApiBook>(`/books/${id}`, bookData);
    return transformImageUrls(response.data);
  }

  async updateBookWithFormData(id: number, formData: FormData): Promise<ApiBook> {
    const response = await this.axiosInstance.put<ApiBook>(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return transformImageUrls(response.data);
  }

  async deleteBook(id: number): Promise<void> {
    await this.axiosInstance.delete(`/books/${id}`);
  }

  // Get categories from API
  async getCategories(): Promise<Category[]> {
    const response = await this.axiosInstance.get<Category[]>('/Categories');
    return response.data;
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<Category> {
    const response = await this.axiosInstance.get<Category>(`/Categories/${id}`);
    return response.data;
  }

  // Create new category
  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    const response = await this.axiosInstance.post<Category>('/Categories', categoryData);
    return response.data;
  }

  // Update category
  async updateCategory(id: number, categoryData: UpdateCategoryRequest): Promise<Category> {
    const response = await this.axiosInstance.put<Category>(`/Categories/${id}`, categoryData);
    return response.data;
  }

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    await this.axiosInstance.delete(`/Categories/${id}`);
  }

  // Get user books
  async getUserBooks(): Promise<ApiBook[]> {
    const response = await this.axiosInstance.get<ApiBook[]>('/books/GetBooksByUser');
    return response.data.map(transformImageUrls);
  }

  // Create order
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const response = await this.axiosInstance.post<OrderResponse>('/order', orderData);
    return response.data;
  }

  // Create payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    // Check for ongoing payment creation to prevent duplicates
    const paymentKey = `payment_${paymentData.orderId}`;
    if (this.ongoingRequests.has(paymentKey)) {
      throw new Error('Payment creation is already in progress for this order');
    }

    // Track the ongoing request
    this.ongoingRequests.add(paymentKey);

    try {
       const response = await this.axiosInstance.post<PaymentResponse>('/Payment/create', paymentData);
       return response.data;
    } finally {
      // Always remove the request from tracking, even if it fails
      this.ongoingRequests.delete(paymentKey);
    }
  }

  // Capture payment
  async capturePayment(captureData: CapturePaymentRequest): Promise<CapturePaymentResponse> {
    // Check for ongoing capture request to prevent duplicates
    const captureKey = `capture_${captureData.payPalOrderId}`;
    if (this.ongoingRequests && this.ongoingRequests.has(captureKey)) {
      throw new Error('Payment capture is already in progress for this order');
    }

    // Track the ongoing request
    if (!this.ongoingRequests) {
      this.ongoingRequests = new Set();
    }
    this.ongoingRequests.add(captureKey);

    try {
       const response = await this.axiosInstance.post<CapturePaymentResponse>(`/Payment/capture/${captureData.payPalOrderId}`, captureData);
       return response.data;
    } finally {
      // Always remove the request from tracking, even if it fails
      this.ongoingRequests.delete(captureKey);
    }
  }

  // Get order details by ID
  async getOrderById(orderId: number): Promise<OrderResponse> {
    const response = await this.axiosInstance.get<OrderResponse>(`/order/${orderId}`);
    return response.data;
  }

  // Download book PDF
  async downloadBook(bookId: number): Promise<string> {
    // First get user's books to find the PDF path
    const userBooks = await this.getUserBooks();
    const book = userBooks.find(b => b.id === bookId);
    
    if (!book || !book.pdfPath) {
      throw new Error('Book not found or PDF not available');
    }
    
    // Return the PDF URL directly to bypass CORS issues
    const pdfUrl = `${IMAGE_BASE_URL}${book.pdfPath}`;
     return pdfUrl;
  }

  // Get book PDF URL for online reading
  async getBookPdfUrl(bookId: number): Promise<string> {
    // First get user's books to find the PDF path
    const userBooks = await this.getUserBooks();
    const book = userBooks.find(b => b.id === bookId);
    
    if (!book || !book.pdfPath) {
      throw new Error('Book not found or PDF not available');
    }
    
    // Return the full PDF URL
    const pdfUrl = `${IMAGE_BASE_URL}${book.pdfPath}`;
     return pdfUrl;
  }

  // Check if user owns a book by checking the user's book list
  async checkBookOwnership(bookId: number): Promise<boolean> {
    try {
      const userBooks = await this.getUserBooks();
      return userBooks.some(book => book.id === bookId && book.pdfPath);
    } catch (error) {
      console.error('Error checking book ownership:', error);
      return false;
    }
  }
}

// Helper function to transform image URLs and normalize data structure
const transformImageUrls = (book: ApiBook): ApiBook => {
  // Transform imageUrls to full URLs
  const transformedImageUrls = book.imageUrls?.map(img => 
    img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`
  ) || [];

  return {
    ...book,
    imageUrls: transformedImageUrls,
    // Add computed properties for compatibility with existing components
    image: transformedImageUrls[0] || '', // First image as main image
    previewImages: transformedImageUrls.slice(1), // Rest as preview images
    // ageRange: `${book.startAge}-${book.endAge}`, // Combine age range
    pages: book.pagesNumber, // Map pagesNumber to pages
    featured: book.id % 3 === 0, // Mock featured logic (you can adjust this)
    language: 'english' as const, // Default language (you can adjust this)
  };
};

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export image base URL for use in other components
export { IMAGE_BASE_URL };

// Helper function to get full image URL
export const getFullImageUrl = (relativePath: string): string => {
  if (!relativePath) return '';
  return relativePath.startsWith('http') ? relativePath : `${IMAGE_BASE_URL}${relativePath}`;
};
