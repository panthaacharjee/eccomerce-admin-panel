"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  User,
  Activity,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllUsersFail, GetAllUsersRequest, GetAllUsersSuccess } from "@/redux/reducers/userReducer";
import Axios from "@/components/Axios";
import { RootState } from "@/redux/rootReducer";

// Status options for filter
const statusOptions = ["All Status", "Active", "Inactive", "Banned"];

// Customer type options for filter
const customerTypeOptions = ["All Types", "Regular", "VIP", "Premium", "New"];

export default function CustomerPage() {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.user);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");
  const [minOrders, setMinOrders] = useState("");
  const [maxSpent, setMaxSpent] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);

  // Helper function to determine customer type based on orders and spending
  const getCustomerTypeFromOrders = (totalOrders: number, totalSpent: number): string => {
    if (totalSpent > 5000) return "VIP";
    if (totalSpent > 2000) return "Premium";
    if (totalOrders === 0) return "New";
    return "Regular";
  };

  const getAllUsers = async () => {
    setIsLoading(true);
    try {
      dispatch(GetAllUsersRequest());
      const { data } = await Axios.get("/get/users");
      dispatch(GetAllUsersSuccess(data));
    } catch (error: any) {
      console.error("Error fetching users:", error);
      dispatch(GetAllUsersFail(error.response?.data?.message || "Failed to fetch users"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Transform user data to match the table structure
  const transformedCustomers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.map((user: any) => {
      // Safely get orders array
      const orders = user.orders || [];
      const totalOrders = orders.length;

      // Calculate total spent - handle different order amount field names
      const totalSpent = orders.reduce((sum: number, order: any) => {
        const orderAmount = order.totalAmount || order.total || order.orderTotal || order.amount || 0;
        return sum + (typeof orderAmount === 'number' ? orderAmount : parseFloat(orderAmount) || 0);
      }, 0);

      // Get last purchase date
      let lastPurchase = null;
      if (orders.length > 0) {
        const lastOrder = orders[orders.length - 1];
        lastPurchase = lastOrder.orderDate || lastOrder.createdAt || lastOrder.date;
      }

      // Get user status
      let status = "Active";
      if (user.role === "banned") status = "Banned";
      else if (user.status === "inactive" || user.role === "inactive") status = "Inactive";

      // Get user name
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const displayName = userName || user.email?.split('@')[0] || 'Unknown User';

      // Get phone number
      const phoneNumber = user.addresses?.[0]?.phoneNumber || user.phone || "Not provided";

      // Get location
      let location = "Not provided";
      if (user.addresses?.[0]) {
        const city = user.addresses[0].city || '';
        const country = user.addresses[0].country || '';
        location = [city, country].filter(Boolean).join(', ') || "Not provided";
      }

      return {
        id: user._id,
        name: displayName,
        email: user.email || '',
        phone: phoneNumber,
        location: location,
        joinDate: user.createdAt || new Date().toISOString(),
        lastPurchase: lastPurchase,
        status: status,
        totalOrders: totalOrders,
        totalSpent: totalSpent.toFixed(2),
        avgOrderValue: totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : "0.00",
        avatar: user.image?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`,
        customerType: getCustomerTypeFromOrders(totalOrders, totalSpent),
        addresses: user.addresses || [],
        orders: orders,
      };
    });
  }, [users]);

  // Filter customers based on criteria
  const filteredCustomers = useMemo(() => {
    return transformedCustomers.filter((customer) => {
      // Search filter
      if (
        searchQuery &&
        !customer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !customer.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        selectedStatus !== "All Status" &&
        customer.status !== selectedStatus
      ) {
        return false;
      }

      // Customer type filter
      if (
        selectedType !== "All Types" &&
        customer.customerType !== selectedType
      ) {
        return false;
      }

      // Min orders filter
      if (minOrders && customer.totalOrders < parseInt(minOrders)) return false;

      // Max spent filter
      if (maxSpent && parseFloat(customer.totalSpent) > parseFloat(maxSpent))
        return false;

      return true;
    });
  }, [
    transformedCustomers,
    searchQuery,
    selectedStatus,
    selectedType,
    minOrders,
    maxSpent,
  ]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "orders-asc":
        return sorted.sort((a, b) => a.totalOrders - b.totalOrders);
      case "orders-desc":
        return sorted.sort((a, b) => b.totalOrders - a.totalOrders);
      case "spent-asc":
        return sorted.sort(
          (a, b) => parseFloat(a.totalSpent) - parseFloat(b.totalSpent),
        );
      case "spent-desc":
        return sorted.sort(
          (a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent),
        );
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
        );
      default:
        return sorted;
    }
  }, [filteredCustomers, sortBy]);

  // Calculate customer statistics
  const customerStats = useMemo(() => {
    const activeCustomers = transformedCustomers.filter(
      (c) => c.status === "Active",
    ).length;
    const totalRevenue = transformedCustomers.reduce(
      (sum, customer) => sum + parseFloat(customer.totalSpent),
      0,
    );
    const totalOrders = transformedCustomers.reduce(
      (sum, customer) => sum + customer.totalOrders,
      0,
    );
    const avgCustomerValue =
      transformedCustomers.length > 0 ? totalRevenue / transformedCustomers.length : 0;

    return {
      totalCustomers: transformedCustomers.length,
      activeCustomers,
      totalRevenue,
      totalOrders,
      avgCustomerValue,
    };
  }, [transformedCustomers]);

  // Pagination calculations
  const totalItems = sortedCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle select all customers
  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map((c) => c.id));
    }
  };

  // Handle select single customer
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id],
    );
  };

  // Handle delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        setIsLoading(true);
        await Axios.delete(`/delete/user/${id}`);
        await getAllUsers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Failed to delete customer");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle delete selected customers
  const handleDeleteSelected = async () => {
    if (selectedCustomers.length === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedCustomers.length} selected customer(s)?`,
      )
    ) {
      try {
        setIsLoading(true);
        await Promise.all(
          selectedCustomers.map(id => Axios.delete(`/delete/user/${id}`))
        );
        await getAllUsers();
        setSelectedCustomers([]);
      } catch (error) {
        console.error("Error deleting customers:", error);
        alert("Failed to delete customers");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All Status");
    setSelectedType("All Types");
    setMinOrders("");
    setMaxSpent("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Handle view customer
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomerData(customer);
    setShowViewModal(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomerData(customer);
    setShowUpdateModal(true);
  };

  // Handle add customer
  const handleAddCustomer = () => {
    setShowAddModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      case "Banned":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Banned
          </span>
        );
      default:
        return null;
    }
  };

  // Get customer type badge
  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "VIP":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            VIP
          </span>
        );
      case "Premium":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Premium
          </span>
        );
      case "Regular":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Regular
          </span>
        );
      case "New":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            New
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Export customers to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Location",
      "Status",
      "Type",
      "Total Orders",
      "Total Spent",
      "Join Date",
      "Last Purchase"
    ];
    const csvContent = [
      headers.join(","),
      ...transformedCustomers.map((customer) =>
        [
          customer.id,
          `"${customer.name}"`,
          customer.email,
          customer.phone || "",
          customer.location,
          customer.status,
          customer.customerType,
          customer.totalOrders,
          customer.totalSpent,
          formatDate(customer.joinDate),
          customer.lastPurchase ? formatDate(customer.lastPurchase) : "No purchases"
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (isLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-18 lg:mt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage your customers, view purchase history and customer details
          </p>
        </div>
        
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customerStats.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Active Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customerStats.activeCustomers}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                {customerStats.totalCustomers > 0
                  ? ((customerStats.activeCustomers /
                    customerStats.totalCustomers) *
                    100).toFixed(1)
                  : "0"}
                % active rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${customerStats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Avg. Customer Value
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${customerStats.avgCustomerValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <User className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filter Toggle Button */}
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
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {customerTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orders Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Orders
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Minimum orders"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={minOrders}
                  onChange={(e) => {
                    setMinOrders(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Max Spent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Total Spent
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Maximum amount spent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={maxSpent}
                  onChange={(e) => {
                    setMaxSpent(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="orders-asc">Orders (Low to High)</option>
                  <option value="orders-desc">Orders (High to Low)</option>
                  <option value="spent-asc">Total Spent (Low to High)</option>
                  <option value="spent-desc">Total Spent (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
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

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={
                    selectedCustomers.length === paginatedCustomers.length &&
                    paginatedCustomers.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selectedCustomers.length} selected
                </span>
              </div>
              {selectedCustomers.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
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

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Purchase
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {formatDate(customer.joinDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-3 h-3 mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                        {customer.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getCustomerTypeBadge(customer.customerType)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                      {customer.totalOrders}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />$
                      {parseFloat(customer.totalSpent).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastPurchase ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(customer.lastPurchase)}
                      </div>
                    ) : (
                      <span className="text-gray-400">No purchases yet</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> customers
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

                {/* Page numbers */}
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
      </div>

      {/* Empty State */}
      {paginatedCustomers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No customers found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewModal && selectedCustomerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Customer info content */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCustomerData.avatar}
                    alt={selectedCustomerData.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomerData.name}</h3>
                    <p className="text-gray-500">{selectedCustomerData.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(selectedCustomerData.status)}
                      {getCustomerTypeBadge(selectedCustomerData.customerType)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCustomerData.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCustomerData.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCustomerData.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Order Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="text-sm font-semibold">{selectedCustomerData.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent:</span>
                        <span className="text-sm font-semibold">${selectedCustomerData.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Order Value:</span>
                        <span className="text-sm font-semibold">${selectedCustomerData.avgOrderValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Member Since:</span>
                        <span className="text-sm font-semibold">{formatDate(selectedCustomerData.joinDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCustomerData.orders && selectedCustomerData.orders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Order History</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Order ID</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedCustomerData.orders.map((order: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-2">{order.orderId || order._id}</td>
                              <td className="px-4 py-2">{formatDate(order.orderDate || order.createdAt)}</td>
                              <td className="px-4 py-2 text-right">${(order.totalAmount || order.total || 0).toFixed(2)}</td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {order.orderStatus || order.status || 'Completed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}