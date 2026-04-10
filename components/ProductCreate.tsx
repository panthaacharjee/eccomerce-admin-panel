// components/ProductCreateForm.tsx
"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

import {
  X,
  Upload,
  Package,
  DollarSign,
  Hash,
  Tag,
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
  Link,
  Copy,
  ExternalLink,
  Star,
  StarOff,
  AlertCircle,
  Menu,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  ProductCreateFail,
  ProductCreateRequest,
  ProductCreateSuccess,
} from "@/redux/reducers/productReducer";

import {
  GetAllCategoryRequest,
  GetAllCategorySuccess,
  GetAllCategoryFail,
} from "@/redux/reducers/settingReducer";

import Axios from "./Axios";
import { useSession } from "next-auth/react";
import { RootState } from "@/redux/rootReducer";
import toast from "react-hot-toast";

interface ProductCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

const currencies = ["BDT", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
const weightUnits = ["kg", "g", "lb", "oz"];
const dimensionUnits = ["cm", "m", "in", "ft"];
const statusOptions = ["draft", "published", "archived"];
const visibilityOptions = ["visible", "hidden", "search_only"];

export default function ProductCreate({
  isOpen,
  onClose,
}: ProductCreateFormProps) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { categories } = useSelector((state: RootState) => state.category);
  console.log(categories)

  const { loading, success, error } = useSelector(
    (state: RootState) => state.product,
  );
  const [activeSection, setActiveSection] = useState("basic");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [images, setImages] = useState<
    { file: File; preview: string; is_primary: boolean }[]
  >([]);
  const [thumbnailLink, setThumbnailLink] = useState("");
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
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

  // Categories state - object for main and sub category
  const [categoriesData, setCategoriesData] = useState({
    main_category: "",
    sub_category: "",
  });

  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    sku: "",
    ean: "",

    // Pricing
    price: "",
    cost_price: "",
    currency: "BDT",

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

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && files.indexOf(file) === 0, // First image becomes primary
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);

      // If we removed the primary image, set the first remaining image as primary
      if (prev[index].is_primary && newImages.length > 0) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }));
      return newImages;
    });
  };

  const addThumbnailFromLink = () => {
    if (thumbnailLink.trim()) {
      const newImage = {
        file: new File([], "thumbnail-from-link"),
        preview: thumbnailLink,
        is_primary: images.length === 0,
      };
      setImages((prev) => [...prev, newImage]);
      setThumbnailLink("");
      setShowThumbnailInput(false);
    }
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
  };

  const updateSize = (index: number, field: string, value: any) => {
    setSizes((prev) => {
      const newSizes = [...prev];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return newSizes;
    });
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
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
  };

  const updateColor = (index: number, field: string, value: any) => {
    setColors((prev) => {
      const newColors = [...prev];
      newColors[index] = { ...newColors[index], [field]: value };
      return newColors;
    });
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords((prev) => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSection !== "categories") {
      setActiveSection("categories");
      return;
    }

    // Validate categories
    if (!categoriesData.main_category || !categoriesData.sub_category) {
      toast.error("Please select both main category and sub category");
      return;
    }

    // Prepare product data
    const primaryImage = images.find((img) => img.is_primary) || images[0];
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price
        ? parseFloat(formData.cost_price)
        : undefined,
      stock_quantity: parseInt(formData.stock_quantity),
      weight: formData.weight || undefined,
      images: images.map((img, index) => ({
        url: img.preview,
        is_primary: img.is_primary,
        public_id: `product_${Date.now()}_${index}`,
        source: img.file.name === "thumbnail-from-link" ? "link" : "upload",
      })),
      thumbnail: primaryImage?.preview || "",
      categories: categoriesData,
      sizes,
      colors: colors.length > 0 ? colors : undefined,
      keywords,
      dimensions: {
        length: formData.dimensions.length || undefined,
        width: formData.dimensions.width || undefined,
        height: formData.dimensions.height || undefined,
        unit: formData.dimensions.unit,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      view_count: 0,
      purchase_count: 0,
      review: [],
    };

    try {
      dispatch(ProductCreateRequest());
      const { data } = await Axios.post("/create/product", productData, {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(ProductCreateSuccess(data));

      if (data) {
        toast.success(data.message);
        handleReset();
        onClose();
        setActiveSection("basic");
      }
    } catch (err: any) {
      dispatch(ProductCreateFail(err.response.data.message));
      toast.error(err.response.data.message);
    }
  };

  const handleReset = () => {
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
    setThumbnailLink("");
    setShowThumbnailInput(false);
    setSizes([]);
    setColors([]);
    // Reset categories
    setCategoriesData({
      main_category: "",
      sub_category: "",
    });
    setKeywords([]);
    setNewKeyword("");
  };

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
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-4 sm:px-8 py-4 sm:py-6 z-10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Create New Product
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                    Fill in the product details below
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Mobile Menu Button */}
              <div className="md:hidden border-b border-gray-300 p-3 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
                >
                  <div className="flex items-center">
                    {(() => {
                      const SectionIcon = sections.find(s => s.id === activeSection)?.icon || Package;
                      return <SectionIcon className="w-5 h-5 mr-2 text-gray-700" />;
                    })()}
                    <span className="font-medium text-gray-900">
                      {sections.find(s => s.id === activeSection)?.label || "Section"}
                    </span>
                  </div>
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                  <div className="mt-3 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Navigation - Desktop */}
              <div className="hidden md:block w-64 border-r border-gray-300 bg-gray-50 flex-shrink-0 overflow-y-auto">
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <form
                  onSubmit={(e: React.FormEvent) => e.preventDefault()}
                  className="space-y-8"
                >
                  {/* Basic Information Section */}
                  {activeSection === "basic" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                          Product Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: value,
                            }))
                          }
                          placeholder="Enter detailed product description..."
                          className="border border-gray-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-800 focus-within:border-gray-800 transition-all"
                        />
                        <div className="mt-2 flex flex-col sm:flex-row justify-between text-xs text-gray-600 gap-2">
                          <div className="flex flex-wrap items-center space-x-4 gap-y-1">
                            <span className="flex items-center">
                              <span className="font-semibold mr-1">
                                Format:
                              </span>
                              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                                B
                              </kbd>
                              <span className="mx-1">- Bold</span>
                              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                                I
                              </kbd>
                              <span className="mx-1">- Italic</span>
                              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                                U
                              </kbd>
                              <span className="mx-1">- Underline</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const sampleHtml = `
            <h3>Product Features:</h3>
            <ul>
              <li><strong>Premium Quality:</strong> Made with high-grade materials</li>
              <li><strong>Durability:</strong> Built to last with reinforced construction</li>
              <li><strong>Versatility:</strong> Suitable for multiple use cases</li>
            </ul>
            <h3>Specifications:</h3>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th style="background-color: #f3f4f6;">Feature</th>
                <th style="background-color: #f3f4f6;">Details</th>
              </tr>
              <tr>
                <td><u>Material</u></td>
                <td>100% Premium Cotton</td>
              </tr>
              <tr>
                <td><u>Dimensions</u></td>
                <td>10 x 5 x 3 inches</td>
              </tr>
              <tr>
                <td><u>Weight</u></td>
                <td>0.5 kg</td>
              </tr>
            </table>
            <p><em>Note: Product color may vary slightly from images due to monitor settings.</em></p>
          `;
                                setFormData((prev) => ({
                                  ...prev,
                                  description: sampleHtml,
                                }));
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              Load Sample
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  description: "",
                                }))
                              }
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                  Color Name
                                </label>
                                <input
                                  type="text"
                                  value={color.title}
                                  onChange={(e) =>
                                    updateColor(index, "title", e.target.value)
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
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                            <h4 className="text-md font-semibold text-gray-900 flex items-center">
                              <Link className="w-4 h-4 mr-2" />
                              Add Thumbnail from Link
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                setShowThumbnailInput(!showThumbnailInput)
                              }
                              className="px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center"
                            >
                              <Link className="w-4 h-4 mr-2" />
                              {showThumbnailInput
                                ? "Hide Link Input"
                                : "Add from Link"}
                            </button>
                          </div>

                          {showThumbnailInput && (
                            <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                <label className="block text-sm font-medium text-gray-900">
                                  Thumbnail URL
                                </label>
                                <div className="text-xs text-gray-600 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Supports: JPG, PNG, GIF, WebP
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
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
                                  className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                                  disabled={!thumbnailLink.trim()}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add
                                </button>
                              </div>
                              {thumbnailLink && (
                                <div className="mt-3 p-3 bg-white border border-gray-300 rounded-lg">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <span className="text-sm text-gray-700 truncate flex-1">
                                      {thumbnailLink}
                                    </span>
                                    <div className="flex space-x-2">
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
                                      <a
                                        href={thumbnailLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-gray-200 rounded transition-colors text-blue-600"
                                        title="Open in new tab"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </div>
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
                            <div className="px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed border-gray-400 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center">
                              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mb-4" />
                              <span className="text-base sm:text-lg font-medium text-gray-900 text-center">
                                Click to upload images
                              </span>
                              <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
                                Drag and drop images here or click to browse
                              </p>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Recommended: JPG, PNG, GIF, WebP. Max file size:
                                10MB
                              </p>
                              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-gray-600">
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                              <h4 className="text-md font-semibold text-gray-900">
                                Product Images ({images.length})
                              </h4>
                              <div className="text-xs sm:text-sm text-gray-600">
                                <span className="inline-flex items-center mr-4">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                  Primary
                                </span>
                                <span className="text-gray-500 hidden sm:inline">
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
                                    className="w-full h-48 sm:h-64 object-cover"
                                  />
                                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    Primary
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                                  <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-600 text-sm sm:text-base">
                                    No primary image selected
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Select an image and click the star icon
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* All Images Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                              {images.map((image, index) => (
                                <div
                                  key={index}
                                  className={`relative border rounded-lg overflow-hidden group ${image.is_primary ? "border-green-500 border-2" : "border-gray-300"
                                    }`}
                                >
                                  <img
                                    src={image.preview}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-32 sm:h-48 object-cover"
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
                                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center">
                                      <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                      Primary
                                    </div>
                                  )}
                                  {image.file.name === "thumbnail-from-link" && (
                                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                      <Link className="w-2 h-2 sm:w-3 sm:h-3" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Weight
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                              <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
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

                  {/* Categories & Tags Section - UPDATED */}
                  {activeSection === "categories" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                          Categories & Organization
                        </h3>

                        <div className="mb-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                onChange={(e) => setCategoriesData({
                                  ...categoriesData,
                                  sub_category: e.target.value
                                })}
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
                  <div className="mt-8 pt-6 border-t border-gray-300 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="order-2 sm:order-1">
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
                            className="w-full sm:w-auto px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center"
                          >
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Previous
                          </button>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
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
                          className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                          Next
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          onClick={handleSubmit}
                        >
                          {loading ? "Loading........" : "Create Product"}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}