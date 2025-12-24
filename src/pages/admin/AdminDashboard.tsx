// src/pages/admin/AdminDashboard.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Bell,
  Calendar,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

import { products as localProducts } from '../../data/products';
import { useAuth } from '../../contexts/AuthContext';

import {
  getAdminOverview,
  AdminCustomer,
  AdminOrder,
  AdminStats,
  AdminOverviewResponse,
  SalesTrendPoint,
  InventoryAlert,
  updateOrderStatus,
  updateProductDetails,
  deleteProduct,
  getCustomerDetails
} from '../../services/adminService';
import { formatPaymentMethod } from '../../utils/payment';

import {
  getProducts,
  ProductRaw,
  createProduct,
  uploadProductImage,
  deleteProductImageByUrl
} from '../../services/productService';

const ORDER_STATUSES = ['Chờ xử lý', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'];
const LOW_STOCK_THRESHOLD = 15;

type DashboardPayload = {
  products: ProductRaw[];
  overview: AdminOverviewResponse;
};

const buildFallbackProducts = (): ProductRaw[] =>
  (localProducts as unknown as ProductRaw[]).map((product, index) => ({
    ...product,
    originalPrice: (product as any).originalPrice ?? null,
    stock: (product as any).stock ?? 40 + (index % 6) * 5,
    soldCount: (product as any).soldCount ?? 80 + index * 3
  }));

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'men' | 'women' | 'kids'>('all');

  const [stats, setStats] = useState<AdminStats>({
    totalProducts: localProducts.length,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    weeklyRevenue: 0,
    inventoryValue: 0,
    averageOrderValue: 0
  });

  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [productList, setProductList] = useState<ProductRaw[]>(buildFallbackProducts);
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<SalesTrendPoint[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingProduct, setEditingProduct] = useState<ProductRaw | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    originalPrice: '',
    category: 'men',
    subcategory: '',
    stock: 0,
    soldCount: 0,
    description: '',
    images: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    features: [] as string[],
    isNew: false,
    isSale: false,
    rating: undefined as number | undefined,
    reviewCount: 0
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerDetailOrders, setCustomerDetailOrders] = useState<AdminOrder[]>([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const role = user?.role;
  const canAccessDashboard = role === 'admin' || role === 'editor' || role === 'viewer';
  const canManageContent = role === 'admin' || role === 'editor';
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }, [logout]);
  const canDeleteProduct = role === 'admin';

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
  };

  const applyDashboardData = useCallback((payload: DashboardPayload) => {
    const { products, overview } = payload;
    setProductList(products);
    setStats(overview.stats);
    setRecentOrders(Array.isArray(overview.recentOrders) ? overview.recentOrders : []);
    setCustomers(Array.isArray(overview.customers) ? overview.customers : []);
    setPendingOrders(Array.isArray(overview.pendingOrders) ? overview.pendingOrders : []);
    setRevenueTrend(Array.isArray(overview.revenueTrend) ? overview.revenueTrend : []);
    setInventoryAlerts(Array.isArray(overview.inventoryAlerts) ? overview.inventoryAlerts : []);
  }, []);

const loadDashboard = useCallback(async (): Promise<DashboardPayload> => {
  const remoteProducts = await getProducts().catch(() => null);
  let normalizedProducts: ProductRaw[] = buildFallbackProducts();

  if (remoteProducts && remoteProducts.length > 0) {
    normalizedProducts = remoteProducts;
  }

  const overview = await getAdminOverview(normalizedProducts); // 👈 bỏ LOW_STOCK_THRESHOLD
  return { products: normalizedProducts, overview };
}, []);


  const refreshDashboard = useCallback(async () => {
    const payload = await loadDashboard();
    applyDashboardData(payload);
  }, [loadDashboard, applyDashboardData]);

  // initial load
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!canAccessDashboard) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const payload = await loadDashboard();
        if (cancelled) return;
        applyDashboardData(payload);
      } catch (err) {
        console.error('Admin dashboard error', err);
        if (!cancelled) {
          setError('Không thể tải dữ liệu quản trị. Vui lòng kiểm tra cấu hình Supabase và API.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [canAccessDashboard, loadDashboard, applyDashboardData]);

  // auto hide toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const openProductModal = (product: ProductRaw) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice?.toString() ?? '',
      category: product.category,
      subcategory: product.subcategory ?? '',
      stock: product.stock ?? 0,
      soldCount: product.soldCount ?? 0,
      description: product.description ?? '',
      images: product.images ?? [],
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
      features: product.features ?? [],
      isNew: product.isNew ?? false,
      isSale: product.isSale ?? false,
      rating: product.rating ?? undefined,
      reviewCount: product.reviewCount ?? 0
    });
    setOriginalImages(product.images ?? []);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setAddingProduct(true);
    setProductForm({
      name: '',
      price: 0,
      originalPrice: '',
      category: 'men',
      subcategory: '',
      stock: 0,
      soldCount: 0,
      description: '',
      images: [],
      colors: [],
      sizes: [],
      features: [],
      isNew: false,
      isSale: false,
      rating: undefined,
      reviewCount: 0
    });
    setImageFiles([]);
    setImagePreviews([]);
    setOriginalImages([]);
  };

  const closeProductModal = () => {
    setEditingProduct(null);
    setAddingProduct(false);
    setImageFiles([]);
    setImagePreviews([]);
    setOriginalImages([]);
  };

  const handleProductInputChange = (
    field: keyof typeof productForm,
    value: string | number
  ) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCSVInputChange = (
    field: 'colors' | 'sizes' | 'features',
    value: string
  ) => {
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setProductForm((prev) => ({ ...prev, [field]: arr }));
  };

  const handleAddTag = (field: 'colors' | 'sizes' | 'features', value: string) => {
    const tag = String(value || '').trim();
    if (!tag) return;
    setProductForm((prev) => {
      const list = Array.isArray(prev[field]) ? [...prev[field]] : [];
      if (list.includes(tag)) return prev;
      list.push(tag);
      return { ...prev, [field]: list } as typeof prev;
    });
  };

  const handleRemoveTag = (field: 'colors' | 'sizes' | 'features', index: number) => {
    setProductForm((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field].filter((_, i) => i !== index) : [];
      return { ...prev, [field]: list } as typeof prev;
    });
  };

  const handleOptionalNumberInput = (
    field: 'rating' | 'originalPrice' | 'price' | 'reviewCount' | 'stock' | 'soldCount',
    value: string | number | undefined
  ) => {
    setProductForm((prev) => ({ ...prev, [field]: value === '' || value === undefined ? undefined : Number(value) }));
  };

  const handleToggleField = (field: 'isNew' | 'isSale') => {
    setProductForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    // generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (url: string) => {
    setProductForm((prev) => ({ ...prev, images: (prev.images || []).filter((u) => u !== url) }));
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!editingProduct || !canManageContent) return;

    setSubmittingProduct(true);
    if (!productForm.name || !productForm.price || Number(productForm.price) <= 0) {
      showToast('error', 'Vui lòng nhập tên và giá hợp lệ');
      setSubmittingProduct(false);
      return;
    }

    const numericStock = Number(productForm.stock ?? 0);
    const previousStock = editingProduct.stock ?? 0;
    const stockDelta = numericStock - previousStock;

    try {
      // Delete any removed original images from storage
      const removedImages = (originalImages || []).filter((url) => !(productForm.images || []).includes(url));
      if (removedImages.length > 0) {
        await Promise.all(removedImages.map(async (url) => {
          try {
            await deleteProductImageByUrl(url);
          } catch (err) {
            console.warn('Failed to delete image', url, err);
          }
        }));
      }

      // Upload new images and collect their URLs
      const uploadedUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const uploadedUrl = await uploadProductImage(file, editingProduct.id);
            uploadedUrls.push(uploadedUrl);
          } catch (err) {
            console.error('upload image error', err);
            const errorMessage = err instanceof Error ? err.message : 'Không thể upload ảnh';
            showToast('error', errorMessage);
            setSubmittingProduct(false);
            return;
          }
        }
      }

      const finalImages = Array.from(new Set([...(productForm.images || []), ...uploadedUrls]));

      try {
        await updateProductDetails(
          editingProduct.id,
          {
            name: productForm.name,
            price: Number(productForm.price),
            originalPrice:
              productForm.originalPrice === ''
                ? null
                : Number(productForm.originalPrice),
            category: productForm.category as ProductRaw['category'],
            subcategory: productForm.subcategory,
            colors: productForm.colors,
            sizes: productForm.sizes,
            features: productForm.features,
            isNew: productForm.isNew,
            isSale: productForm.isSale,
            rating: productForm.rating,
            reviewCount: productForm.reviewCount,
            stock: numericStock,
            soldCount: Number(productForm.soldCount),
            description: productForm.description,
            images: finalImages
          },
          {
            actorId: user?.id,
            stockDelta,
            reason: 'manual_adjustment'
          }
        );

        await refreshDashboard();
        showToast('success', 'Cập nhật sản phẩm thành công');
        closeProductModal();
      } catch (updateErr) {
        console.error('update product error', updateErr);
        const errorMessage = updateErr instanceof Error 
          ? updateErr.message 
          : (updateErr as any)?.message || 'Không thể cập nhật sản phẩm';
        showToast('error', `Lỗi cập nhật: ${errorMessage}`);
      }
    } catch (err) {
      console.error('update product error', err);
      let errorMessage = 'Không thể cập nhật sản phẩm';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('Bucket') && err.message.includes('chưa được tạo')) {
          errorMessage = err.message.replace(/\n/g, ' | ');
        }
      }
      showToast('error', errorMessage);
  } finally {
      setSubmittingProduct(false);
    }
  };

  const handleAddProduct = async () => {
    if (!canManageContent) return;
    setSubmittingProduct(true);
    if (!productForm.name || !productForm.price || Number(productForm.price) <= 0) {
      showToast('error', 'Vui lòng nhập tên và giá hợp lệ');
      setSubmittingProduct(false);
      return;
    }
    try {
      // Create the product first
      const newItem = await createProduct({
        name: productForm.name,
        price: Number(productForm.price),
        originalPrice:
          productForm.originalPrice === '' ? null : Number(productForm.originalPrice),
        category: productForm.category as ProductRaw['category'],
        subcategory: productForm.subcategory,
        colors: productForm.colors,
        sizes: productForm.sizes,
        features: productForm.features,
        isNew: productForm.isNew,
        isSale: productForm.isSale,
        rating: productForm.rating,
        reviewCount: productForm.reviewCount,
        stock: Number(productForm.stock),
        soldCount: Number(productForm.soldCount),
        description: productForm.description
      });
      if (!newItem) {
        throw new Error('Không thể tạo sản phẩm');
      }
      // Upload images if any and set them on the product
      const uploadedUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const uploadedUrl = await uploadProductImage(file, newItem.id);
            uploadedUrls.push(uploadedUrl);
          } catch (err) {
            console.error('upload image error', err);
            throw err;
          }
        }
      }

      if (uploadedUrls.length > 0) {
        try {
          await updateProductDetails(newItem.id, { images: uploadedUrls }, { actorId: user?.id, stockDelta: Number(productForm.stock) });
        } catch (err) {
          console.warn('Failed to update product with images', err);
        }
      }
      await refreshDashboard();
      showToast('success', 'Thêm sản phẩm thành công');
      setAddingProduct(false);
      setImageFiles([]);
      setImagePreviews([]);
      setOriginalImages([]);
    } catch (err) {
      console.error('create product error', err);
      showToast('error', 'Không thể thêm sản phẩm');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!canDeleteProduct) return;

    const confirmed = window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?');
    if (!confirmed) return;

    setDeletingProduct(productId);
    try {
      await deleteProduct(productId, user?.id);
      await refreshDashboard();
      showToast('success', 'Đã xóa sản phẩm');
    } catch (err) {
      console.error('delete product error', err);
      showToast('error', 'Không thể xóa sản phẩm');
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    if (!canManageContent) return;
    setStatusUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status, user?.id);
      await refreshDashboard();
      showToast('success', 'Đã cập nhật trạng thái đơn hàng');
    } catch (err) {
      console.error('update order status error', err);
      const msg = (err as any)?.message || JSON.stringify(err) || 'Không thể cập nhật trạng thái đơn hàng';
      showToast('error', `Không thể cập nhật trạng thái: ${msg}`);
    } finally {
      setStatusUpdating(null);
    }
  };

  const csvEscape = (value: string | number) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`;

  const downloadCsv = (
    header: (string | number)[],
    rows: Array<Array<string | number>>,
    filename: string
  ) => {
    if (!rows.length) return;
    const csvContent = [
      header.map(csvEscape).join(','),
      ...rows.map((row) => row.map(csvEscape).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProducts = () => {
    if (!productList.length) {
      showToast('error', 'Không có sản phẩm để xuất');
      return;
    }

    const rows = productList.map((product) => [
      product.id,
      product.name,
      product.category,
      product.subcategory ?? '',
      product.price,
      product.stock ?? 0,
      product.soldCount ?? 0
    ]);

    downloadCsv(
      ['ID', 'Tên sản phẩm', 'Danh mục', 'Phân loại', 'Giá', 'Tồn kho', 'Đã bán'],
      rows,
      `products-${new Date().toISOString().slice(0, 10)}.csv`
    );
    showToast('success', 'Đã xuất danh sách sản phẩm');
  };

  const handleExportOrders = () => {
    if (!recentOrders.length) {
      showToast('error', 'Không có đơn hàng để xuất');
      return;
    }

    const rows = recentOrders.map((order) => [
      order.id,
      order.customer,
      order.email,
      order.status,
      order.total,
      order.items,
      formatPaymentMethod(order.paymentMethod),
      new Date(order.date).toLocaleDateString('vi-VN')
    ]);

    downloadCsv(
      ['ID', 'Khách hàng', 'Email', 'Trạng thái', 'Tổng tiền', 'Số sản phẩm', 'Phương thức', 'Ngày'],
      rows,
      `orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    showToast('success', 'Đã xuất danh sách đơn hàng');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-green-100 text-green-800';
      case 'Đang giao':
        return 'bg-blue-100 text-blue-800';
      case 'Đang chuẩn bị':
        return 'bg-orange-100 text-orange-800';
      case 'Chờ xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStockStatus = (stock?: number) => {
    const value = stock ?? 0;
    if (value <= 0) {
      return { label: 'Hết hàng', className: 'bg-red-100 text-red-700' };
    }
    if (value <= LOW_STOCK_THRESHOLD) {
      return { label: 'Sắp hết', className: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'Còn hàng', className: 'bg-green-100 text-green-700' };
  };

  const filteredProducts = useMemo(
    () =>
      productList.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' ||
          product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [productList, searchTerm, selectedCategory]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải dữ liệu quản trị...
      </div>
    );
  }

  if (!canAccessDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Bạn cần quyền quản trị để truy cập trang này.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {user?.name || 'Admin'}
                </span>
              </div>
              <Link
                to="/admin/chat"
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>Chat với khách</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            {error}
          </div>
        )}

        {toastMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              toastMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {toastMessage.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
                  { id: 'products', label: 'Sản phẩm', icon: Package },
                  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
                  { id: 'customers', label: 'Khách hàng', icon: Users },
                  { id: 'analytics', label: 'Thống kê', icon: TrendingUp },
                  { id: 'settings', label: 'Cài đặt', icon: Settings }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setActiveTab(item.id as typeof activeTab)
                    }
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Tổng sản phẩm',
                      value: stats.totalProducts,
                      icon: Package,
                      color: 'bg-blue-500',
                      change: ''
                    },
                    {
                      title: 'Tổng đơn hàng',
                      value: stats.totalOrders,
                      icon: ShoppingCart,
                      color: 'bg-green-500',
                      change: ''
                    },
                    {
                      title: 'Tổng khách hàng',
                      value: stats.totalCustomers,
                      icon: Users,
                      color: 'bg-purple-500',
                      change: ''
                    },
                    {
                      title: 'Tổng doanh thu',
                      value: formatPrice(stats.totalRevenue),
                      icon: DollarSign,
                      color: 'bg-red-500',
                      change:
                        stats.monthlyGrowth !== 0
                          ? `${stats.monthlyGrowth}% so với tháng trước`
                          : ''
                    },
                    {
                      title: 'Doanh thu 7 ngày',
                      value: formatPrice(stats.weeklyRevenue),
                      icon: Calendar,
                      color: 'bg-indigo-500',
                      change: ''
                    },
                    {
                      title: 'Giá trị tồn kho',
                      value: formatPrice(stats.inventoryValue),
                      icon: AlertTriangle,
                      color: 'bg-amber-500',
                      change: `TB đơn: ${formatPrice(
                        stats.averageOrderValue
                      )}`
                    },
                    {
                      title: 'Đơn chờ xử lý',
                      value: stats.pendingOrders,
                      icon: AlertTriangle,
                      color: 'bg-orange-500',
                      change: ''
                    },
                    {
                      title: 'SP sắp hết hàng',
                      value: stats.lowStockItems,
                      icon: AlertTriangle,
                      color: 'bg-yellow-500',
                      change: ''
                    }
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-full ${s.color}`}
                        >
                          <s.icon
                            size={24}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {s.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {typeof s.value === 'string'
                          ? s.value
                          : s.value.toLocaleString()}
                      </p>
                      {s.change && (
                        <p className="text-xs text-green-600">
                          {s.change}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Revenue & Pending Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Biểu đồ doanh thu 14 ngày
                      </h3>
                      <span className="text-sm text-gray-500">
                        7 ngày:{' '}
                        <span className="font-semibold text-gray-900">
                          {formatPrice(stats.weeklyRevenue)}
                        </span>
                      </span>
                    </div>
                    <div className="h-64">
                      {revenueTrend.length ? (
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <AreaChart data={revenueTrend}>
                            <defs>
                              <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#dc2626"
                                  stopOpacity={0.4}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#dc2626"
                                  stopOpacity={0.05}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              tickFormatter={(value) =>
                                `${Math.round(
                                  Number(value) / 1000
                                )}k`
                              }
                              tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip
                              formatter={(value) =>
                                formatPrice(
                                  Number(value)
                                )
                              }
                              labelFormatter={(label) =>
                                `Ngày ${label}`
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#dc2626"
                              fillOpacity={1}
                              fill="url(#revenueGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          Chưa có dữ liệu doanh thu.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-orange-600">
                        Đơn chờ xử lý
                      </h3>
                      <button
                        onClick={() =>
                          setActiveTab('orders')
                        }
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Xem tất cả
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(pendingOrders ?? []).length ? (
                        (pendingOrders ?? []).slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {order.customer}
                              </p>
                              <p className="text-xs text-gray-500">
                                #{String(order.id || '').slice(-6)} •{' '}
                                {new Date(
                                  order.date
                                ).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    'orders'
                                  )
                                }
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Không có đơn nào chờ xử lý.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inventory Alerts + Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-600 flex items-center space-x-2">
                        <AlertTriangle
                          size={18}
                          className="text-red-500"
                        />
                        <span>Cảnh báo tồn kho</span>
                      </h3>
                      <span className="text-sm text-gray-500">
                        {inventoryAlerts.length} sản phẩm
                      </span>
                    </div>
                    <div className="space-y-4">
                      {inventoryAlerts.length ? (
                        inventoryAlerts
                          .slice(0, 6)
                          .map((alert) => (
                            <div
                              key={alert.productId}
                              className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {alert.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Tồn: {alert.stock} •
                                  Ngưỡng:{' '}
                                  {alert.threshold}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setActiveTab(
                                    'products'
                                  )
                                }
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Điều chỉnh
                              </button>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Không có cảnh báo tồn kho.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Tóm tắt đơn hàng
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Giá trị đơn trung bình
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {formatPrice(
                            stats.averageOrderValue
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Đơn đã giao
                        </p>
                        <p className="text-xl font-semibold text-green-600">
                          {
                            recentOrders.filter(
                              (o) =>
                                o.status ===
                                'Đã giao'
                            ).length
                          }
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Đơn đang giao
                        </p>
                        <p className="text-xl font-semibold text-blue-600">
                          {
                            recentOrders.filter(
                              (o) =>
                                o.status ===
                                'Đang giao'
                            ).length
                          }
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Đơn bị hủy
                        </p>
                        <p className="text-xl font-semibold text-red-600">
                          {
                            recentOrders.filter(
                              (o) =>
                                o.status ===
                                'Đã hủy'
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">
                      Đơn hàng gần đây
                    </h3>
                    <button
                      onClick={() =>
                        setActiveTab('orders')
                      }
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">
                            Mã đơn
                          </th>
                          <th className="text-left py-3">
                            Khách hàng
                          </th>
                          <th className="text-left py-3">
                            Tổng tiền
                          </th>
                          <th className="text-left py-3">
                            Trạng thái
                          </th>
                          <th className="text-left py-3">
                            Ngày
                          </th>
                          <th className="text-left py-3">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(recentOrders ?? [])
                          .slice(0, 5)
                          .map((order) => (
                            <tr
                              key={order.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3 font-medium">
                                {order.id}
                              </td>
                              <td className="py-3">
                                {order.customer}
                              </td>
                              <td className="py-3">
                                {formatPrice(
                                  order.total
                                )}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3">
                                {new Date(
                                  order.date
                                ).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() =>
                                    setActiveTab(
                                      'orders'
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold">
                    Quản lý sản phẩm
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Tìm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) =>
                            setSearchTerm(
                              e.target.value
                            )
                          }
                          className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) =>
                          setSelectedCategory(
                            e.target.value as any
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                      >
                        <option value="all">
                          Tất cả danh mục
                        </option>
                        <option value="men">Nam</option>
                        <option value="women">
                          Nữ
                        </option>
                        <option value="kids">
                          Trẻ em
                        </option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={openAddProductModal}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        disabled={!canManageContent}
                      >
                        <Plus size={16} />
                        <span>Thêm sản phẩm</span>
                      </button>
                      <button
                        onClick={handleExportProducts}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Download size={16} />
                        <span>Xuất CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">
                          Hình ảnh
                        </th>
                        <th className="text-left py-3">
                          Tên sản phẩm
                        </th>
                        <th className="text-left py-3">
                          Danh mục
                        </th>
                        <th className="text-left py-3">
                          Giá
                        </th>
                        <th className="text-left py-3">
                          Tồn kho
                        </th>
                        <th className="text-left py-3">
                          Trạng thái
                        </th>
                        <th className="text-left py-3">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts
                        .slice(0, 50)
                        .map((product) => {
                          const stockStatus =
                            getProductStockStatus(
                              product.stock
                            );
                          return (
                            <tr
                              key={product.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3">
                                {product.images?.[0] ? (
                                  <img
                                    src={
                                      product
                                        .images[0]
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                    No img
                                  </div>
                                )}
                              </td>
                              <td className="py-3">
                                <p className="font-medium">
                                  {product.name}
                                </p>
                                {product.subcategory && (
                                  <p className="text-xs text-gray-500">
                                    {
                                      product.subcategory
                                    }
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {product.colors.slice(0, 4).map((c, idx) => (
                                      <span key={idx} className="w-3 h-3 rounded-full border" style={{backgroundColor: '#ddd'}} />
                                    ))}
                                    {product.colors.length > 4 && (
                                      <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    {product.features.slice(0, 2).map((f, idx) => (
                                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {f}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 capitalize">
                                {product.category ===
                                'men'
                                  ? 'Nam'
                                  : product.category ===
                                    'women'
                                  ? 'Nữ'
                                  : 'Trẻ em'}
                              </td>
                              <td className="py-3">
                                <p className="font-medium">
                                  {formatPrice(
                                    product.price
                                  )}
                                </p>
                                {product.originalPrice && (
                                  <p className="text-xs text-gray-500 line-through">
                                    {formatPrice(
                                      product.originalPrice
                                    )}
                                  </p>
                                )}
                              </td>
                              <td className="py-3">
                                <span className="font-medium">
                                  {product.stock ??
                                    0}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}
                                >
                                  {stockStatus.label}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                  <button
                                    className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-40"
                                    disabled={
                                      !canManageContent
                                    }
                                    onClick={() =>
                                      canManageContent &&
                                      openProductModal(
                                        product
                                      )
                                    }
                                  >
                                    <Edit
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                  <button
                                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-40"
                                    disabled={
                                      !canDeleteProduct ||
                                      deletingProduct ===
                                        product.id
                                    }
                                    onClick={() =>
                                      canDeleteProduct &&
                                      handleDeleteProduct(
                                        product.id
                                      )
                                    }
                                  >
                                    {deletingProduct ===
                                    product.id ? (
                                      <span className="text-[10px]">
                                        ...
                                      </span>
                                    ) : (
                                      <Trash2
                                        size={
                                          16
                                        }
                                      />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Hiển thị tối đa 50 sản phẩm. Thêm
                  phân trang nếu cần.
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    Quản lý đơn hàng
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-sm">
                      <Filter size={16} />
                      <span>Lọc</span>
                    </button>
                    <button
                      onClick={handleExportOrders}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-sm"
                    >
                      <Download size={16} />
                      <span>Xuất CSV</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-3">
                        <div>
                          <h4 className="text-sm md:text-base font-semibold">
                            Đơn hàng #{order.id}
                          </h4>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                            <span>
                              Khách hàng:{' '}
                              {order.customer}
                            </span>
                            <span>
                              Email:{' '}
                              {order.email}
                            </span>
                            <span>
                              Ngày:{' '}
                              {new Date(
                                order.date
                              ).toLocaleDateString(
                                'vi-VN'
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-base md:text-lg font-semibold">
                            {formatPrice(
                              order.total
                            )}
                          </p>
                          {canManageContent ? (
                            <select
                              value={
                                order.status
                              }
                              disabled={
                                statusUpdating ===
                                order.id
                              }
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order.id,
                                  e.target.value
                                )
                              }
                              className="w-40 border border-gray-300 rounded-lg text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              {ORDER_STATUSES.map(
                                (
                                  stt
                                ) => (
                                  <option
                                    key={
                                      stt
                                    }
                                    value={
                                      stt
                                    }
                                  >
                                    {
                                      stt
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                        <div>
                          <span>
                            Số lượng sản phẩm:
                          </span>{' '}
                          <span className="font-semibold">
                            {order.items}
                          </span>
                        </div>
                        <div>
                          <span>
                            Thanh toán:
                          </span>{' '}
                          <span className="font-semibold">
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/order/${order.id}`} className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!recentOrders.length && (
                    <p className="text-sm text-gray-500">
                      Chưa có đơn hàng nào.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOMERS TAB */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Quản lý khách hàng
                  </h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Tìm khách hàng..."
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                      />
                    </div>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-sm">
                      <Download size={16} />
                      <span>Xuất CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">
                          Khách hàng
                        </th>
                        <th className="text-left py-3">
                          Liên hệ
                        </th>
                        <th className="text-left py-3">
                          Số đơn
                        </th>
                        <th className="text-left py-3">
                          Tổng chi tiêu
                        </th>
                        <th className="text-left py-3">
                          Đơn TB
                        </th>
                        <th className="text-left py-3">
                          Đơn gần nhất
                        </th>
                        <th className="text-left py-3">
                          Ngày tham gia
                        </th>
                        <th className="text-left py-3">
                          Trạng thái
                        </th>
                        <th className="text-left py-3">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-xs font-semibold">
                                  {customer.name.charAt(
                                    0
                                  )}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {customer.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {customer.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <p>{customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-gray-500">
                                {customer.phone}
                              </p>
                            )}
                          </td>
                          <td className="py-3 font-medium">
                            {customer.totalOrders}
                          </td>
                          <td className="py-3 font-medium text-green-600">
                            {formatPrice(
                              customer.totalSpent
                            )}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {customer.averageOrderValue
                              ? formatPrice(customer.averageOrderValue)
                              : '—'}
                          </td>
                          <td className="py-3 text-xs text-gray-500">
                            {customer.lastOrderDate
                              ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')
                              : 'Chưa có'}
                          </td>
                          <td className="py-3">
                            {customer.joinDate
                              ? new Date(customer.joinDate).toLocaleDateString('vi-VN')
                              : '—'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                customer.status ===
                                'VIP'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {customer.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={async () => {
                                  setLoadingCustomerDetails(true);
                                  try {
                                    const customerId = customer.originalId || customer.id.replace('CUST', '');
                                    const details = await getCustomerDetails(customerId);
                                    if (details) {
                                      setSelectedCustomer(details.customer);
                                      setCustomerDetailOrders(details.orders);
                                    } else {
                                      showToast('error', 'Không tìm thấy thông tin khách hàng');
                                    }
                                  } catch (err) {
                                    console.error('Error loading customer details', err);
                                    showToast('error', 'Không thể tải chi tiết khách hàng');
                                  } finally {
                                    setLoadingCustomerDetails(false);
                                  }
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                disabled={loadingCustomerDetails}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!customers.length && (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-4 text-center text-sm text-gray-500"
                          >
                            Chưa có dữ liệu khách hàng.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-6">
                    Thống kê bán hàng
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.totalRevenue)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}% so với tháng trước
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Doanh thu 7 ngày</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(stats.weeklyRevenue)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Giá trị đơn trung bình</p>
                      <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.averageOrderValue)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-4">Biểu đồ doanh thu 14 ngày</h4>
                    <div className="h-64">
                      {revenueTrend.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueTrend}>
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis
                              tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                              tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip
                              formatter={(value) => formatPrice(Number(value))}
                              labelFormatter={(label) => `Ngày ${label}`}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#dc2626"
                              fillOpacity={1}
                              fill="url(#revenueGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          Chưa có dữ liệu doanh thu.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2">
                        <BarChart3 size={20} className="text-blue-600" />
                        <span>Sản phẩm bán chạy</span>
                      </h4>
                      <div className="space-y-2">
                        {productList
                          .sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
                          .slice(0, 5)
                          .map((product) => (
                            <div key={product.id} className="flex justify-between items-center text-sm">
                              <span className="truncate flex-1">{product.name}</span>
                              <span className="font-medium text-gray-700 ml-2">
                                {product.soldCount ?? 0} đã bán
                              </span>
                            </div>
                          ))}
                        {productList.length === 0 && (
                          <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2">
                        <Users size={20} className="text-purple-600" />
                        <span>Khách hàng hàng đầu</span>
                      </h4>
                      <div className="space-y-2">
                        {(customers ?? []).slice(0, 5).map((customer) => (
                          <div key={customer.id} className="flex justify-between items-center text-sm">
                            <span className="truncate flex-1">{customer.name}</span>
                            <span className="font-medium text-green-600 ml-2">
                              {formatPrice(customer.totalSpent)}
                            </span>
                          </div>
                        ))}
                        {customers.length === 0 && (
                          <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold">
                  Cài đặt hệ thống (demo)
                </h3>

                <div className="border-b pb-4 space-y-2">
                  <h4 className="font-semibold">
                    Thông tin cửa hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="px-3 py-2 border rounded-lg text-sm"
                      defaultValue="Shop của bạn"
                      placeholder="Tên cửa hàng"
                    />
                    <input
                      className="px-3 py-2 border rounded-lg text-sm"
                      defaultValue="contact@example.com"
                      placeholder="Email liên hệ"
                    />
                  </div>
                </div>

                <div className="border-b pb-4 space-y-2">
                  <h4 className="font-semibold">
                    Thanh toán
                  </h4>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                    />
                    Thanh toán khi nhận hàng
                    (COD)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                    />
                    Chuyển khoản ngân hàng
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    Ví điện tử (MOMO, ZaloPay…)
                  </label>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">
                    Giao hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1 text-sm">
                      <span>Miễn phí ship từ</span>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg"
                        defaultValue={500000}
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <span>
                        Thời gian giao dự kiến
                        (ngày)
                      </span>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg"
                        defaultValue={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    Lưu cài đặt (demo)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Chi tiết khách hàng</h3>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetailOrders([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
                {selectedCustomer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">{selectedCustomer.phone}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
                {selectedCustomer.averageOrderValue && (
                  <div>
                    <p className="text-sm text-gray-600">Giá trị đơn trung bình</p>
                    <p className="text-lg font-semibold">{formatPrice(selectedCustomer.averageOrderValue)}</p>
                  </div>
                )}
                {selectedCustomer.loyaltyPoints !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Điểm thưởng</p>
                    <p className="text-lg font-semibold">{selectedCustomer.loyaltyPoints}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Lịch sử đơn hàng</h4>
              <div className="space-y-3">
                {customerDetailOrders.length > 0 ? (
                  customerDetailOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Đơn hàng #{String(order.id || '').slice(-8)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatPrice(order.total)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Số sản phẩm: {order.items}</p>
                        <p>Thanh toán: {formatPaymentMethod(order.paymentMethod)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Khách hàng chưa có đơn hàng nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {(editingProduct || addingProduct) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {addingProduct ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}
            </h3>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Tên sản phẩm
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={productForm.name}
                onChange={(e) =>
                  handleProductInputChange(
                    'name',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Giá
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.price}
                  onChange={(e) =>
                    handleProductInputChange(
                      'price',
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Giá gốc
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.originalPrice}
                  onChange={(e) =>
                    handleProductInputChange(
                      'originalPrice',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Màu sắc</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {(productForm.colors || []).map((c, i) => (
                    <span key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                      {c}
                      <button
                        onClick={() => handleRemoveTag('colors', i)}
                        className="text-gray-600 hover:text-red-700"
                        aria-label={`Xóa màu ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="border rounded px-2 py-1 text-sm min-w-[120px]"
                    value={colorInput}
                    placeholder="Thêm màu và Enter"
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (colorInput.trim()) {
                          handleAddTag('colors', colorInput.trim());
                          setColorInput('');
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Kích cỡ</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {(productForm.sizes || []).map((s, i) => (
                    <span key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                      {s}
                      <button
                        onClick={() => handleRemoveTag('sizes', i)}
                        className="text-gray-600 hover:text-red-700"
                        aria-label={`Xóa size ${s}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="border rounded px-2 py-1 text-sm min-w-[120px]"
                    value={sizeInput}
                    placeholder="Thêm size và Enter"
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (sizeInput.trim()) {
                          handleAddTag('sizes', sizeInput.trim());
                          setSizeInput('');
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 mb-1">Tính năng (phân cách bằng dấu phẩy)</label>
              <div className="flex flex-wrap gap-2 items-center">
                {(productForm.features || []).map((f, i) => (
                  <span key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                    {f}
                    <button
                      onClick={() => handleRemoveTag('features', i)}
                      className="text-gray-600 hover:text-red-700"
                      aria-label={`Xóa tính năng ${f}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="border rounded px-2 py-1 text-sm min-w-[160px]"
                  value={featureInput}
                  placeholder="Thêm tính năng và Enter"
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      if (featureInput.trim()) {
                        handleAddTag('features', featureInput.trim());
                        setFeatureInput('');
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.isNew}
                  onChange={() => handleToggleField('isNew')}
                />
                Mới
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.isSale}
                  onChange={() => handleToggleField('isSale')}
                />
                Giảm giá
              </label>
              <div className="flex items-center gap-2 text-sm">
                <label className="block text-sm text-gray-700">Đánh giá</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  className="w-24 border rounded px-3 py-2 text-sm"
                  value={productForm.rating ?? ''}
                  onChange={(e) => handleOptionalNumberInput('rating', e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label className="block text-sm text-gray-700">Số review</label>
                <input
                  type="number"
                  className="w-24 border rounded px-3 py-2 text-sm"
                  value={productForm.reviewCount}
                  onChange={(e) => handleProductInputChange('reviewCount', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Danh mục</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.category}
                  onChange={(e) => handleProductInputChange('category', e.target.value)}
                >
                  <option value="men">Nam</option>
                  <option value="women">Nữ</option>
                  <option value="kids">Trẻ em</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phân loại</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.subcategory}
                  onChange={(e) => handleProductInputChange('subcategory', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tồn kho
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.stock}
                  onChange={(e) =>
                    handleProductInputChange(
                      'stock',
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Đã bán
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={productForm.soldCount}
                  onChange={(e) =>
                    handleProductInputChange(
                      'soldCount',
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={productForm.description}
                onChange={(e) =>
                  handleProductInputChange(
                    'description',
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Hình ảnh sản phẩm
              </label>
              <div className="flex items-center gap-2 mb-2">
                {(productForm.images || []).map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="img" className="w-16 h-16 object-cover rounded" />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-xs border border-gray-200"
                      aria-label="Xóa ảnh"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img src={src} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded" />
                    <button
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-xs border border-gray-200"
                      aria-label="Xóa ảnh mới"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageFilesSelected(e.target.files)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  closeProductModal();
                  setAddingProduct(false);
                }}
                className="px-4 py-2 rounded border text-sm text-gray-700 hover:bg-gray-50"
                disabled={submittingProduct}
              >
                Hủy
              </button>
              <button
                onClick={addingProduct ? handleAddProduct : handleSaveProduct}
                disabled={submittingProduct}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
              >
                {submittingProduct ? 'Đang lưu...' : addingProduct ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
