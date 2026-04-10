"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Eye,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

// Types
interface PaymentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: "approved" | "pending" | "rejected" | "refunded";
  paymentMethod: "cash" | "credit_card" | "paypal" | "stripe" | "bank_transfer";
  transactionId: string;
  date: string;
  last4?: string;
  invoiceId?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

interface PaymentStats {
  totalCashPayment: number;
  totalOnlinePayment: number;
  totalNotApprovedPayment: number;
  approvedPayment: number;
  totalTransactions: number;
  pendingApproval: number;
}

// Mock data
const initialTransactions: PaymentTransaction[] = [
  {
    id: "1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    amount: 299.99,
    currency: "USD",
    status: "approved",
    paymentMethod: "cash",
    transactionId: "CASH_001",
    date: "2024-01-15 14:30:00",
    invoiceId: "INV-2024-001",
    approvedBy: "Admin User",
    approvedAt: "2024-01-15 14:35:00",
  },
  {
    id: "2",
    customerName: "Alice Johnson",
    customerEmail: "alice@example.com",
    amount: 150.0,
    currency: "USD",
    status: "pending",
    paymentMethod: "credit_card",
    transactionId: "CC_002",
    date: "2024-01-15 10:15:00",
    last4: "4242",
    invoiceId: "INV-2024-002",
  },
  {
    id: "3",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    amount: 499.99,
    currency: "USD",
    status: "rejected",
    paymentMethod: "paypal",
    transactionId: "PP_003",
    date: "2024-01-14 16:45:00",
    invoiceId: "INV-2024-003",
    notes: "Payment verification failed",
  },
  {
    id: "4",
    customerName: "Sarah Davis",
    customerEmail: "sarah@example.com",
    amount: 89.99,
    currency: "USD",
    status: "approved",
    paymentMethod: "stripe",
    transactionId: "STR_004",
    date: "2024-01-14 09:20:00",
    invoiceId: "INV-2024-004",
    approvedBy: "Admin User",
    approvedAt: "2024-01-14 09:25:00",
  },
  {
    id: "5",
    customerName: "Mike Brown",
    customerEmail: "mike@example.com",
    amount: 250.0,
    currency: "USD",
    status: "approved",
    paymentMethod: "bank_transfer",
    transactionId: "BT_005",
    date: "2024-01-13 11:30:00",
    invoiceId: "INV-2024-005",
    approvedBy: "Admin User",
    approvedAt: "2024-01-13 11:35:00",
  },
  {
    id: "6",
    customerName: "Emma Wilson",
    customerEmail: "emma@example.com",
    amount: 199.99,
    currency: "USD",
    status: "pending",
    paymentMethod: "cash",
    transactionId: "CASH_006",
    date: "2024-01-12 15:45:00",
    invoiceId: "INV-2024-006",
  },
  {
    id: "7",
    customerName: "David Lee",
    customerEmail: "david@example.com",
    amount: 350.0,
    currency: "USD",
    status: "approved",
    paymentMethod: "credit_card",
    transactionId: "CC_007",
    date: "2024-01-12 12:30:00",
    last4: "1881",
    invoiceId: "INV-2024-007",
    approvedBy: "Admin User",
    approvedAt: "2024-01-12 12:35:00",
  },
  {
    id: "8",
    customerName: "Lisa Wang",
    customerEmail: "lisa@example.com",
    amount: 120.0,
    currency: "USD",
    status: "rejected",
    paymentMethod: "cash",
    transactionId: "CASH_008",
    date: "2024-01-11 09:15:00",
    invoiceId: "INV-2024-008",
    notes: "Insufficient documentation",
  },
  {
    id: "9",
    customerName: "Tom Harris",
    customerEmail: "tom@example.com",
    amount: 450.0,
    currency: "USD",
    status: "pending",
    paymentMethod: "paypal",
    transactionId: "PP_009",
    date: "2024-01-10 16:20:00",
    invoiceId: "INV-2024-009",
  },
  {
    id: "10",
    customerName: "Sophia Martinez",
    customerEmail: "sophia@example.com",
    amount: 299.99,
    currency: "USD",
    status: "approved",
    paymentMethod: "stripe",
    transactionId: "STR_010",
    date: "2024-01-10 14:10:00",
    invoiceId: "INV-2024-010",
    approvedBy: "Admin User",
    approvedAt: "2024-01-10 14:15:00",
  },
];

const ITEMS_PER_PAGE = 5;

const AdminPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] =
    useState<PaymentTransaction[]>(initialTransactions);
  const [filteredTransactions, setFilteredTransactions] =
    useState<PaymentTransaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<PaymentStats>({
    totalCashPayment: 0,
    totalOnlinePayment: 0,
    totalNotApprovedPayment: 0,
    approvedPayment: 0,
    totalTransactions: 0,
    pendingApproval: 0,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Calculate stats
  useEffect(() => {
    const calculateStats = () => {
      const totalCashPayment = transactions
        .filter((tx) => tx.paymentMethod === "cash" && tx.status === "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalOnlinePayment = transactions
        .filter((tx) => tx.paymentMethod !== "cash" && tx.status === "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalNotApprovedPayment = transactions
        .filter((tx) => tx.status !== "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const approvedPayment = transactions
        .filter((tx) => tx.status === "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const pendingApproval = transactions.filter(
        (tx) => tx.status === "pending",
      ).length;

      setStats({
        totalCashPayment,
        totalOnlinePayment,
        totalNotApprovedPayment,
        approvedPayment,
        totalTransactions: transactions.length,
        pendingApproval,
      });
    };

    calculateStats();
  }, [transactions]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.invoiceId &&
            tx.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tx) => tx.status === selectedStatus);
    }

    // Payment method filter
    if (selectedMethod !== "all") {
      filtered = filtered.filter((tx) => tx.paymentMethod === selectedMethod);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date.split(" ")[0]).getTime();
        const start = new Date(dateRange.start).getTime();
        const end = new Date(dateRange.end).getTime();
        return txDate >= start && txDate <= end;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedStatus, selectedMethod, dateRange, transactions]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Status badge component
  const StatusBadge: React.FC<{ status: PaymentTransaction["status"] }> = ({
    status,
  }) => {
    const config = {
      approved: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
      },
      rejected: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: <XCircle className="w-4 h-4" />,
      },
      refunded: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <RefreshCw className="w-4 h-4" />,
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

  // Payment method badge component
  const PaymentMethodBadge: React.FC<{
    method: PaymentTransaction["paymentMethod"];
  }> = ({ method }) => {
    const config = {
      cash: {
        label: "Cash",
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: <DollarSign className="w-4 h-4" />,
      },
      credit_card: {
        label: "Credit Card",
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        icon: <CreditCard className="w-4 h-4" />,
      },
      paypal: {
        label: "PayPal",
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <DollarSign className="w-4 h-4" />,
      },
      stripe: {
        label: "Stripe",
        color: "bg-indigo-100 text-indigo-800 border border-indigo-200",
        icon: <CreditCard className="w-4 h-4" />,
      },
      bank_transfer: {
        label: "Bank Transfer",
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: <DollarSign className="w-4 h-4" />,
      },
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config[method].color}`}
      >
        {config[method].icon}
        {config[method].label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle approve transaction
  const handleApprove = (id: string) => {
    setTransactions(
      transactions.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              status: "approved",
              approvedBy: "Admin User",
              approvedAt: new Date().toISOString(),
            }
          : tx,
      ),
    );
  };

  // Handle reject transaction
  const handleReject = (id: string) => {
    setTransactions(
      transactions.map((tx) =>
        tx.id === id
          ? { ...tx, status: "rejected", notes: "Manually rejected by admin" }
          : tx,
      ),
    );
  };

  // Handle view details
  const handleViewDetails = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Export transactions
  const handleExport = () => {
    const csv = [
      [
        "ID",
        "Customer Name",
        "Email",
        "Amount",
        "Currency",
        "Status",
        "Payment Method",
        "Transaction ID",
        "Date",
        "Invoice ID",
        "Approved By",
        "Approved At",
      ],
      ...filteredTransactions.map((tx) => [
        tx.id,
        tx.customerName,
        tx.customerEmail,
        tx.amount,
        tx.currency,
        tx.status,
        tx.paymentMethod,
        tx.transactionId,
        tx.date,
        tx.invoiceId || "",
        tx.approvedBy || "",
        tx.approvedAt || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Pagination component
  const Pagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and approve payment transactions
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              Export Payments
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Cash Payment
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalCashPayment, "USD")}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                Approved cash transactions
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Online Payment
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalOnlinePayment, "USD")}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                Approved online transactions
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Not Approved Payment
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalNotApprovedPayment, "USD")}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">
                Pending + rejected transactions
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Approved Payment
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.approvedPayment, "USD")}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Total approved amount</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or transaction ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                placeholder="Start Date"
              />
              <input
                type="date"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                placeholder="End Date"
              />
            </div>
            <div className="flex items-center gap-2">
              {(selectedStatus !== "all" ||
                selectedMethod !== "all" ||
                dateRange.start ||
                dateRange.end ||
                searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedStatus("all");
                    setSelectedMethod("all");
                    setDateRange({ start: "", end: "" });
                    setSearchTerm("");
                  }}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear all filters
                </button>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                {filteredTransactions.length} transactions found
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No transactions found</div>
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {transaction.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(
                              transaction.amount,
                              transaction.currency,
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <PaymentMethodBadge
                              method={transaction.paymentMethod}
                            />
                            <div className="text-sm text-gray-500">
                              {transaction.transactionId}
                            </div>
                          </div>
                          {transaction.invoiceId && (
                            <div className="text-sm text-gray-500">
                              Invoice: {transaction.invoiceId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={transaction.status} />
                        {transaction.approvedBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            By {transaction.approvedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(transaction.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {transaction.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(transaction.id)}
                                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(transaction.id)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} transactions
            </div>
            <Pagination />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Total Transactions
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalTransactions}
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <Filter className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Pending Approval
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.pendingApproval}
                </div>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Approval Rate
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {transactions.length > 0
                    ? `${Math.round((stats.approvedPayment / (stats.approvedPayment + stats.totalNotApprovedPayment)) * 100)}%`
                    : "0%"}
                </div>
              </div>
              <div className="bg-green-100 p-2 rounded">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium">
                          {selectedTransaction.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">
                          {selectedTransaction.customerEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="font-medium text-lg">
                          {formatCurrency(
                            selectedTransaction.amount,
                            selectedTransaction.currency,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="mt-1">
                          <StatusBadge status={selectedTransaction.status} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Payment Method
                        </div>
                        <div className="mt-1">
                          <PaymentMethodBadge
                            method={selectedTransaction.paymentMethod}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Transaction ID
                        </div>
                        <div className="font-medium">
                          {selectedTransaction.transactionId}
                        </div>
                      </div>
                      {selectedTransaction.invoiceId && (
                        <div>
                          <div className="text-sm text-gray-500">
                            Invoice ID
                          </div>
                          <div className="font-medium">
                            {selectedTransaction.invoiceId}
                          </div>
                        </div>
                      )}
                      {selectedTransaction.last4 && (
                        <div>
                          <div className="text-sm text-gray-500">
                            Card Last 4
                          </div>
                          <div className="font-medium">
                            **** {selectedTransaction.last4}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Timestamps
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">
                          Transaction Date
                        </div>
                        <div className="font-medium">
                          {formatDate(selectedTransaction.date)}{" "}
                          {formatTime(selectedTransaction.date)}
                        </div>
                      </div>
                      {selectedTransaction.approvedAt && (
                        <div>
                          <div className="text-sm text-gray-500">
                            Approved Date
                          </div>
                          <div className="font-medium">
                            {formatDate(selectedTransaction.approvedAt)}{" "}
                            {formatTime(selectedTransaction.approvedAt)}
                          </div>
                        </div>
                      )}
                      {selectedTransaction.approvedBy && (
                        <div>
                          <div className="text-sm text-gray-500">
                            Approved By
                          </div>
                          <div className="font-medium">
                            {selectedTransaction.approvedBy}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Notes
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-700">
                        {selectedTransaction.notes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTransaction.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleApprove(selectedTransaction.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve Payment
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTransaction.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
