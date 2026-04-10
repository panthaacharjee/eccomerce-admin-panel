// app/admin/page.tsx
"use client";

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

// Sales data for chart
const monthlySalesData = [
  { month: "Jan", income: 65000, expenses: 42000, balance: 23000 },
  { month: "Feb", income: 72000, expenses: 48000, balance: 24000 },
  { month: "Mar", income: 81000, expenses: 52000, balance: 29000 },
  { month: "Apr", income: 92000, expenses: 58000, balance: 34000 },
  { month: "May", income: 88000, expenses: 55000, balance: 33000 },
  { month: "Jun", income: 95000, expenses: 60000, balance: 35000 },
  { month: "Jul", income: 102000, expenses: 65000, balance: 37000 },
  { month: "Aug", income: 110000, expenses: 68000, balance: 42000 },
  { month: "Sep", income: 98000, expenses: 62000, balance: 36000 },
  { month: "Oct", income: 105000, expenses: 66000, balance: 39000 },
  { month: "Nov", income: 115000, expenses: 70000, balance: 45000 },
  { month: "Dec", income: 125000, expenses: 75000, balance: 50000 },
];

// Top selling products with online images
const topSellingProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    price: "$89.99",
    sold: 1245,
    revenue: "$112,103",
    growth: "+12.5%",
    status: "trending-up",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
    stock: 156,
  },
  {
    id: 2,
    name: "Premium Smart Watch",
    category: "Electronics",
    price: "$249.99",
    sold: 892,
    revenue: "$223,103",
    growth: "+18.2%",
    status: "trending-up",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
    stock: 89,
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    price: "$29.99",
    sold: 2341,
    revenue: "$70,123",
    growth: "+5.3%",
    status: "trending-up",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
    stock: 342,
  },
  {
    id: 4,
    name: "Ceramic Coffee Mug Set",
    category: "Home",
    price: "$34.99",
    sold: 1567,
    revenue: "$54,823",
    growth: "+2.1%",
    status: "trending-down",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=100&h=100&fit=crop",
    stock: 45,
  },
  {
    id: 5,
    name: "Yoga Mat Premium",
    category: "Fitness",
    price: "$49.99",
    sold: 1023,
    revenue: "$51,123",
    growth: "+8.7%",
    status: "trending-up",
    image:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=100&h=100&fit=crop",
    stock: 128,
  },
];

// Top 10 today sales
const todaysSales = [
  {
    id: 1,
    orderId: "ORD-1001",
    customer: "John Smith",
    amount: "$149.99",
    status: "completed",
    time: "10:30 AM",
  },
  {
    id: 2,
    orderId: "ORD-1002",
    customer: "Emma Johnson",
    amount: "$89.99",
    status: "completed",
    time: "11:15 AM",
  },
  {
    id: 3,
    orderId: "ORD-1003",
    customer: "Michael Brown",
    amount: "$249.99",
    status: "pending",
    time: "12:45 PM",
  },
  {
    id: 4,
    orderId: "ORD-1004",
    customer: "Sarah Davis",
    amount: "$34.99",
    status: "completed",
    time: "1:30 PM",
  },
  {
    id: 5,
    orderId: "ORD-1005",
    customer: "Robert Wilson",
    amount: "$199.99",
    status: "cancelled",
    time: "2:15 PM",
  },
  {
    id: 6,
    orderId: "ORD-1006",
    customer: "Lisa Miller",
    amount: "$59.99",
    status: "completed",
    time: "3:00 PM",
  },
  {
    id: 7,
    orderId: "ORD-1007",
    customer: "David Taylor",
    amount: "$129.99",
    status: "pending",
    time: "3:45 PM",
  },
  {
    id: 8,
    orderId: "ORD-1008",
    customer: "Jennifer Lee",
    amount: "$79.99",
    status: "completed",
    time: "4:30 PM",
  },
  {
    id: 9,
    orderId: "ORD-1009",
    customer: "Thomas Clark",
    amount: "$299.99",
    status: "completed",
    time: "5:15 PM",
  },
  {
    id: 10,
    orderId: "ORD-1010",
    customer: "Maria Garcia",
    amount: "$49.99",
    status: "pending",
    time: "6:00 PM",
  },
];

// Current offers (only 2 for dashboard)
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

export default function DashboardPage() {
  // Stats data
  const stats = [
    {
      title: "Total Revenue",
      value: "$125,430",
      change: "+20.1%",
      icon: BarChart3,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      trend: "up",
      description: "This month",
    },
    {
      title: "Total Orders",
      value: "2,456",
      change: "+12.3%",
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      trend: "up",
      description: "This month",
    },
    {
      title: "Total Customers",
      value: "12,894",
      change: "+8.4%",
      icon: Users,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-600",
      trend: "up",
      description: "Active users",
    },
    {
      title: "Pending Delivery",
      value: "128",
      change: "-3.2%",
      icon: Truck,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      trend: "down",
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
              {entry.name}: ${entry.value.toLocaleString()}
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

  return (
    <div className="space-y-6">
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
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon size={20} className="text-white" />
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
                      tickFormatter={(value) => `$${value / 1000}k`}
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
                    Last 10 orders today
                  </p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {todaysSales.map((sale) => (
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
                ))}
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
                  {topSellingProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Product Image - Online URL */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
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
                          className={`flex items-center text-sm font-medium ${
                            product.status === "trending-up"
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
                  ))}
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
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              offer.status === "active"
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
