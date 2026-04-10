// components/Sidebar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Tag,
  Truck,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { count } from "console";
import { GetAllUsersFail, GetAllUsersRequest, GetAllUsersSuccess } from "@/redux/reducers/userReducer";
import Axios from "./Axios";
import { GetAllProductFail, GetAllProductRequest, GetAllProductSuccess } from "@/redux/reducers/productReducer";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { GetAllOrderRequest, GetAllOrderSuccess } from "@/redux/reducers/orderReducer";



interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const dispatch = useDispatch();
  const {data:session} = useSession();

  const {users} = useSelector((state: RootState) => state.user);
  const {products} = useSelector((state: RootState) => state.product);
  const {orders} = useSelector((state: RootState) => state.order);

  const getProducts = useCallback(async () => {
    try {
      
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
    } 
  }, [dispatch, session]);

  const getAllOrders = async () => {
    try {
      dispatch(GetAllOrderRequest());
      const { data } = await Axios.get("/admin/orders");
      console.log("Fetched orders data:", data);
      dispatch(GetAllOrderSuccess(data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } 
  };

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

  useEffect(() => {
    getProducts();
    getAllOrders();
    getAllUsers();
  }, []);

  console.log(users, products, orders);

  const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
    { icon: Package, label: "Products", href: "/admin/products", count: products ? products.length : 0 },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders", count: orders ? orders.length : 0 },
    { icon: Users, label: "Customers", href: "/admin/customers", count: users ? users.length : 0 },
    { icon: Tag, label: "Discounts", href: "/admin/discounts", count: 5 },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/admin/messages",
      count: 12,
    },
  ];

  const settingsMenuItems = [
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: HelpCircle, label: "Help Center", href: "/admin/help" },
  ];


  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        onToggleCollapse(); // Collapse on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (href: string) => {
    return (
      pathname === href || (href !== "/admin" && pathname?.startsWith(href))
    );
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-screen bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out fixed top-0 left-0 z-30
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      style={{
        transition: "width 300ms ease-in-out",
        width: isCollapsed ? "5rem" : "16rem",
      }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">ShopSphere</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* User Profile - Collapsed */}
      {isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            JD
          </div>
        </div>
      )}

      {/* User Profile - Expanded */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">John Doe</h3>
              <p className="text-sm text-gray-500 truncate">Admin</p>
              <p className="text-xs text-blue-600 font-medium">
                Store ID: #SP12345
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{products && products.length}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{orders && orders.length}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{products?.filter((val: any) => val.status === "pending").length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <p
            className={`text-gray-400 text-xs font-semibold uppercase mb-3 ${isCollapsed ? "text-center" : "px-3"}`}
          >
            {isCollapsed ? "..." : "Main Menu"}
          </p>

          {mainMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center rounded-xl px-3 py-3 transition-all group
                ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                ${isCollapsed ? "justify-center" : "justify-between"}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    isActive(item.href)
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  }
                `}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>

              {!isCollapsed && item.count && (
                <span
                  className={`
                  px-2 py-1 text-xs font-bold rounded-full
                  ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
                >
                  {item.count}
                </span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Settings Menu */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          {settingsMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center rounded-xl px-3 py-3 transition-all
                text-gray-600 hover:bg-gray-50 hover:text-gray-900
                ${isCollapsed ? "justify-center" : "gap-3"}
              `}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </a>
          ))}
        </div>

        {/* Toggle Button - Bottom */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="mt-4 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 mx-auto" />
          </button>
        )}
      </div>
    </aside>
  );
}
