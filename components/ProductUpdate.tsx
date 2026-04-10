// components/ProductUpdateForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  Eye,
  EyeOff,
  Weight,
  Ruler,
  Globe,
  Search,
  Calendar,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Star,
  Palette,
  RulerIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  ExternalLink,
  Link as LinkIcon,
  Copy,
  StarOff,
} from "lucide-react";

import RichTextEditor from "./RichTextEditor";
import { AppDispatch } from "@/redux/store";
import {
  Product,
  ProductImage,
  Category,
  ProductColors,
  ProductSizes,
  ProductReviews,
} from "@/redux/interfaces/productInterface";
import Axios from "./Axios";
import { useSession } from "next-auth/react";
import { RootState } from "@/redux/rootReducer";
import {
  ProductCreateFail,
  ProductUpdateRequest,
  ProductUpdateSuccess,
} from "@/redux/reducers/productReducer";
import toast from "react-hot-toast";

interface ProductUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  onProductUpdated?: (product: Product) => void;
}

// Sample data for dropdowns
const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
const weightUnits = ["kg", "g", "lb", "oz"];
const dimensionUnits = ["cm", "m", "in", "ft"];
const statusOptions = ["draft", "published", "archived"];
const visibilityOptions = ["visible", "hidden", "search_only"];

interface FormErrors {
  [key: string]: string | undefined;
  title?: string;
  sku?: string;
  price?: string;
  stock_quantity?: string;
  weight?: string;
}

export default function ProductUpdateForm({
  isOpen,
  onClose,
  productId,
}: ProductUpdateFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const { loading, products } = useSelector(
    (state: RootState) => state.product,
  );
  const { categories } = useSelector((state: RootState) => state.category);

  const [isFetching, setIsFetching] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [images, setImages] = useState<
    Array<{
      file?: File;
      preview: string;
      is_primary: boolean;
      public_id?: string;
    }>
  >([]);
  const [sizes, setSizes] = useState<
    Array<{
      title: string;
      price: number;
      stock_quantity: number;
    }>
  >([]);
  const [colors, setColors] = useState<
    Array<{
      title: string;
      price: number;
      stock_quantity: number;
    }>
  >([]);

  // Categories state - object for main and sub category (SAME AS CREATE FORM)
  const [categoriesData, setCategoriesData] = useState({
    main_category: "",
    sub_category: "",
  });

  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
  const [thumbnailLink, setThumbnailLink] = useState("");

  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    sku: "",
    ean: "",

    // Pricing
    price: "",
    cost_price: "",
    currency: "USD",

    // Inventory
    stock_quantity: "",

    // Shipping
    weight: "",
    weight_unit: "kg",
    dimensions: {
      length: "",
      width: "",
      height: "",
      unit: "cm",
    },

    // SEO & Marketing
    meta_title: "",
    meta_description: "",

    // Status & Visibility
    status: "draft",
    visibility: "visible",
  });

  // Fetch product data when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchProductData();
    }
  }, [isOpen, productId]);

  // Prompt user before closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchProductData = async () => {
    if (!productId) return;

    setIsFetching(true);
    try {
      const { data } = await Axios.get(`/single/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });

      if (data && data.product) {
        const product = data.product;

        // Set form data
        setFormData({
          title: product.title,
          description: product.description,
          sku: product.sku,
          ean: product.ean || "",
          price: product.price.toString(),
          cost_price: product.cost_price?.toString() || "",
          currency: product.currency,
          stock_quantity: product.stock_quantity.toString(),
          weight: product.weight || "",
          weight_unit: product.weight_unit || "kg",
          dimensions: product.dimensions || {
            length: "",
            width: "",
            height: "",
            unit: "cm",
          },
          meta_title: product.meta_title || "",
          meta_description: product.meta_description || "",
          status: product.status,
          visibility: product.visibility,
        });

        // Set images
        setImages(
          product.images.map((img: any) => ({
            preview: img.url,
            is_primary: img.isPrimary || img.is_primary || false,
            public_id: img.public_id,
          })),
        );

        // Set sizes
        setSizes(
          product.sizes.map((size: any) => ({
            title: size.label || size.title || "",
            price: size.price || 0,
            stock_quantity: size.stockQuantity || size.stock_quantity || 0,
          })) || [],
        );

        // Set colors
        setColors(
          product.colors?.map((color: any) => ({
            title: color.name || color.title || "",
            price: color.price || 0,
            stock_quantity: color.stockQuantity || color.stock_quantity || 0,
          })) || [],
        );

        // Set categories - Convert from array to single object (SAME AS CREATE FORM)
        if (product.categories && product.categories.length > 0) {
          const category = product.categories[0];
          setCategoriesData({
            main_category: category.main_category || category.main_label || "",
            sub_category: category.sub_category || category.sub_label || "",
          });
        }

        setKeywords(product.keywords || []);
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch product data",
      );
      console.error("Error fetching product:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // Mark unsaved changes on form modification
  const handleFormChange = useCallback(() => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  }, [hasUnsavedChanges]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && files.indexOf(file) === 0,
    }));
    setImages((prev) => [...prev, ...newImages]);
    handleFormChange();
  };

  const addThumbnailFromLink = () => {
    if (!thumbnailLink.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(thumbnailLink); // Validate URL
      const newImage = {
        preview: thumbnailLink,
        is_primary: images.length === 0,
      };
      setImages((prev) => [...prev, newImage]);
      setThumbnailLink("");
      setShowThumbnailInput(false);
      handleFormChange();
      toast.success("Image added from link");
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      // If primary was removed, set first image as primary
      if (newImages.length > 0 && index === 0) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
    handleFormChange();
    toast.success("Image removed");
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }));
      return newImages;
    });
    handleFormChange();
    toast.success("Primary image updated");
  };

  const addSize = () => {
    setSizes((prev) => [
      ...prev,
      {
        title: "",
        price: 0,
        stock_quantity: 0,
      },
    ]);
    handleFormChange();
  };

  const updateSize = (index: number, field: string, value: any) => {
    setSizes((prev) => {
      const newSizes = [...prev];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return newSizes;
    });
    handleFormChange();
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
    handleFormChange();
    toast.success("Size variant removed");
  };

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        title: "",
        price: 0,
        stock_quantity: 0,
      },
    ]);
    handleFormChange();
  };

  const updateColor = (index: number, field: string, value: any) => {
    setColors((prev) => {
      const newColors = [...prev];
      newColors[index] = { ...newColors[index], [field]: value };
      return newColors;
    });
    handleFormChange();
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
    handleFormChange();
    toast.success("Color variant removed");
  };

  const addKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords((prev) => [...prev, trimmedKeyword]);
      setNewKeyword("");
      handleFormChange();
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
    handleFormChange();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    handleFormChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    // Validate categories
    if (!categoriesData.main_category || !categoriesData.sub_category) {
      toast.error("Please select both main category and sub category");
      return;
    }

    try {
      dispatch(ProductUpdateRequest());
      const productData = {
        title: formData.title,
        description: formData.description,
        sku: formData.sku,
        ean: formData.ean || undefined,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : undefined,
        currency: formData.currency,
        stock_quantity: parseInt(formData.stock_quantity),
        weight: formData.weight || undefined,
        weight_unit: formData.weight_unit,
        dimensions: {
          length: formData.dimensions.length || undefined,
          width: formData.dimensions.width || undefined,
          height: formData.dimensions.height || undefined,
          unit: formData.dimensions.unit,
        },
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        keywords: keywords,
        status: formData.status,
        visibility: formData.visibility,
        images: images.map((img, index) => ({
          url: img.preview,
          is_primary: img.is_primary || index === 0,
          public_id: img.public_id || `product_${Date.now()}_${index}`,
        })),
        thumbnail:
          images.find((img) => img.is_primary)?.preview ||
          images[0]?.preview ||
          "",
        categories: categoriesData, // Send as single object (SAME AS CREATE FORM)
        sizes,
        colors: colors.length > 0 ? colors : undefined,
        updatedAt: new Date(),
      };

      const { data } = await Axios.put(
        `/update/product/${productId}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${session && (session?.user?.id as any)}`,
          },
        }
      );

      if (data) {
        dispatch(ProductUpdateSuccess(data));
        toast.success(data.message || "Product updated successfully!");
        setHasUnsavedChanges(false);
        onClose();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update product";
      dispatch(ProductCreateFail(errorMessage));
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    if (
      hasUnsavedChanges &&
      !confirm("You have unsaved changes. Are you sure you want to reset?")
    ) {
      return;
    }

    setFormData({
      title: "",
      description: "",
      sku: "",
      ean: "",
      price: "",
      cost_price: "",
      currency: "USD",
      stock_quantity: "",
      weight: "",
      weight_unit: "kg",
      dimensions: {
        length: "",
        width: "",
        height: "",
        unit: "cm",
      },
      meta_title: "",
      meta_description: "",
      status: "draft",
      visibility: "visible",
    });
    setImages([]);
    setSizes([]);
    setColors([]);
    setCategoriesData({
      main_category: "",
      sub_category: "",
    });
    setKeywords([]);
    setNewKeyword("");
    setErrors({});
    setHasUnsavedChanges(false);
    toast.success("Form reset successfully");
  };

  const handleClose = () => {
    if (hasUnsavedChanges && !showConfirmClose) {
      setShowConfirmClose(true);
      return;
    }
    onClose();
    setShowConfirmClose(false);
  };

  if (!isOpen) return null;

  const sections = [
    { id: "basic", label: "Basic Information", icon: Package },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "inventory", label: "Inventory & Variants", icon: Hash },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "shipping", label: "Shipping", icon: Weight },
    { id: "seo", label: "SEO & Marketing", icon: Search },
    { id: "categories", label: "Categories & Tags", icon: Tag },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Confirmation Dialog */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Unsaved Changes
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                You have unsaved changes. Are you sure you want to close the
                form? All changes will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                >
                  Continue Editing
                </button>
                <button
                  onClick={() => {
                    setShowConfirmClose(false);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-8 py-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">
                      {isFetching
                        ? "Loading Product..."
                        : `Update Product: ${formData.sku}`}
                    </h2>
                    {hasUnsavedChanges && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">
                      Update product details and information
                    </p>
                    {productId && (
                      <a
                        href={`/products/${productId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Live Product
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 ml-4"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {isFetching ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
                  <p className="text-gray-600">Loading product details...</p>
                </div>
              </div>
            ) : (
              <div className="flex">
                {/* Sidebar Navigation */}
                <div className="w-64 border-r border-gray-300 bg-gray-50">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                      Sections
                    </h3>
                    <nav className="space-y-1">
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${activeSection === section.id
                                ? "bg-gray-900 text-white"
                                : "text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {section.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <form
                    onSubmit={(e: React.FormEvent) => e.preventDefault()}
                    className="p-8"
                  >
                    {/* Basic Information Section */}
                    {activeSection === "basic" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Product Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Product Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                placeholder="Enter product title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                SKU *
                              </label>
                              <input
                                type="text"
                                name="sku"
                                required
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                placeholder="PROD-001"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                EAN/UPC
                              </label>
                              <input
                                type="text"
                                name="ean"
                                value={formData.ean}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                placeholder="123456789012"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Status
                              </label>
                              <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Description *
                          </label>
                          <RichTextEditor
                            value={formData.description}
                            onChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,
                                description: value,
                              }));
                              handleFormChange();
                            }}
                            placeholder="Enter detailed product description..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Pricing Section */}
                    {activeSection === "pricing" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Pricing Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Selling Price *
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  name="price"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  placeholder="0.00"
                                />
                                <span className="absolute right-3 top-3 text-gray-600">
                                  {formData.currency}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Cost Price
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  name="cost_price"
                                  min="0"
                                  step="0.01"
                                  value={formData.cost_price}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  placeholder="0.00"
                                />
                                <span className="absolute right-3 top-3 text-gray-600">
                                  {formData.currency}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Currency
                              </label>
                              <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                              >
                                {currencies.map((curr) => (
                                  <option key={curr} value={curr}>
                                    {curr}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Visibility
                              </label>
                              <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                              >
                                {visibilityOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() +
                                      option.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inventory & Variants Section */}
                    {activeSection === "inventory" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Inventory Management
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Stock Quantity *
                              </label>
                              <input
                                type="number"
                                name="stock_quantity"
                                required
                                min="0"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sizes Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-900">
                              Size Variants
                            </h4>
                            <button
                              type="button"
                              onClick={addSize}
                              className="px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Size
                            </button>
                          </div>
                          {sizes.map((size, index) => (
                            <div
                              key={index}
                              className="mb-6 p-4 border border-gray-300 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-gray-900">
                                  Size {index + 1}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => removeSize(index)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Size Title
                                  </label>
                                  <input
                                    type="text"
                                    value={size.title}
                                    onChange={(e) =>
                                      updateSize(index, "title", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="e.g., Small, Medium, Large"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    value={size.price}
                                    onChange={(e) =>
                                      updateSize(
                                        index,
                                        "price",
                                        parseFloat(e.target.value),
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    value={size.stock_quantity}
                                    onChange={(e) =>
                                      updateSize(
                                        index,
                                        "stock_quantity",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Color Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-900">
                              Color Variants
                            </h4>
                            <button
                              type="button"
                              onClick={addColor}
                              className="px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Color
                            </button>
                          </div>
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              className="mb-6 p-4 border border-gray-300 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-gray-900">
                                  Color {index + 1}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => removeColor(index)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Color Name
                                  </label>
                                  <input
                                    type="text"
                                    value={color.title}
                                    onChange={(e) =>
                                      updateColor(
                                        index,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="e.g., Red, Blue, Green"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    value={color.price}
                                    onChange={(e) =>
                                      updateColor(
                                        index,
                                        "price",
                                        parseFloat(e.target.value),
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    value={color.stock_quantity}
                                    onChange={(e) =>
                                      updateColor(
                                        index,
                                        "stock_quantity",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Section */}
                    {activeSection === "media" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Product Images
                          </h3>

                          {/* Thumbnail Link Section */}
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Add Thumbnail from Link
                              </h4>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowThumbnailInput(!showThumbnailInput)
                                }
                                className="px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
                              >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                {showThumbnailInput
                                  ? "Hide Link Input"
                                  : "Add from Link"}
                              </button>
                            </div>

                            {showThumbnailInput && (
                              <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                  <label className="block text-sm font-medium text-gray-900">
                                    Thumbnail URL
                                  </label>
                                  <div className="text-xs text-gray-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Supports: JPG, PNG, GIF, WebP
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={thumbnailLink}
                                    onChange={(e) =>
                                      setThumbnailLink(e.target.value)
                                    }
                                    className="flex-1 px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                    placeholder="https://example.com/product-image.jpg"
                                  />
                                  <button
                                    type="button"
                                    onClick={addThumbnailFromLink}
                                    className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
                                    disabled={!thumbnailLink.trim()}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                  </button>
                                </div>
                                {thumbnailLink && (
                                  <div className="mt-3 p-3 bg-white border border-gray-300 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm text-gray-700 truncate mr-2">
                                        {thumbnailLink}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            thumbnailLink,
                                          )
                                        }
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        title="Copy URL"
                                      >
                                        <Copy className="w-4 h-4 text-gray-600" />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <a
                                        href={thumbnailLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Open in new tab
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          window.open(thumbnailLink, "_blank")
                                        }
                                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
                                      >
                                        <ImageIcon className="w-3 h-3 mr-1" />
                                        Preview
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* File Upload Section */}
                          <div className="mb-6">
                            <label className="block">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                              />
                              <div className="px-6 py-8 border-2 border-dashed border-gray-400 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center">
                                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                                <span className="text-lg font-medium text-gray-900">
                                  Click to upload images
                                </span>
                                <p className="text-sm text-gray-600 mt-2">
                                  Drag and drop images here or click to browse
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Recommended: JPG, PNG, GIF, WebP. Max file
                                  size: 10MB
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                                  <span className="px-2 py-1 bg-gray-100 rounded">
                                    JPG
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded">
                                    PNG
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded">
                                    GIF
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded">
                                    WebP
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Uploaded Images Display */}
                          {images.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-900">
                                  Product Images ({images.length})
                                </h4>
                                <div className="text-sm text-gray-600">
                                  <span className="inline-flex items-center mr-4">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                    Primary
                                  </span>
                                  <span className="text-gray-500">
                                    Click star to set as primary
                                  </span>
                                </div>
                              </div>

                              {/* Primary Image Preview */}
                              <div className="mb-6">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Primary Image
                                </h5>
                                {images.filter((img) => img.is_primary).length >
                                  0 ? (
                                  <div className="relative border-2 border-green-500 rounded-lg overflow-hidden">
                                    <img
                                      src={
                                        images.find((img) => img.is_primary)
                                          ?.preview
                                      }
                                      alt="Primary"
                                      className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                                      <Star className="w-3 h-3 mr-1" />
                                      Primary
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">
                                      No primary image selected
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Select an image and click the star icon
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* All Images Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                  <div
                                    key={index}
                                    className={`relative border rounded-lg overflow-hidden group ${image.is_primary
                                        ? "border-green-500 border-2"
                                        : "border-gray-300"
                                      }`}
                                  >
                                    <img
                                      src={image.preview}
                                      alt={`Product ${index + 1}`}
                                      className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="flex space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => setPrimaryImage(index)}
                                          className={`p-2 rounded-full transition-colors ${image.is_primary
                                              ? "bg-yellow-500 text-white"
                                              : "bg-white hover:bg-gray-200 text-gray-900"
                                            }`}
                                          title={
                                            image.is_primary
                                              ? "Primary Image"
                                              : "Set as primary"
                                          }
                                        >
                                          {image.is_primary ? (
                                            <Star className="w-4 h-4" />
                                          ) : (
                                            <StarOff className="w-4 h-4" />
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeImage(index)}
                                          className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors"
                                          title="Remove image"
                                        >
                                          <Trash2 className="w-4 h-4 text-gray-600" />
                                        </button>
                                      </div>
                                    </div>
                                    {image.is_primary && (
                                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        Primary
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shipping Section */}
                    {activeSection === "shipping" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Shipping Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Weight
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  name="weight"
                                  min="0"
                                  step="0.01"
                                  value={formData.weight}
                                  onChange={handleChange}
                                  className="flex-1 px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  placeholder="0.00"
                                />
                                <select
                                  name="weight_unit"
                                  value={formData.weight_unit}
                                  onChange={handleChange}
                                  className="px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                >
                                  {weightUnits.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">
                              Dimensions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Length
                                </label>
                                <input
                                  type="number"
                                  name="dimensions.length"
                                  min="0"
                                  step="0.01"
                                  value={formData.dimensions.length}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Width
                                </label>
                                <input
                                  type="number"
                                  name="dimensions.width"
                                  min="0"
                                  step="0.01"
                                  value={formData.dimensions.width}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Height
                                </label>
                                <input
                                  type="number"
                                  name="dimensions.height"
                                  min="0"
                                  step="0.01"
                                  value={formData.dimensions.height}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Unit
                                </label>
                                <select
                                  name="dimensions.unit"
                                  value={formData.dimensions.unit}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white"
                                >
                                  {dimensionUnits.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEO Section */}
                    {activeSection === "seo" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            SEO & Marketing
                          </h3>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Meta Title
                              </label>
                              <input
                                type="text"
                                name="meta_title"
                                value={formData.meta_title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                placeholder="Meta title for search engines"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Meta Description
                              </label>
                              <textarea
                                name="meta_description"
                                rows={4}
                                value={formData.meta_description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white resize-none"
                                placeholder="Meta description for search results"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Keywords
                              </label>
                              <div className="flex gap-2 mb-3">
                                <input
                                  type="text"
                                  value={newKeyword}
                                  onChange={(e) =>
                                    setNewKeyword(e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addKeyword())
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  placeholder="Add a keyword"
                                />
                                <button
                                  type="button"
                                  onClick={addKeyword}
                                  className="px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword) => (
                                  <div
                                    key={keyword}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full"
                                  >
                                    <span className="text-sm text-gray-900">
                                      {keyword}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeKeyword(keyword)}
                                      className="hover:text-gray-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Categories & Tags Section - UPDATED with category system from create form */}
                    {activeSection === "categories" && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                            Categories & Organization
                          </h3>

                          <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Main Category *
                                </label>
                                <select
                                  value={categoriesData.main_category}
                                  onChange={(e) => {
                                    setCategoriesData({
                                      main_category: e.target.value,
                                      sub_category: "", // Reset sub category when main changes
                                    });
                                    handleFormChange();
                                  }}
                                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  required
                                >
                                  <option value="">Select main category</option>
                                  {categories.map((cat: any) => {
                                    // Handle different possible structures of category
                                    const categoryValue = cat.main_label || cat.title || cat.name || cat._id;
                                    const categoryLabel = cat.main_label || cat.title || cat.name || "Unnamed Category";

                                    return (
                                      <option key={cat._id || categoryValue} value={categoryValue}>
                                        {categoryLabel}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Sub Category *
                                </label>
                                <select
                                  value={categoriesData.sub_category}
                                  onChange={(e) => {
                                    setCategoriesData({
                                      ...categoriesData,
                                      sub_category: e.target.value
                                    });
                                    handleFormChange();
                                  }}
                                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all bg-white"
                                  required
                                  disabled={!categoriesData.main_category}
                                >
                                  <option value="">Select sub category</option>
                                  {categoriesData.main_category &&
                                    (() => {
                                      // Find the selected main category
                                      const selectedMainCat = categories.find((cat: any) =>
                                        (cat.main_label || cat.title || cat.name) === categoriesData.main_category
                                      );

                                      // Get sub categories array - handle different possible structures
                                      let subCategories = [];

                                      if (selectedMainCat?.sub_label && Array.isArray(selectedMainCat.sub_label)) {
                                        subCategories = selectedMainCat.sub_label;
                                      } else if (selectedMainCat?.sub_categories && Array.isArray(selectedMainCat.sub_categories)) {
                                        subCategories = selectedMainCat.sub_categories;
                                      } else if (selectedMainCat?.children && Array.isArray(selectedMainCat.children)) {
                                        subCategories = selectedMainCat.children;
                                      }

                                      // Map through sub categories
                                      return subCategories.map((subItem: any, index: number) => {
                                        // Handle different possible structures of sub category
                                        let subValue = "";
                                        let subLabel = "";

                                        if (typeof subItem === 'string') {
                                          subValue = subItem;
                                          subLabel = subItem;
                                        } else if (subItem && typeof subItem === 'object') {
                                          // If it's an object, try to get the title or name
                                          subValue = subItem.title || subItem.name || subItem._id || `sub-${index}`;
                                          subLabel = subItem.title || subItem.name || "Unnamed Subcategory";
                                        } else {
                                          subValue = `sub-${index}`;
                                          subLabel = "Unknown";
                                        }

                                        return (
                                          <option key={subValue} value={subValue}>
                                            {subLabel}
                                          </option>
                                        );
                                      });
                                    })()
                                  }
                                </select>
                                {!categoriesData.main_category && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Please select a main category first
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between">
                      <div className="flex gap-3">
                        {sections.findIndex((s) => s.id === activeSection) >
                          0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const currentIndex = sections.findIndex(
                                  (s) => s.id === activeSection,
                                );
                                setActiveSection(sections[currentIndex - 1].id);
                              }}
                              className="px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
                            >
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Previous
                            </button>
                          )}
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          Reset Form
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasUnsavedChanges) {
                              setShowConfirmClose(true);
                            } else {
                              onClose();
                            }
                          }}
                          className="px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        {sections.findIndex((s) => s.id === activeSection) <
                          sections.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const currentIndex = sections.findIndex(
                                (s) => s.id === activeSection,
                              );
                              setActiveSection(sections[currentIndex + 1].id);
                            }}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
                          >
                            Next
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Updating...
                              </>
                            ) : (
                              "Update Product"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}