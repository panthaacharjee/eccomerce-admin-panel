// components/MobileSidebar.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
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
  X,
  Home,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { signOut, useSession } from "next-auth/react";
import { RootState } from "@/redux/rootReducer";
import { GetAllProductFail, GetAllProductRequest, GetAllProductSuccess } from "@/redux/reducers/productReducer";
import Axios from "./Axios";
import toast from "react-hot-toast";
import { GetAllOrderRequest, GetAllOrderSuccess } from "@/redux/reducers/orderReducer";
import { GetAllUsersFail, GetAllUsersRequest, GetAllUsersSuccess } from "@/redux/reducers/userReducer";



export default function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();


    const dispatch = useDispatch();
    const {data:session} = useSession();
  
    const {users, user} = useSelector((state: RootState) => state.user);
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

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products", count: products && products.length },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders", count: orders && orders.length },
    { icon: Users, label: "Customers", href: "/admin/customers", count: users && users.length },
    { icon: Tag, label: "Discounts", href: "/admin/discounts" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/admin/messages",
      count: 12,
    },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: HelpCircle, label: "Help Center", href: "/admin/help" },
    { icon: LogOut, label: "Logout", href: "#" },
  ];


  const isActive = (href: string) => {
    return (
      pathname === href || (href !== "/admin" && pathname?.startsWith(href))
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HETTY</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* User Profile */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500 truncate">Admin</p>
                <p className="text-xs text-blue-600 font-medium">
                  Store ID: #SP12345
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{users && users.length}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{orders && orders.length}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{users?.filter((u:any) => u.status === "pending").length || 0}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={()=>{
                  onClose();
                  if(item.label === "Logout"){
                    signOut()
                  }
                }}
                className={`
                  flex items-center justify-between rounded-xl px-4 py-3 transition-all
                  ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    p-2 rounded-lg
                    ${
                      isActive(item.href)
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>

                {item.count && (
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Hetty Admin v2.0</p>
            <p className="text-xs mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
