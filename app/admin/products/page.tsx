// app/admin/products/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import ProductCreate from "@/components/ProductCreate";
import { useDispatch, useSelector } from "react-redux";
import {
  GetAllProductRequest,
  GetAllProductSuccess,
  GetAllProductFail,
  ProductDeleteRequest,
  ProductDeleteFail,
  ProductDeleteSuccess,
  ProductAllDeleteFail,
  ProductAllDeleteRequest,
  ProductAllDeleteSuccess,
  ProductAllRestoreRequest,
  ProductAllRestoreSuccess,
  ProductAllRestoreFail,
} from "@/redux/reducers/productReducer";
import Axios from "@/components/Axios";
import { useSession } from "next-auth/react";
import { RootState } from "@/redux/rootReducer";
import toast from "react-hot-toast";
import ProductUpdateForm from "@/components/ProductUpdate";
import {
  GetAllCategoryFail,
  GetAllCategoryRequest,
  GetAllCategorySuccess,
} from "@/redux/reducers/settingReducer";

// Define the Product interface locally to match your Redux state
interface Product {
  _id: string;
  sku: string;
  ean?: string;
  title: string;
  description: string;
  price: number;
  cost_price?: number;
  currency: string;
  stock_quantity: number;
  images: ProductImage[];
  thumbnail: string;
  categories: Category[]; // Fixed: This should be an array
  sizes: ProductSize[];
  colors?: ProductColor[];
  weight: string;
  weight_unit: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  status: string;
  visibility: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  view_count: number;
  purchase_count: number;
  review: ProductReview[];
}

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

interface Category {
  id?: string;
  name?: string;
  main_category?: string;
  sub_category?: string;
  main_label?: string;
}

interface ProductColor {
  name: string;
  colorCode: string;
}

interface ProductSize {
  label: string;
  stock: number;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  weight?: number;
  isDefault: boolean;
}

interface ProductReview {
  rating: number;
  image: string;
  comment: string;
  createdAt: Date;
}

interface ExtendedSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const statusOptions = ["All Status", "draft", "published", "archived"];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const { categories } = useSelector((state: RootState) => state.category);

  const { products, loading, error } = useSelector(
    (state: RootState) =>
      state.product as {
        products: Product[] | null;
        loading: boolean;
        error: string | null;
      },
  );

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // Fetch products on component mount
  const getProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      dispatch(GetAllProductRequest());

      const token =
        session?.user?.id || localStorage.getItem("auth-token") || "";

      const { data } = await Axios.get("/all/product", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(GetAllProductSuccess(data));
    } catch (err: any) {
      dispatch(
        GetAllProductFail(
          err.response?.data?.message || "Failed to fetch products",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, session]);

  const getCategories = useCallback(async () => {
    const token = session?.user?.id || localStorage.getItem("auth-token") || "";
    try {
      dispatch(GetAllCategoryRequest());
      const { data } = await Axios.get("/all/category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(GetAllCategorySuccess(data));
    } catch (err: any) {
      dispatch(GetAllCategoryFail(err.response.data.message));
    }
  }, []);

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  // Filter products based on criteria - FIXED
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product: Product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();

        // Check title
        const matchesTitle = product.title?.toLowerCase().includes(query) || false;

        // Check SKU
        const matchesSku = product.sku?.toLowerCase().includes(query) || false;

        // Check description
        const matchesDescription = product.description?.toLowerCase().includes(query) || false;

        // Check categories (handle both array and object structures)
        let matchesCategory = false;
        if (product.categories && Array.isArray(product.categories)) {
          matchesCategory = product.categories.some(cat => {
            const catName = cat.main_category || cat.name || cat.main_label || "";
            return catName.toLowerCase().includes(query);
          });
        } else if (product.categories && !Array.isArray(product.categories)) {
          // Handle case where categories might be a single object
          const catName = (product.categories as any).main_category ||
            (product.categories as any).name ||
            (product.categories as any).main_label || "";
          matchesCategory = catName.toLowerCase().includes(query);
        }

        // Check keywords
        const matchesKeywords = product.keywords?.some(keyword =>
          keyword.toLowerCase().includes(query)
        ) || false;

        // Check EAN if exists
        const matchesEan = product.ean?.toLowerCase().includes(query) || false;

        if (!matchesTitle && !matchesSku && !matchesDescription &&
          !matchesCategory && !matchesKeywords && !matchesEan) {
          return false;
        }
      }

      // Category filter - FIXED
      if (selectedCategory !== "All Categories") {
        let hasCategory = false;

        if (product.categories && Array.isArray(product.categories)) {
          hasCategory = product.categories.some(cat => {
            const catName = cat.main_category || cat.name || cat.main_label || "";
            return catName === selectedCategory;
          });
        } else if (product.categories && !Array.isArray(product.categories)) {
          const catName = (product.categories as any).main_category ||
            (product.categories as any).name ||
            (product.categories as any).main_label || "";
          hasCategory = catName === selectedCategory;
        }

        if (!hasCategory) return false;
      }

      // Status filter
      if (selectedStatus !== "All Status" && product.status !== selectedStatus) {
        return false;
      }

      // Price filter
      if (minPrice && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price > parseFloat(maxPrice)) return false;

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedStatus,
    minPrice,
    maxPrice,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "stock-asc":
        return sorted.sort((a, b) => a.stock_quantity - b.stock_quantity);
      case "stock-desc":
        return sorted.sort((a, b) => b.stock_quantity - a.stock_quantity);
      case "sales-desc":
        return sorted.sort(
          (a, b) => (b.purchase_count || 0) - (a.purchase_count || 0),
        );
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        inStockCount: 0,
        totalProducts: 0,
      };
    }

    const totalRevenue = products.reduce(
      (sum, product) => sum + product.price * (product.purchase_count || 0),
      0,
    );

    const totalSales = products.reduce(
      (sum, product) => sum + (product.purchase_count || 0),
      0,
    );

    const inStockCount = products.filter(
      (product) => product.stock_quantity > 0 && product.status === "published",
    ).length;

    return {
      totalRevenue,
      totalSales,
      inStockCount,
      totalProducts: products.length,
    };
  }, [products]);

  // Pagination calculations
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, sortBy]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p._id));
    }
  };

  // Handle select single product
  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      dispatch(ProductDeleteRequest());
      const token =
        session?.user?.id || localStorage.getItem("auth-token") || "";

      const { data } = await Axios.delete(`/delete/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(ProductDeleteSuccess(data));
      toast.success(data.message || "Product deleted successfully");
      getProducts(); // Refresh the product list
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete product";
      dispatch(ProductDeleteFail(errorMessage));
      toast.error(errorMessage);
    }
  };

  // Handle delete selected products
  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected product(s)?`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      dispatch(ProductAllDeleteRequest());
      const token =
        session?.user?.id || localStorage.getItem("auth-token") || "";

      const { data } = await Axios.delete("/delete/products", {
        data: {
          deletedProducts: selectedProducts,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(ProductAllDeleteSuccess(data));

      await getProducts();
      setSelectedProducts([]);
      toast.success(data.message || "Products deleted successfully");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete products";
      dispatch(ProductAllDeleteFail(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedProducts.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to restore ${selectedProducts.length} selected product(s)?`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      dispatch(ProductAllRestoreRequest());
      const token =
        session?.user?.id || localStorage.getItem("auth-token") || "";

      const { data } = await Axios.patch(
        "/restore/products",
        { restoreProducts: selectedProducts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(ProductAllRestoreSuccess(data));

      await getProducts();
      setSelectedProducts([]);
      toast.success(data.message || "Products restored successfully");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to restore products";
      dispatch(ProductAllRestoreFail(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedStatus("All Status");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Handle edit product
  const handleEditProduct = (id: string) => {
    setSelectedProductId(id);
    setShowUpdateModal(true);
  };

  // Handle add product
  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get stock status badge
  const getStockBadge = (quantity: number) => {
    if (quantity > 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    } else if (quantity > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `$${amount.toFixed(2)}`;
    }
  };

  // Handle product added from modal
  const handleProductAdded = (newProduct: Product) => {
    getProducts();
  };

  if (isLoading && !products) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1 sm:text-sm">
            Manage your products, inventory, and pricing
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={handleRestoreSelected}
            disabled={selectedProducts.length === 0 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-1.5" />
            )}
            Restore Selected
          </button>

          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Products
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {statistics.totalProducts}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-base font-bold text-gray-900 mt-1">
                {formatCurrency(statistics.totalRevenue, "USD")}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Revenue
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {statistics.totalSales.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Sales
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">In Stock</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {statistics.inStockCount}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">
                {products && products.length > 0
                  ? Math.round(
                    (statistics.inStockCount / products.length) * 100,
                  )
                  : 0}
                % of total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, description, category, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronRight className="w-4 h-4 ml-2 rotate-90" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {categories?.map((category: any, ind: number) => (
                    <option key={ind} value={category.main_label || category.name}>
                      {category.main_label || category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    step="0.01"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    step="0.01"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="stock-asc">Stock (Low to High)</option>
                  <option value="stock-desc">Stock (High to Low)</option>
                  <option value="sales-desc">Best Selling</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={
                    selectedProducts.length === paginatedProducts.length &&
                    paginatedProducts.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selectedProducts.length} selected
                </span>
              </div>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1.5" />
                  )}
                  Delete Selected
                </button>
              )}
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories && Array.isArray(product.categories) && product.categories.length > 0 ? (
                          product.categories.slice(0, 2).map((cat, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                            >
                              {cat.main_category || cat.name || cat.main_label || "N/A"}
                            </span>
                          ))
                        ) : product.categories && !Array.isArray(product.categories) ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {(product.categories as any).main_category ||
                              (product.categories as any).name ||
                              (product.categories as any).main_label || "N/A"}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                        {product.categories && Array.isArray(product.categories) && product.categories.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            +{product.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price, product.currency || "USD")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {product.stock_quantity} Pcs
                        </div>
                        <div>{getStockBadge(product.stock_quantity)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.purchase_count || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product._id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading products...</span>
          </div>
        )}

        {totalItems > 0 && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> products
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading &&
        paginatedProducts.length === 0 &&
        filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {searchQuery ||
                selectedCategory !== "All Categories" ||
                selectedStatus !== "All Status"
                ? "No products found"
                : "No products yet"}
            </h3>
            <p className="text-gray-600 mb-6 sm:text-sm">
              {searchQuery ||
                selectedCategory !== "All Categories" ||
                selectedStatus !== "All Status"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by adding your first product."}
            </p>
            {searchQuery ||
              selectedCategory !== "All Categories" ||
              selectedStatus !== "All Status" ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            )}
          </div>
        )}

      {/* Modals */}
      <ProductCreate
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      {selectedProductId && (
        <ProductUpdateForm
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedProductId(null);
          }}
          productId={selectedProductId}
          onProductUpdated={(updatedProduct) => {
            getProducts();
            setShowUpdateModal(false);
            setSelectedProductId(null);
          }}
        />
      )}
    </div>
  );
}