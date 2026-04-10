// app/admin/orders/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  TrendingUp,
  Truck,
  Clock,
  ShoppingCart,
  CreditCard,
  Calendar,
  Package,
  TruckIcon,
  X,
  Edit,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllOrderRequest, GetAllOrderSuccess, UpdateOrderStatusFail, UpdateOrderStatusRequest, UpdateOrderStatusSuccess } from "@/redux/reducers/orderReducer";
import Axios from "@/components/Axios";
import { Order, OrderItem } from "@/redux/interfaces/orderInterface";
import { RootState } from "@/redux/rootReducer";

// Status options for filter
const statusOptions = [
  "All Status",
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Payment options for filter
const paymentOptions = [
  "All Payments",
  "cod",
  "mobile",
  "bank",
];

// Shipping options for filter
const shippingOptions = ["All Shipping", "Standard", "Express", "Next Day"];

// Currency conversion rate (1 USD = 120 BDT - adjust as needed)
const USD_TO_BDT = 120;

// Helper function to format status for display
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};



// Helper function to format BDT currency
const formatBDT = (amount: number) => {
  return `৳${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Truck className="w-3 h-3 mr-1" />
          Shipped
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      );
    case "refunded":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Refunded
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {formatStatus(status)}
        </span>
      );
  }
};

// Get payment badge
const getPaymentBadge = (paymentMethod: string) => {
  switch (paymentMethod) {
    case "cod":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Cash on Delivery
        </span>
      );
    case "mobile":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Mobile Payment
        </span>
      );
    case "bank":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Bank Payment
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {paymentMethod}
        </span>
      );
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format short date
const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Status Update Modal Component
const StatusUpdateModal = ({
  order,
  onClose,
  onUpdate
}: {
  order: Order | null;
  onClose: () => void;
  onUpdate: (orderId: string, newStatus: string) => Promise<void>;
}) => {
  const dispatch = useDispatch();
  const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || "pending");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleSubmit = async () => {
    if (selectedStatus === order.orderStatus) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      dispatch(UpdateOrderStatusRequest());
      const {data}=  await Axios.put(`/order/${order.orderId}/status`, { status: selectedStatus });
      dispatch(UpdateOrderStatusSuccess(data));
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      dispatch(UpdateOrderStatusFail("Failed to update order status."));
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    pending: "bg-orange-100 text-orange-800 border-orange-200",
    processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-purple-100 text-purple-800 border-purple-200",
    shipped: "bg-blue-100 text-blue-800 border-blue-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Order ID:</span> {order.orderId}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Customer:</span> {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.orderStatus as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
              {formatStatus(order.orderStatus || "pending")}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedStatus}
              onChange={(e:any) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.filter(s => s !== "All Status").map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Order ID:</span> {order.orderId}</p>
                <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
                <p><span className="font-medium">Status:</span> {getStatusBadge(order.orderStatus || "pending")}</p>
                <p><span className="font-medium">Currency:</span> BDT</p>
                {order.trackingNumber && (
                  <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber}</p>
                )}
                {order.estimatedDelivery && (
                  <p><span className="font-medium">Est. Delivery:</span> {formatDate(order.estimatedDelivery)}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Payment Method:</span> {getPaymentBadge(order.paymentMethod.type)}</p>
                <p><span className="font-medium">Subtotal:</span> {formatBDT((order.subtotal))}</p>
                <p><span className="font-medium">Shipping Fee:</span> {formatBDT((order.shippingFee))}</p>
                <p><span className="font-medium">Tax:</span> {formatBDT((order.tax))}</p>
                <p><span className="font-medium text-lg font-bold">Total:</span> {formatBDT((order.total))}</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Name:</span> {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}</p>
                <p><span className="font-medium">Email:</span> {order.deliveryInfo.email}</p>
                <p><span className="font-medium">Phone:</span> {order.deliveryInfo.phone}</p>
              </div>
              <div>
                <p><span className="font-medium">Address:</span> {order.deliveryInfo.streetAddress}</p>
                {order.deliveryInfo.apartment && <p>{order.deliveryInfo.apartment}</p>}
                <p>{order.deliveryInfo.city}, {order.deliveryInfo.district}</p>
                <p>{order.deliveryInfo.country} - {order.deliveryInfo.postcode}</p>
              </div>
            </div>
          </div>

          {/* Billing Information (if different) */}
          {order.billingInfo && !order.billingInfo.sameAsDelivery && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Name:</span> {order.billingInfo.firstName} {order.billingInfo.lastName}</p>
                  <p><span className="font-medium">Email:</span> {order.billingInfo.email}</p>
                  <p><span className="font-medium">Phone:</span> {order.billingInfo.phone}</p>
                </div>
                <div>
                  <p><span className="font-medium">Address:</span> {order.billingInfo.streetAddress}</p>
                  {order.billingInfo.apartment && <p>{order.billingInfo.apartment}</p>}
                  <p>{order.billingInfo.city}, {order.billingInfo.district}</p>
                  <p>{order.billingInfo.postcode}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Method */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Method</h3>
            <div className="text-sm">
              <p><span className="font-medium">Method:</span> {order.shippingMethod.name}</p>
              <p><span className="font-medium">Description:</span> {order.shippingMethod.description}</p>
              <p><span className="font-medium">Estimated Delivery:</span> {order.shippingMethod.estimatedDelivery}</p>
              <p><span className="font-medium">Fee:</span> {formatBDT((order.shippingMethod.fee))}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Price</th>
                    <th className="px-3 py-2 text-left">Quantity</th>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item: OrderItem) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="ml-3 font-medium">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">{formatBDT((item.price))}</td>
                      <td className="px-3 py-3">{item.quantity}</td>
                      <td className="px-3 py-3">{item.selectedSize || "-"}</td>
                      <td className="px-3 py-3 font-medium">{formatBDT((item.total))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right font-medium">Subtotal:</td>
                    <td className="px-3 py-2 font-medium">{formatBDT((order.subtotal))}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right font-medium">Shipping:</td>
                    <td className="px-3 py-2">{formatBDT((order.shippingFee))}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right font-medium">Tax:</td>
                    <td className="px-3 py-2">{formatBDT((order.tax))}</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={4} className="px-3 py-2 text-right font-bold">Total:</td>
                    <td className="px-3 py-2 font-bold text-lg">{formatBDT((order.total))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.order);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedPayment, setSelectedPayment] = useState("All Payments");
  const [selectedShipping, setSelectedShipping] = useState("All Shipping");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [selectedOrderForStatusUpdate, setSelectedOrderForStatusUpdate] = useState<Order | null>(null);

  const getAllOrders = async () => {
    try {
      setIsLoading(true);
      dispatch(GetAllOrderRequest());
      const { data } = await Axios.get("/admin/orders");
      console.log("Fetched orders data:", data);
      dispatch(GetAllOrderSuccess(data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await Axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      await getAllOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  // Calculate current month orders
  const currentMonthOrders = useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return orders.filter((order: Order) => {
      const orderDate = new Date(order.orderDate);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });
  }, [orders]);

  // Calculate orders shipping today
  const shippingTodayOrders = useMemo(() => {
    if (!orders) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter((order: Order) => {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);

      const isToday = orderDate.getTime() === today.getTime();
      const isShippable =
        order.orderStatus === "shipped" || order.orderStatus === "processing";

      return isToday && isShippable;
    });
  }, [orders]);

  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order: Order) => {
      // Search filter
      if (
        searchQuery &&
        !order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.deliveryInfo.firstName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !order.deliveryInfo.lastName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !order.deliveryInfo.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "All Status" && order.orderStatus !== selectedStatus) {
        return false;
      }

      // Payment filter
      if (
        selectedPayment !== "All Payments" &&
        order.paymentMethod.type !== selectedPayment
      ) {
        return false;
      }

      // Shipping filter
      if (
        selectedShipping !== "All Shipping" &&
        order.shippingMethod.name !== selectedShipping
      ) {
        return false;
      }

      // Amount range filter (converted to USD for comparison)
      if (minAmount && (order.total) < parseFloat(minAmount)) return false;
      if (maxAmount && (order.total) > parseFloat(maxAmount)) return false;

      return true;
    });
  }, [
    orders,
    searchQuery,
    selectedStatus,
    selectedPayment,
    selectedShipping,
    minAmount,
    maxAmount,
  ]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    switch (sortBy) {
      case "amount-asc":
        return sorted.sort((a, b) => a.total - b.total);
      case "amount-desc":
        return sorted.sort((a, b) => b.total - a.total);
      case "date-asc":
        return sorted.sort(
          (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
      case "date-desc":
        return sorted.sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      case "items-asc":
        return sorted.sort((a, b) => a.items.length - b.items.length);
      case "items-desc":
        return sorted.sort((a, b) => b.items.length - a.items.length);
      case "id-asc":
        return sorted.sort((a, b) => a.orderId.localeCompare(b.orderId));
      case "id-desc":
        return sorted.sort((a, b) => b.orderId.localeCompare(a.orderId));
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
      default:
        return sorted;
    }
  }, [filteredOrders, sortBy]);

  // Calculate statistics (in BDT)
  const totalRevenueBDT = useMemo(() => {
    if (!orders) return 0;
    return orders.reduce((sum: any, order: any) => sum + (order.total), 0);
  }, [orders]);

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(
    (order: Order) => order.orderStatus === "pending"
  ).length || 0;
  const processingOrders = orders?.filter(
    (order: Order) => order.orderStatus === "processing"
  ).length || 0;
  const deliveredOrders = orders?.filter(
    (order: Order) => order.orderStatus === "delivered"
  ).length || 0;

  // Pagination calculations
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle select all orders
  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.orderId));
    }
  };

  // Handle select single order
  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id]
    );
  };

  // Handle delete order
  const handleDeleteOrder = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await Axios.delete(`/admin/orders/${id}`);
        getAllOrders(); // Refresh orders after deletion
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  // Handle delete selected orders
  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedOrders.length} selected order(s)?`
      )
    ) {
      try {
        await Promise.all(
          selectedOrders.map((id) => Axios.delete(`/admin/orders/${id}`))
        );
        getAllOrders(); // Refresh orders after deletion
        setSelectedOrders([]);
      } catch (error) {
        console.error("Error deleting orders:", error);
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All Status");
    setSelectedPayment("All Payments");
    setSelectedShipping("All Shipping");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Open order details modal
  const handleViewOrder = (order: Order) => {
    setSelectedOrderForModal(order);
  };

  // Open status update modal
  const handleOpenStatusUpdate = (order: Order) => {
    setSelectedOrderForStatusUpdate(order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all customer orders
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalOrders}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">
                All time orders
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Monthly Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currentMonthOrders.length}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                This month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingOrders}
              </p>
              <p className="text-xs text-orange-600 font-medium mt-1">
                Needs attention
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Delivered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {deliveredOrders}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}% success rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Processing Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Processing Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {processingOrders}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Ready for shipping
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Shipping Today */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Shipping Today
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {shippingTodayOrders.length}
              </p>
              <p className="text-xs text-orange-600 font-medium mt-1">
                Schedule pickup
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatBDT(totalRevenueBDT)}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time revenue
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Average Order Value
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatBDT(totalOrders > 0 ? (totalRevenueBDT / totalOrders) : 0)}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Per order average
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
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
              placeholder="Search orders by ID, customer name, or email..."
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
                  Order Status
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
                      {status === "All Status" ? status : formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedPayment}
                  onChange={(e) => {
                    setSelectedPayment(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {paymentOptions.map((payment) => (
                    <option key={payment} value={payment}>
                      {payment === "All Payments" ? payment : payment.charAt(0).toUpperCase() + payment.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedShipping}
                  onChange={(e) => {
                    setSelectedShipping(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {shippingOptions.map((shipping) => (
                    <option key={shipping} value={shipping}>
                      {shipping}
                    </option>
                  ))}
                </select>
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
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                  <option value="date-desc">Date (New to Old)</option>
                  <option value="date-asc">Date (Old to New)</option>
                  <option value="items-desc">Items (High to Low)</option>
                  <option value="items-asc">Items (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Amount Range */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range (BDT)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Amount"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <input
                  type="number"
                  placeholder="Max Amount"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                />
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

      {/* Orders Table */}
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
                    selectedOrders.length === paginatedOrders.length &&
                    paginatedOrders.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selectedOrders.length} selected
                </span>
              </div>
              {selectedOrders.length > 0 && (
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

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.orderId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedOrders.includes(order.orderId)}
                      onChange={() => handleSelectOrder(order.orderId)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderId}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatShortDate(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {order.deliveryInfo.firstName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.deliveryInfo.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatBDT((order.total))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getPaymentBadge(order.paymentMethod.type)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(order.orderStatus || "pending")}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                      {order.shippingMethod.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenStatusUpdate(order)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                        onClick={() => handleDeleteOrder(order.orderId)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                of <span className="font-medium">{totalItems}</span> orders
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Items per page info */}
              <div className="hidden sm:block text-sm text-gray-700">
                Orders per page:{" "}
                <select
                  className="ml-1 border-0 bg-transparent text-sm font-medium focus:ring-0 focus:outline-none"
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
              </div>

              {/* Pagination controls */}
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
      {paginatedOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
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

      {/* Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}

      {/* Status Update Modal */}
      {selectedOrderForStatusUpdate && (
        <StatusUpdateModal
          order={selectedOrderForStatusUpdate}
          onClose={() => setSelectedOrderForStatusUpdate(null)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}