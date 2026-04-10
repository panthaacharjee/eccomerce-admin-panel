"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Mail,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  CheckSquare,
  Square,
  MoreVertical,
  Download,
  Settings,
  RefreshCw,
} from "lucide-react";

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info" | "order" | "payment" | "user";
  category: "system" | "order" | "payment" | "user" | "inventory" | "marketing";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  timestamp: string;
  sender?: string;
  relatedId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  highPriority: number;
  byCategory: Record<string, number>;
}

// Mock data
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Order Received",
    message: "Order #ORD-2024-001 has been placed by John Smith",
    type: "order",
    category: "order",
    priority: "high",
    read: false,
    timestamp: "2024-01-15 14:30:00",
    sender: "System",
    relatedId: "ORD-2024-001",
    actionUrl: "/admin/orders/ORD-2024-001",
    metadata: { orderAmount: 299.99, customerEmail: "john@example.com" },
  },
  {
    id: "2",
    title: "Payment Successful",
    message: "Payment of $299.99 for Order #ORD-2024-001 has been processed",
    type: "payment",
    category: "payment",
    priority: "medium",
    read: false,
    timestamp: "2024-01-15 14:35:00",
    sender: "Payment Gateway",
    relatedId: "TXN-001",
    actionUrl: "/admin/payments/TXN-001",
  },
  {
    id: "3",
    title: "Low Stock Alert",
    message: "Wireless Earbuds Pro is running low (5 items left)",
    type: "warning",
    category: "inventory",
    priority: "high",
    read: true,
    timestamp: "2024-01-15 10:15:00",
    sender: "Inventory System",
    relatedId: "PROD-001",
    actionUrl: "/admin/inventory/PROD-001",
    metadata: {
      productName: "Wireless Earbuds Pro",
      currentStock: 5,
      minStock: 10,
    },
  },
  {
    id: "4",
    title: "New User Registration",
    message: "Alice Johnson has registered as a new customer",
    type: "user",
    category: "user",
    priority: "low",
    read: true,
    timestamp: "2024-01-14 16:45:00",
    sender: "User System",
    relatedId: "USR-001",
    actionUrl: "/admin/users/USR-001",
    metadata: { email: "alice@example.com", registrationMethod: "email" },
  },
  {
    id: "5",
    title: "System Update Available",
    message: "A new system update (v2.5.0) is ready to install",
    type: "info",
    category: "system",
    priority: "medium",
    read: false,
    timestamp: "2024-01-14 09:20:00",
    sender: "Admin Panel",
    actionUrl: "/admin/settings/updates",
  },
  {
    id: "6",
    title: "Order Shipped",
    message: "Order #ORD-2023-999 has been shipped to customer",
    type: "success",
    category: "order",
    priority: "medium",
    read: true,
    timestamp: "2024-01-13 11:30:00",
    sender: "Shipping Service",
    relatedId: "ORD-2023-999",
    actionUrl: "/admin/orders/ORD-2023-999",
  },
  {
    id: "7",
    title: "Failed Payment",
    message: "Payment for Order #ORD-2024-002 failed to process",
    type: "error",
    category: "payment",
    priority: "urgent",
    read: false,
    timestamp: "2024-01-13 09:15:00",
    sender: "Payment Gateway",
    relatedId: "ORD-2024-002",
    actionUrl: "/admin/payments/failed",
    metadata: { errorCode: "INSUFFICIENT_FUNDS", retryCount: 2 },
  },
  {
    id: "8",
    title: "Marketing Campaign Started",
    message: "Summer Sale 2024 campaign has been activated",
    type: "info",
    category: "marketing",
    priority: "low",
    read: true,
    timestamp: "2024-01-12 15:45:00",
    sender: "Marketing System",
    actionUrl: "/admin/marketing/campaigns",
  },
  {
    id: "9",
    title: "Customer Support Ticket",
    message: "New support ticket #TICKET-001 from Sarah Davis",
    type: "warning",
    category: "user",
    priority: "high",
    read: false,
    timestamp: "2024-01-12 12:30:00",
    sender: "Support System",
    relatedId: "TICKET-001",
    actionUrl: "/admin/support/TICKET-001",
  },
  {
    id: "10",
    title: "Monthly Report Ready",
    message: "December 2023 sales report is now available",
    type: "info",
    category: "system",
    priority: "low",
    read: true,
    timestamp: "2024-01-11 09:15:00",
    sender: "Reporting System",
    actionUrl: "/admin/reports/monthly",
  },
  {
    id: "11",
    title: "Subscription Renewal",
    message: "Professional Plan subscription renewed for Tech Corp",
    type: "success",
    category: "payment",
    priority: "medium",
    read: true,
    timestamp: "2024-01-10 16:20:00",
    sender: "Billing System",
    relatedId: "SUB-001",
    actionUrl: "/admin/subscriptions/SUB-001",
    metadata: { amount: 199.99, plan: "Professional", company: "Tech Corp" },
  },
  {
    id: "12",
    title: "Backup Completed",
    message: "Daily system backup completed successfully",
    type: "success",
    category: "system",
    priority: "low",
    read: true,
    timestamp: "2024-01-10 14:10:00",
    sender: "Backup System",
  },
];

const AdminNotificationsPage: React.FC = () => {
  // State management
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [filteredNotifications, setFilteredNotifications] =
    useState<Notification[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showRead, setShowRead] = useState(true);
  const [showUnread, setShowUnread] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    highPriority: 0,
    byCategory: {},
  });

  // Calculate stats
  useEffect(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;

    const today = new Date().toDateString();
    const todayNotifications = notifications.filter(
      (n) => new Date(n.timestamp).toDateString() === today,
    ).length;

    const highPriority = notifications.filter(
      (n) => n.priority === "high" || n.priority === "urgent",
    ).length;

    const byCategory: Record<string, number> = {};
    notifications.forEach((n) => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    });

    setStats({
      total,
      unread,
      today: todayNotifications,
      highPriority,
      byCategory,
    });
  }, [notifications]);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (n.sender &&
            n.sender.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter((n) => n.priority === selectedPriority);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((n) => n.type === selectedType);
    }

    // Read/unread filter
    if (!showRead || !showUnread) {
      if (showRead && !showUnread) {
        filtered = filtered.filter((n) => n.read);
      } else if (!showRead && showUnread) {
        filtered = filtered.filter((n) => !n.read);
      }
    }

    setFilteredNotifications(filtered);
  }, [
    searchTerm,
    selectedCategory,
    selectedPriority,
    selectedType,
    showRead,
    showUnread,
    notifications,
  ]);

  // Type badge component
  const TypeBadge: React.FC<{ type: Notification["type"] }> = ({ type }) => {
    const config = {
      success: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      warning: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: <AlertTriangle className="w-4 h-4" />,
      },
      error: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      info: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <Info className="w-4 h-4" />,
      },
      order: {
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      payment: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: <DollarSign className="w-4 h-4" />,
      },
      user: {
        color: "bg-indigo-100 text-indigo-800 border border-indigo-200",
        icon: <Users className="w-4 h-4" />,
      },
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config[type].color}`}
      >
        {config[type].icon}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: Notification["priority"] }> = ({
    priority,
  }) => {
    const config = {
      low: {
        color: "bg-gray-100 text-gray-800",
        label: "Low",
      },
      medium: {
        color: "bg-blue-100 text-blue-800",
        label: "Medium",
      },
      high: {
        color: "bg-yellow-100 text-yellow-800",
        label: "High",
      },
      urgent: {
        color: "bg-red-100 text-red-800",
        label: "Urgent",
      },
    };

    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config[priority].color}`}
      >
        {config[priority].label}
      </span>
    );
  };

  // Category icon component
  const CategoryIcon: React.FC<{ category: Notification["category"] }> = ({
    category,
  }) => {
    const config = {
      system: <Settings className="w-5 h-5 text-gray-600" />,
      order: <ShoppingCart className="w-5 h-5 text-purple-600" />,
      payment: <DollarSign className="w-5 h-5 text-emerald-600" />,
      user: <Users className="w-5 h-5 text-indigo-600" />,
      inventory: <Package className="w-5 h-5 text-amber-600" />,
      marketing: <MessageSquare className="w-5 h-5 text-pink-600" />,
    };

    return config[category] || <Bell className="w-5 h-5 text-gray-600" />;
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format full date
  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mark as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // Remove from selected if it's there
    setSelectedNotifications(selectedNotifications.filter((nId) => nId !== id));
  };

  // Mark as unread
  const markAsUnread = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setSelectedNotifications([]);
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    setSelectedNotifications(selectedNotifications.filter((nId) => nId !== id));
  };

  // Delete selected notifications
  const deleteSelected = () => {
    if (selectedNotifications.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`,
      )
    ) {
      setNotifications(
        notifications.filter((n) => !selectedNotifications.includes(n.id)),
      );
      setSelectedNotifications([]);
    }
  };

  // Archive selected notifications
  const archiveSelected = () => {
    // In a real app, this would move notifications to archive
    setNotifications(
      notifications.filter((n) => !selectedNotifications.includes(n.id)),
    );
    setSelectedNotifications([]);
  };

  // Mark selected as read
  const markSelectedAsRead = () => {
    setNotifications(
      notifications.map((n) =>
        selectedNotifications.includes(n.id) ? { ...n, read: true } : n,
      ),
    );
    setSelectedNotifications([]);
  };

  // Mark selected as unread
  const markSelectedAsUnread = () => {
    setNotifications(
      notifications.map((n) =>
        selectedNotifications.includes(n.id) ? { ...n, read: false } : n,
      ),
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle single selection
  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((nId) => nId !== id),
      );
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Clear all notifications
  const clearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      setSelectedNotifications([]);
    }
  };

  // Refresh notifications (simulate new notifications)
  const refreshNotifications = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: "System Notification",
      message: "This is a new test notification",
      type: "info",
      category: "system",
      priority: "medium",
      read: false,
      timestamp: new Date().toISOString(),
      sender: "System",
    };

    setNotifications([newNotification, ...notifications]);
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // In a real app, you would navigate to the action URL
    if (notification.actionUrl) {
      console.log(`Navigating to: ${notification.actionUrl}`);
      // router.push(notification.actionUrl);
    }
  };

  // Export notifications
  const exportNotifications = () => {
    const csv = [
      [
        "ID",
        "Title",
        "Message",
        "Type",
        "Category",
        "Priority",
        "Read",
        "Timestamp",
        "Sender",
        "Related ID",
      ],
      ...filteredNotifications.map((n) => [
        n.id,
        n.title,
        n.message,
        n.type,
        n.category,
        n.priority,
        n.read ? "Yes" : "No",
        n.timestamp,
        n.sender || "",
        n.relatedId || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notifications_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 mt-14 lg:mt-0 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all system notifications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshNotifications}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All as Read
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
                  Total Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.unread}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                {stats.total > 0
                  ? `${Math.round((stats.unread / stats.total) * 100)}% of total`
                  : "No notifications"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.today}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                Notifications received today
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.highPriority}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                Requires immediate attention
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications by title, message, or sender..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="order">Orders</option>
                <option value="payment">Payments</option>
                <option value="user">Users</option>
                <option value="inventory">Inventory</option>
                <option value="marketing">Marketing</option>
              </select>

              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
                <option value="order">Order</option>
                <option value="payment">Payment</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-700">Status:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnread}
                    onChange={(e) => setShowUnread(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Unread</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRead}
                    onChange={(e) => setShowRead(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Read</span>
                </label>
              </div>

              <div className="text-sm text-gray-500">
                {filteredNotifications.length} notifications found
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(selectedCategory !== "all" ||
                selectedPriority !== "all" ||
                selectedType !== "all" ||
                searchTerm ||
                !showRead ||
                !showUnread) && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPriority("all");
                    setSelectedType("all");
                    setSearchTerm("");
                    setShowRead(true);
                    setShowUnread(true);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedNotifications.length} notification(s) selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={markSelectedAsRead}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Read
                  </button>
                  <button
                    onClick={markSelectedAsUnread}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Mark as Unread
                  </button>
                  <button
                    onClick={archiveSelected}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Header */}
              <div className="px-6 py-3 bg-gray-50 flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {selectAll ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notifications
                </div>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id,
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectNotification(notification.id);
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Category Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CategoryIcon category={notification.category} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <TypeBadge type={notification.type} />
                            <PriorityBadge priority={notification.priority} />
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.sender && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notification.sender}
                              </span>
                            )}
                            {notification.relatedId && (
                              <span className="text-blue-600">
                                #{notification.relatedId}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsUnread(notification.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Mark as unread"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show more actions
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      {notification.metadata &&
                        Object.keys(notification.metadata).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">
                              Details:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(notification.metadata).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Statistics */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => {
              const categoryNotifications = notifications.filter(
                (n) => n.category === category,
              );
              const unreadCount = categoryNotifications.filter(
                (n) => !n.read,
              ).length;

              return (
                <div
                  key={category}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CategoryIcon category={category as any} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {category}
                        </div>
                        <div className="text-sm text-gray-500">
                          {count} notifications
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {count}
                      </div>
                      {unreadCount > 0 && (
                        <div className="text-xs text-red-600">
                          {unreadCount} unread
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportNotifications}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                Export Notifications
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Download all notifications as CSV
            </div>
          </button>

          <button
            onClick={() => {
              // Navigate to notification settings
            }}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                Notification Settings
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Configure notification preferences
            </div>
          </button>

          <button
            onClick={clearAll}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Clear All</div>
            </div>
            <div className="text-sm text-gray-500">
              Remove all notifications permanently
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
