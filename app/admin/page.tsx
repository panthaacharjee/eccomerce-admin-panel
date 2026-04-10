// app/admin/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Truck,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { GetAllUsersRequest, GetAllUsersSuccess, GetAllUsersFail } from "@/redux/reducers/userReducer";
import { GetAllOrderRequest, GetAllOrderSuccess, GetAllOrderFail } from "@/redux/reducers/orderReducer";
import { GetAllProductRequest, GetAllProductSuccess, GetAllProductFail } from "@/redux/reducers/productReducer";
import Axios from "@/components/Axios";
import { Product, ProductImage, ProductSizes } from "@/redux/interfaces/productInterface";

// Helper functions
const formatCurrency = (amount: number, currency: string = "BDT") => {
  return new Intl.NumberFormat("bdt", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
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

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux state
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.user);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.order);
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.product);

  // Fetch all data
  const getAllUsers = async () => {
    try {
      dispatch(GetAllUsersRequest());
      const { data } = await Axios.get("/get/users");
      dispatch(GetAllUsersSuccess(data));
    } catch (error: any) {
      console.error("Error fetching users:", error);
      dispatch(GetAllUsersFail(error.response?.data?.message || "Failed to fetch users"));
    }
  };

  const getAllOrders = async () => {
    try {
      dispatch(GetAllOrderRequest());
      const { data } = await Axios.get("/get/orders");
      dispatch(GetAllOrderSuccess(data));
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      dispatch(GetAllOrderFail(error.response?.data?.message || "Failed to fetch orders"));
    }
  };

  const getAllProducts = async () => {
    try {
      dispatch(GetAllProductRequest());
      const { data } = await Axios.get("/get/products");
      dispatch(GetAllProductSuccess(data));
    } catch (error: any) {
      console.error("Error fetching products:", error);
      dispatch(GetAllProductFail(error.response?.data?.message || "Failed to fetch products"));
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        getAllUsers(),
        getAllOrders(),
        getAllProducts(),
      ]);
      setIsLoading(false);
    };
    fetchAllData();
  }, []);

  // Calculate dashboard statistics from real data
  const dashboardStats = useMemo(() => {
    // Calculate total revenue from orders
    const totalRevenue = orders?.reduce((sum: number, order: any) => {
      const orderTotal = order.total || order.subtotal || 0;
      return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
    }, 0) || 0;

    // Calculate this month's revenue
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const thisMonthRevenue = orders?.reduce((sum: number, order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        const orderTotal = order.total || order.subtotal || 0;
        return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
      }
      return sum;
    }, 0) || 0;

    // Calculate last month's revenue for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthRevenue = orders?.reduce((sum: number, order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
        const orderTotal = order.total || order.subtotal || 0;
        return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
      }
      return sum;
    }, 0) || 0;

    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    // Total orders
    const totalOrders = orders?.length || 0;

    // Calculate this month's orders
    const thisMonthOrders = orders?.filter((order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length || 0;

    const lastMonthOrders = orders?.filter((order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).length || 0;

    const ordersChange = lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : thisMonthOrders > 0 ? 100 : 0;

    // Total customers
    const totalCustomers = users?.length || 0;

    // Calculate new customers this month
    const newCustomersThisMonth = users?.filter((user: any) => {
      const joinDate = new Date(user.createdAt);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length || 0;

    const newCustomersLastMonth = users?.filter((user: any) => {
      const joinDate = new Date(user.createdAt);
      return joinDate.getMonth() === lastMonth && joinDate.getFullYear() === lastMonthYear;
    }).length || 0;

    const customersChange = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : newCustomersThisMonth > 0 ? 100 : 0;

    // Pending deliveries (orders that are not delivered or cancelled)
    const pendingDeliveries = orders?.filter((order: any) => {
      const status = order.orderStatus || order.status;
      return status !== "delivered" && status !== "cancelled" && status !== "refunded";
    }).length || 0;

    const lastMonthPending = orders?.filter((order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      const status = order.orderStatus || order.status;
      return (status !== "delivered" && status !== "cancelled" && status !== "refunded") &&
        orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).length || 0;

    const pendingChange = lastMonthPending > 0
      ? ((pendingDeliveries - lastMonthPending) / lastMonthPending) * 100
      : pendingDeliveries > 0 ? 100 : 0;

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      totalCustomers,
      customersChange,
      pendingDeliveries,
      pendingChange,
    };
  }, [orders, users]);

  // Generate monthly sales data from orders
  const monthlySalesData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const monthlyData = months.map((month, index) => ({
      month,
      income: 0,
      expenses: 0,
      balance: 0,
    }));

    orders?.forEach((order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        const orderTotal = order.total || order.subtotal || 0;
        const orderAmount = typeof orderTotal === 'number' ? orderTotal : 0;

        // Estimate expenses as 40% of revenue (example calculation)
        const estimatedExpenses = orderAmount * 0.4;

        monthlyData[monthIndex].income += orderAmount;
        monthlyData[monthIndex].expenses += estimatedExpenses;
        monthlyData[monthIndex].balance = monthlyData[monthIndex].income - monthlyData[monthIndex].expenses;
      }
    });

    return monthlyData;
  }, [orders]);

  // Get top selling products from orders
  const topSellingProducts = useMemo(() => {
    const productSales = new Map();

    orders?.forEach((order: any) => {
      const items = order.items || [];
      items.forEach((item: any) => {
        const productId = item.id || item.productId || item._id;
        if (productId) {
          const existing = productSales.get(productId) || {
            id: productId,
            name: item.title || item.name || "Unknown Product",
            price: item.price || 0,
            quantity: 0,
            revenue: 0,
          };
          const quantity = item.quantity || 1;
          const itemPrice = item.price || 0;
          existing.quantity += quantity;
          existing.revenue += itemPrice * quantity;
          productSales.set(productId, existing);
        }
      });
    });

    // Find matching product details from products array
    const productsWithDetails = Array.from(productSales.values()).map(sale => {
      const productDetails = products?.find((p: Product) => p._id === sale.id || (p as any).id === sale.id);

      // Get the primary image URL
      let imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${sale.id}`;
      if (productDetails?.thumbnail) {
        imageUrl = productDetails.thumbnail;
      } else if (productDetails?.images && productDetails.images.length > 0) {
        const primaryImage = productDetails.images.find((img: ProductImage) => img.isPrimary);
        imageUrl = primaryImage?.url || productDetails.images[0]?.url || imageUrl;
      }

      // Get category name
      let categoryName = "General";
      if (productDetails?.categories) {
        if (typeof productDetails.categories === 'object') {
          categoryName = productDetails.categories.main_category ||
            productDetails.categories.sub_category ||
            "General";
        } else if (typeof productDetails.categories === 'string') {
          categoryName = productDetails.categories;
        }
      }

      // Get stock quantity
      let totalStock = productDetails?.stock_quantity || 0;
      if (productDetails?.sizes && productDetails.sizes.length > 0) {
        totalStock = productDetails.sizes.reduce((sum: number, size: ProductSizes) => {
          return sum + (size.stockQuantity || size.stock || 0);
        }, 0);
      }



      // Calculate growth based on purchase count
      let growth = "+0%";
      let status: "trending-up" | "trending-down" = "trending-up";

      if (productDetails?.purchase_count && productDetails.purchase_count > 0) {
        const growthPercent = ((sale.quantity - (productDetails.purchase_count * 0.5)) / (productDetails.purchase_count * 0.5)) * 100;
        growth = `${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(1)}%`;
        status = growthPercent >= 0 ? "trending-up" : "trending-down";
      } else {
        const randomGrowth = (Math.random() * 20) - 5;
        growth = `${randomGrowth >= 0 ? '+' : ''}${randomGrowth.toFixed(1)}%`;
        status = randomGrowth >= 0 ? "trending-up" : "trending-down";
      }

      return {
        id: sale.id,
        name: productDetails?.title || sale.name,
        category: categoryName,
        price: formatCurrency(sale.price, productDetails?.currency || "USD"),
        sold: sale.quantity,
        revenue: formatCurrency(sale.revenue, productDetails?.currency || "USD"),
        growth: growth,
        status: status,
        image: imageUrl,
        stock: totalStock,
      };
    });

    // Sort by revenue and get top 5
    return productsWithDetails
      .sort((a, b) => {
        const revenueA = parseFloat(a.revenue.replace(/[^0-9.-]+/g, ""));
        const revenueB = parseFloat(b.revenue.replace(/[^0-9.-]+/g, ""));
        return revenueB - revenueA;
      })
      .slice(0, 5);
  }, [orders, products]);

  // Get today's sales
  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders?.filter((order: any) => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      return orderDate >= today;
    }).slice(0, 10) || [];

    return todayOrders.map((order: any, index: number) => {
      let status = "pending";
      const orderStatus = order.orderStatus || order.status;
      if (orderStatus === "delivered" || orderStatus === "completed") status = "completed";
      else if (orderStatus === "cancelled") status = "cancelled";

      return {
        id: order._id || index,
        orderId: order.orderId || `ORD-${order._id?.slice(-4)}`,
        customer: `${order.deliveryInfo?.firstName || ""} ${order.deliveryInfo?.lastName || ""}`.trim() || order.user?.email?.split('@')[0] || "Unknown Customer",
        amount: formatCurrency(order.total || order.subtotal || 0),
        status: status,
        time: new Date(order.orderDate || order.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }, [orders]);

  // Current offers (you can fetch from an API or use static data)
  const currentOffers = [
    {
      id: 1,
      title: "Summer Sale",
      discount: "30% OFF",
      code: "SUMMER30",
      validUntil: "2024-08-31",
      status: "active",
      used: "1,234",
    },
    {
      id: 2,
      title: "Free Shipping",
      discount: "Free Ship",
      code: "FREESHIP",
      validUntil: "2024-12-31",
      status: "active",
      used: "2,567",
    },
  ];

  // Stats data from real calculations
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      change: `${dashboardStats.revenueChange >= 0 ? '+' : ''}${dashboardStats.revenueChange.toFixed(1)}%`,
      icon: BarChart3,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      trend: dashboardStats.revenueChange >= 0 ? "up" : "down",
      description: "This month",
    },
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders.toLocaleString(),
      change: `${dashboardStats.ordersChange >= 0 ? '+' : ''}${dashboardStats.ordersChange.toFixed(1)}%`,
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      trend: dashboardStats.ordersChange >= 0 ? "up" : "down",
      description: "This month",
    },
    {
      title: "Total Customers",
      value: dashboardStats.totalCustomers.toLocaleString(),
      change: `${dashboardStats.customersChange >= 0 ? '+' : ''}${dashboardStats.customersChange.toFixed(1)}%`,
      icon: Users,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-600",
      trend: dashboardStats.customersChange >= 0 ? "up" : "down",
      description: "New customers",
    },
    {
      title: "Pending Delivery",
      value: dashboardStats.pendingDeliveries.toLocaleString(),
      change: `${dashboardStats.pendingChange >= 0 ? '+' : ''}${dashboardStats.pendingChange.toFixed(1)}%`,
      icon: Truck,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      trend: dashboardStats.pendingChange <= 0 ? "down" : "up",
      description: "Awaiting shipment",
    },
  ];

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (isLoading || usersLoading || ordersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-18 lg:mt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-lg font-bold text-gray-900">
                    {stat.value}
                  </p>
           
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon size={10} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row: Sales Analytics (w-9/12) & Today's Sales (w-3/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sales Analytics - w-9/12 equivalent (col-span-3) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sales Analytics
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Income, Expenses, and Balance overview
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Expenses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Balance</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 md:p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlySalesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                      name="Expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stackId="3"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sales - w-3/12 equivalent (col-span-1) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Today's Sales
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Last {todaysSales.length} orders today
                  </p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {todaysSales.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No sales today</p>
                  </div>
                ) : (
                  todaysSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {sale.orderId}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                                sale.status,
                              )}`}
                            >
                              {sale.status.charAt(0).toUpperCase() +
                                sale.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">
                                {sale.customer}
                              </p>
                              <div className="flex items-center mt-1">
                                {getStatusIcon(sale.status)}
                                <span className="text-xs text-gray-500 ml-1">
                                  {sale.time}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {sale.amount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <a
                  href="/admin/orders"
                  className="block w-full text-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-sm"
                >
                  View All Orders →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Top Selling Products & Current Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Selling Products - w-9/12 equivalent */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top Selling Products
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Best performing products this month
                  </p>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topSellingProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No products sold yet
                      </td>
                    </tr>
                  ) : (
                    topSellingProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.id}`;
                                }}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Stock: {product.stock}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {product.price}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {product.sold.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.revenue}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`flex items-center text-sm font-medium ${product.status === "trending-up"
                                ? "text-green-600"
                                : "text-red-600"
                              }`}
                          >
                            {product.status === "trending-up" ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {product.growth}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-200">
              <a
                href="/admin/products"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
              >
                View all products →
              </a>
            </div>
          </div>
        </div>

        {/* Current Offers - w-3/12 equivalent */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Current Offers
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Active discounts & promotions
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="space-y-3">
                {currentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {offer.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${offer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                              }`}
                          >
                            {offer.status === "active" ? "Active" : "Expiring"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded font-bold text-sm">
                            {offer.discount}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Code</p>
                            <p className="text-xs font-mono font-bold text-gray-900">
                              {offer.code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="text-gray-500">Valid until</p>
                            <p className="font-medium text-gray-900">
                              {offer.validUntil}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">Used</p>
                            <p className="font-medium text-gray-900">
                              {offer.used} times
                            </p>
                          </div>
                        </div>
                        <button className="w-full mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded transition-colors text-xs">
                          Copy Code
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* View All Offers Button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href="/admin/discounts"
                  className="block w-full text-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-sm"
                >
                  View All Offers →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}