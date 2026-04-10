"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Tag,
  Percent,
  Calendar,
  DollarSign,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  MoreVertical,
  Download,
  Upload,
} from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

interface Discount {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  products: string[]; // Product IDs
  categories: string[];
  minimumPurchase: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired" | "upcoming";
  createdAt: string;
  createdBy: string;
}

interface Category {
  id: string;
  name: string;
  productCount: number;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Earbuds Pro",
    sku: "EB-PRO-001",
    price: 129.99,
    category: "Electronics",
    stock: 45,
  },
  {
    id: "2",
    name: "Smart Watch Series 5",
    sku: "SW-S5-002",
    price: 299.99,
    category: "Electronics",
    stock: 32,
  },
  {
    id: "3",
    name: "Gaming Laptop",
    sku: "GL-2024-003",
    price: 1299.99,
    category: "Computers",
    stock: 18,
  },
  {
    id: "4",
    name: "Bluetooth Speaker",
    sku: "BS-250-004",
    price: 79.99,
    category: "Audio",
    stock: 67,
  },
  {
    id: "5",
    name: "Fitness Tracker",
    sku: "FT-FIT-005",
    price: 59.99,
    category: "Wearables",
    stock: 89,
  },
  {
    id: "6",
    name: "4K Camera",
    sku: "CAM-4K-006",
    price: 499.99,
    category: "Cameras",
    stock: 23,
  },
  {
    id: "7",
    name: "Gaming Mouse",
    sku: "GM-PRO-007",
    price: 49.99,
    category: "Accessories",
    stock: 156,
  },
  {
    id: "8",
    name: "Mechanical Keyboard",
    sku: "MK-RGB-008",
    price: 89.99,
    category: "Accessories",
    stock: 72,
  },
  {
    id: "9",
    name: "USB-C Hub",
    sku: "USB-HUB-009",
    price: 34.99,
    category: "Accessories",
    stock: 231,
  },
  {
    id: "10",
    name: "Power Bank",
    sku: "PB-100W-010",
    price: 69.99,
    category: "Accessories",
    stock: 94,
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Electronics", productCount: 2 },
  { id: "2", name: "Computers", productCount: 1 },
  { id: "3", name: "Audio", productCount: 1 },
  { id: "4", name: "Wearables", productCount: 1 },
  { id: "5", name: "Cameras", productCount: 1 },
  { id: "6", name: "Accessories", productCount: 4 },
];

const initialDiscounts: Discount[] = [
  {
    id: "1",
    name: "Summer Sale 2024",
    code: "SUMMER24",
    type: "percentage",
    value: 20,
    products: ["1", "2", "3"],
    categories: ["1", "2"],
    minimumPurchase: 100,
    maximumDiscount: 50,
    usageLimit: 1000,
    usedCount: 342,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
    createdAt: "2024-05-15",
    createdBy: "Admin User",
  },
  {
    id: "2",
    name: "Free Shipping Offer",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    products: [],
    categories: [],
    minimumPurchase: 50,
    usageLimit: 500,
    usedCount: 189,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    createdAt: "2024-01-01",
    createdBy: "Admin User",
  },
  {
    id: "3",
    name: "Back to School",
    code: "SCHOOL2024",
    type: "fixed",
    value: 25,
    products: ["3", "7", "8", "9"],
    categories: ["2", "6"],
    minimumPurchase: 200,
    usageLimit: 300,
    usedCount: 45,
    startDate: "2024-08-01",
    endDate: "2024-09-30",
    status: "upcoming",
    createdAt: "2024-07-15",
    createdBy: "Admin User",
  },
  {
    id: "4",
    name: "Clearance Sale",
    code: "CLEARANCE",
    type: "percentage",
    value: 40,
    products: ["4", "10"],
    categories: ["3", "6"],
    minimumPurchase: 0,
    usageLimit: 200,
    usedCount: 200,
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    status: "expired",
    createdAt: "2024-02-20",
    createdBy: "Admin User",
  },
];

const AdminDiscountsPage: React.FC = () => {
  // State management
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [filteredDiscounts, setFilteredDiscounts] =
    useState<Discount[]>(initialDiscounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null,
  );
  const [expandedDiscount, setExpandedDiscount] = useState<string | null>(null);

  // New discount form state
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    name: "",
    code: "",
    type: "percentage",
    value: 10,
    products: [],
    categories: [],
    minimumPurchase: 0,
    maximumDiscount: undefined,
    usageLimit: undefined,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "active",
  });

  // Product selection state
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  // Filter discounts
  useEffect(() => {
    let filtered = discounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (discount) =>
          discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.code.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (discount) => discount.status === selectedStatus,
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((discount) => discount.type === selectedType);
    }

    setFilteredDiscounts(filtered);
  }, [searchTerm, selectedStatus, selectedType, discounts]);

  // Status badge component
  const StatusBadge: React.FC<{ status: Discount["status"] }> = ({
    status,
  }) => {
    const config = {
      active: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      inactive: {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: <Clock className="w-4 h-4" />,
      },
      expired: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: <XCircle className="w-4 h-4" />,
      },
      upcoming: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <Calendar className="w-4 h-4" />,
      },
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config[status].color}`}
      >
        {config[status].icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Type badge component
  const TypeBadge: React.FC<{ type: Discount["type"]; value: number }> = ({
    type,
    value,
  }) => {
    const config = {
      percentage: {
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        icon: <Percent className="w-4 h-4" />,
        label: `${value}% OFF`,
      },
      fixed: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <DollarSign className="w-4 h-4" />,
        label: `$${value} OFF`,
      },
      free_shipping: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: <Package className="w-4 h-4" />,
        label: "Free Shipping",
      },
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config[type].color}`}
      >
        {config[type].icon}
        {config[type].label}
      </span>
    );
  };

  // Generate discount code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDiscount({ ...newDiscount, code });
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId),
      );
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(
        selectedCategoryIds.filter((id) => id !== categoryId),
      );
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);

      // Auto-select products from this category
      const categoryProducts = products.filter(
        (p) => p.category === categories.find((c) => c.id === categoryId)?.name,
      );
      const newProductIds = categoryProducts.map((p) => p.id);
      const uniqueProductIds = [
        ...new Set([...selectedProductIds, ...newProductIds]),
      ];
      setSelectedProductIds(uniqueProductIds);
    }
  };

  // Toggle select all products
  const toggleSelectAllProducts = () => {
    if (selectAllProducts) {
      setSelectedProductIds([]);
      setSelectedCategoryIds([]);
    } else {
      const allProductIds = products.map((p) => p.id);
      const allCategoryIds = categories.map((c) => c.id);
      setSelectedProductIds(allProductIds);
      setSelectedCategoryIds(allCategoryIds);
    }
    setSelectAllProducts(!selectAllProducts);
  };

  // Create new discount
  const handleCreateDiscount = () => {
    const discount: Discount = {
      id: Date.now().toString(),
      name: newDiscount.name || "",
      code: newDiscount.code || "",
      type: newDiscount.type || "percentage",
      value: newDiscount.value || 0,
      products: selectedProductIds,
      categories: selectedCategoryIds,
      minimumPurchase: newDiscount.minimumPurchase || 0,
      maximumDiscount: newDiscount.maximumDiscount,
      usageLimit: newDiscount.usageLimit,
      usedCount: 0,
      startDate: newDiscount.startDate || "",
      endDate: newDiscount.endDate || "",
      status: newDiscount.status || "active",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "Admin User",
    };

    setDiscounts([...discounts, discount]);
    setShowCreateModal(false);
    resetForm();
  };

  // Edit discount
  const handleEditDiscount = () => {
    if (!selectedDiscount) return;

    const updatedDiscounts = discounts.map((discount) =>
      discount.id === selectedDiscount.id
        ? {
            ...selectedDiscount,
            products: selectedProductIds,
            categories: selectedCategoryIds,
          }
        : discount,
    );

    setDiscounts(updatedDiscounts);
    setShowEditModal(false);
    resetForm();
  };

  // Delete discount
  const handleDeleteDiscount = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this discount? This action cannot be undone.",
      )
    ) {
      setDiscounts(discounts.filter((discount) => discount.id !== id));
    }
  };

  // Duplicate discount
  const handleDuplicateDiscount = (discount: Discount) => {
    const duplicatedDiscount: Discount = {
      ...discount,
      id: Date.now().toString(),
      code: `${discount.code}_COPY`,
      name: `${discount.name} (Copy)`,
      usedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setDiscounts([...discounts, duplicatedDiscount]);
  };

  // Reset form
  const resetForm = () => {
    setNewDiscount({
      name: "",
      code: "",
      type: "percentage",
      value: 10,
      products: [],
      categories: [],
      minimumPurchase: 0,
      maximumDiscount: undefined,
      usageLimit: undefined,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "active",
    });
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setSelectAllProducts(false);
  };

  // Set up edit form
  const setupEditForm = (discount: Discount) => {
    setSelectedDiscount(discount);
    setSelectedProductIds(discount.products);
    setSelectedCategoryIds(discount.categories);
    setSelectAllProducts(discount.products.length === products.length);
    setShowEditModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate usage percentage
  const calculateUsagePercentage = (discount: Discount) => {
    if (!discount.usageLimit) return 0;
    return Math.round((discount.usedCount / discount.usageLimit) * 100);
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase()),
  );

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-14 lg:mt-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Discount Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage discount codes for products
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Discount
              </button>
              <button className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Discounts
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {discounts.filter((d) => d.status === "active").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {discounts.reduce((sum, d) => sum + d.usedCount, 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    discounts.filter((d) => {
                      const endDate = new Date(d.endDate);
                      const today = new Date();
                      const diffDays = Math.ceil(
                        (endDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return diffDays <= 7 && d.status === "active";
                    }).length
                  }
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Discount
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {discounts.length > 0
                    ? `${Math.round(discounts.filter((d) => d.type === "percentage").reduce((sum, d) => sum + d.value, 0) / discounts.filter((d) => d.type === "percentage").length)}%`
                    : "0%"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search discounts by name or code..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="upcoming">Upcoming</option>
              </select>

              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
          </div>

          {(searchTerm ||
            selectedStatus !== "all" ||
            selectedType !== "all") && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedType("all");
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
              <div className="text-sm text-gray-500 ml-auto">
                {filteredDiscounts.length} discounts found
              </div>
            </div>
          )}
        </div>

        {/* Discounts List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No discounts found</div>
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => (
                    <React.Fragment key={discount.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {discount.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {discount.code}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(discount.createdAt)} by{" "}
                              {discount.createdBy}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <TypeBadge
                            type={discount.type}
                            value={discount.value}
                          />
                          {discount.minimumPurchase > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Min. purchase: ${discount.minimumPurchase}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(discount.startDate)} -{" "}
                            {formatDate(discount.endDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {discount.products.length} products,{" "}
                            {discount.categories.length} categories
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {discount.usedCount} /{" "}
                                {discount.usageLimit || "∞"}
                              </div>
                              {discount.usageLimit && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                      width: `${calculateUsagePercentage(discount)}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={discount.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setExpandedDiscount(
                                  expandedDiscount === discount.id
                                    ? null
                                    : discount.id,
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title={
                                expandedDiscount === discount.id
                                  ? "Collapse"
                                  : "Expand"
                              }
                            >
                              {expandedDiscount === discount.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setupEditForm(discount)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateDiscount(discount)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDiscount(discount.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedDiscount === discount.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Applied Products
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {discount.products.map((productId) => {
                                    const product = products.find(
                                      (p) => p.id === productId,
                                    );
                                    return product ? (
                                      <span
                                        key={productId}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                      >
                                        <Package className="w-3 h-3" />
                                        {product.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Applied Categories
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {discount.categories.map((categoryId) => {
                                    const category = categories.find(
                                      (c) => c.id === categoryId,
                                    );
                                    return category ? (
                                      <span
                                        key={categoryId}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                      >
                                        <Tag className="w-3 h-3" />
                                        {category.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-500">
                                    Maximum Discount
                                  </div>
                                  <div className="font-medium">
                                    {discount.maximumDiscount
                                      ? `$${discount.maximumDiscount}`
                                      : "No limit"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">
                                    Remaining Uses
                                  </div>
                                  <div className="font-medium">
                                    {discount.usageLimit
                                      ? discount.usageLimit - discount.usedCount
                                      : "Unlimited"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Discount
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., Summer Sale 2024"
                      value={newDiscount.name}
                      onChange={(e) =>
                        setNewDiscount({ ...newDiscount, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                        placeholder="e.g., SUMMER24"
                        value={newDiscount.code}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                      />
                      <button
                        onClick={generateCode}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDiscount.type}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {newDiscount.type !== "free_shipping" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <div className="relative">
                        {newDiscount.type === "percentage" ? (
                          <>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="e.g., 20"
                              value={newDiscount.value}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  value: parseFloat(e.target.value),
                                })
                              }
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              %
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              $
                            </div>
                            <input
                              type="number"
                              min="1"
                              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="e.g., 25"
                              value={newDiscount.value}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  value: parseFloat(e.target.value),
                                })
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Purchase ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0"
                      value={newDiscount.minimumPurchase}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          minimumPurchase: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  {newDiscount.type === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="No limit"
                        value={newDiscount.maximumDiscount || ""}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            maximumDiscount:
                              parseFloat(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Unlimited"
                      value={newDiscount.usageLimit || ""}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          usageLimit: parseFloat(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDiscount.startDate}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newDiscount.endDate}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Products
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectAllProducts}
                        onChange={toggleSelectAllProducts}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label
                        htmlFor="selectAll"
                        className="text-sm text-gray-600"
                      >
                        Select All Products
                      </label>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="mb-4">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                            selectedCategoryIds.includes(category.id)
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {category.name}
                          <span className="text-xs opacity-75">
                            ({category.productCount})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                            selectedProductIds.includes(product.id)
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleProductSelect(product.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              SKU: {product.sku} | Category: {product.category}{" "}
                              | Price: ${product.price}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {product.stock}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {selectedProductIds.length} products,{" "}
                    {selectedCategoryIds.length} categories
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newDiscount.status}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDiscount}
                    disabled={!newDiscount.name || !newDiscount.code}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Discount
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {showEditModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Discount
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Similar form structure as create modal */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={selectedDiscount.name}
                      onChange={(e) =>
                        setSelectedDiscount({
                          ...selectedDiscount,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Code *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                      value={selectedDiscount.code}
                      onChange={(e) =>
                        setSelectedDiscount({
                          ...selectedDiscount,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Product Selection Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Products ({selectedProductIds.length})
                    </label>
                  </div>

                  {/* Selected Products List */}
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto mb-4">
                    {selectedProductIds.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No products selected
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedProductIds.map((productId) => {
                          const product = products.find(
                            (p) => p.id === productId,
                          );
                          return product ? (
                            <div
                              key={productId}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-sm">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  SKU: {product.sku}
                                </div>
                              </div>
                              <button
                                onClick={() => handleProductSelect(productId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Product Selection */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products to add..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredProducts
                        .filter((p) => !selectedProductIds.includes(p.id))
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => handleProductSelect(product.id)}
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => {}}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                SKU: {product.sku} | Price: ${product.price}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditDiscount}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscountsPage;
