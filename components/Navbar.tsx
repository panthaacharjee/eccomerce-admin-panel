// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { signOut } from "next-auth/react";

const notifications = [
  {
    id: 1,
    text: "New order #ORD-1234 received",
    time: "5 min ago",
    unread: true,
  },
  { id: 2, text: "Customer review received", time: "1 hour ago", unread: true },
  {
    id: 3,
    text: "Payment of $234.50 completed",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    text: "Low stock alert: Product #P-567",
    time: "1 day ago",
    unread: false,
  },
];

const userNavigation = [
  { name: "Your Profile", href: "/admin", icon: User },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Help & Support", href: "/admin/help", icon: HelpCircle },
];

interface NavbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export default function Navbar({ onMenuClick, sidebarCollapsed }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate left position
  const getLeftPosition = () => {
    if (isMobile) {
      return "0rem";
    }
    return sidebarCollapsed ? "5rem" : "16rem";
  };

  return (
    <header
      className="fixed top-0 z-40 bg-white border-b border-gray-200 transition-all duration-300"
      style={{
        left: getLeftPosition(),
        right: 0,
        transition: "left 300ms ease-in-out",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center ml-4 lg:ml-0">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        You have 3 new notifications
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-2 h-2 rounded-full ${notification.unread ? "bg-blue-500" : "bg-gray-300"}`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {notification.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <a
                        href="/admin/messages"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
              </HeadlessMenu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      John Doe
                    </p>
                    <p className="text-xs text-gray-500">
                      john.doe@example.com
                    </p>
                  </div>

                  {userNavigation.map((item) => (
                    <HeadlessMenu.Item key={item.name}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${active ? "bg-gray-50 text-gray-900" : "text-gray-700"}
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </a>
                      )}
                    </HeadlessMenu.Item>
                  ))}
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}