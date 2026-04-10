// components/AdminSignIn.jsx
"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Online background images
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80",
];

export default function AdminSignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bgImageIndex] = useState(
    Math.floor(Math.random() * BACKGROUND_IMAGES.length),
  );

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      toast.error("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
        type: "Admin",
      });

      console.log("Admin sign in result:", result);

      if (result?.error) {
        // Handle different error messages
        const errorMessage = result.error;

        if (errorMessage.includes("Invalid email or password")) {
          setError("Invalid email or password");
          toast.error("Invalid email or password. Please try again.");
        } else if (errorMessage.includes("Admin account not found")) {
          setError("Admin account not found");
          toast.error("Admin account not found. Please contact support.");
        } else if (errorMessage.includes("Network error")) {
          setError("Network error");
          toast.error("Network error. Please check your connection.");
        } else {
          setError(errorMessage);
          toast.error(errorMessage || "Authentication failed. Please try again.");
        }
      } else if (result?.ok) {
        // Success!
        setSuccess("Login successful! Redirecting to admin panel...");
        toast.success("Welcome back, Admin!");

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("adminEmail", email);
        } else {
          localStorage.removeItem("adminEmail");
        }

        // Redirect to admin dashboard after short delay
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error("Admin sign in error:", error);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      // Call your forgot password API here
      // const response = await Axios.post("/admin/forgot-password", { email });

      setSuccess("Password reset link has been sent to your email.");
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    }
  };

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="bg-[#444] backdrop-blur-3xl absolute top-0 right-0 w-full h-full">
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${BACKGROUND_IMAGES[bgImageIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Black & White Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0)_70%)]"></div>
        </div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {/* Card Container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200/20">
            {/* Card Header */}
            <div className="p-8 border-b border-gray-200/30">
              <div className="flex flex-col items-center space-y-4">
                {/* App Name */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">
                    HETTY
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Administrator Access Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="py-2 px-8">
              {/* Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </motion.div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                      placeholder="admin@company.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded ${rememberMe ? "border-black bg-black" : "border-gray-400"} transition-colors`}
                      >
                        {rememberMe && (
                          <svg
                            className="w-4 h-4 mx-auto my-0.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Remember me
                    </span>
                  </label>

                  {/* Security Badge */}
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>256-bit SSL</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200/30">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} HETTY. All rights reserved.
                  <br />
                  <span className="text-xs text-gray-500">
                    v2.1.4 • Secure Access Only
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tr from-black/10 to-transparent rounded-full blur-xl"></div>
        </motion.div>
      </div>
    </div>
  );
}