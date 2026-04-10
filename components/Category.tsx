"use client";
import { useState, useEffect, useMemo } from "react";
import { RootState } from "@/redux/rootReducer";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Tag,
  Grid,
  Menu,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";

import Axios from "./Axios";
import {
  SubLabelCreateRequest,
  SubLabelCreateSuccess,
  SubLabelCreateFail,
  GetAllSubLabelRequest,
  GetAllSubLabelSuccess,
  GetAllSubLabelFail,
  SubLabelUpdateRequest,
  SubLabelUpdateSuccess,
  SubLabelUpdateFail,
  SubLabelDeleteRequest,
  SubLabelDeleteSuccess,
  SubLabelDeleteFail,
  CategoryCreateRequest,
  CategoryCreateSuccess,
  CategoryCreateFail,
  GetAllCategoryRequest,
  GetAllCategorySuccess,
  GetAllCategoryFail,
  CategoryUpdateRequest,
  CategoryUpdateSuccess,
  CategoryUpdateFail,
  CategoryDeleteRequest,
  CategoryDeleteSuccess,
  CategoryDeleteFail,
  CreateClearSuccess,
  CreateClearError,
} from "@/redux/reducers/settingReducer";

import {
  ICategory as ReduxICategory,
  ISubLabel as ReduxISubLabel,
} from "@/redux/interfaces/settingInterface";

type CategoryType = ReduxICategory;
type SubLabelType = ReduxISubLabel;

interface CategoryFormData {
  main_label: string;
  sub_label: string[];
  category_image: {
    url: string;
  };
  navmenu: boolean;
  category_menu: boolean;
}

interface SubLabelFormData {
  title: string;
}

const ITEMS_PER_PAGE = 10;

const Category = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const {
    sub_label,
    categories,
    success,
    error,
    getAllSubLabelLoading,
    getAllCategoryLoading,
    subLabelCreateLoading,
    subLabelUpdateLoading,
    subLabelDeleteLoading,
    categoryCreateLoading,
    categoryUpdateLoading,
    categoryDeleteLoading,
  } = useSelector((state: RootState) => state.category);

  // State for modals
  const [isSubLabelModalOpen, setIsSubLabelModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");

  // State for form data
  const [subLabelFormData, setSubLabelFormData] = useState<SubLabelFormData>({
    title: "",
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    main_label: "",
    sub_label: [],
    category_image: {
      url: "",
    },
    navmenu: false,
    category_menu: true,
  });

  // State for selected items
  const [selectedSubLabel, setSelectedSubLabel] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<"sublabels" | "categories">(
    "categories",
  );

  // State for delete confirmation
  const [deleteType, setDeleteType] = useState<"sublabel" | "category">(
    "category",
  );
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllSubLabels();
    fetchAllCategories();
  }, []);

  // Clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(CreateClearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => {
        dispatch(CreateClearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  }, [selectedTab]);

  // API Calls
  const fetchAllSubLabels = async () => {
    try {
      dispatch(GetAllSubLabelRequest());
      const { data } = await Axios.get("/sub-labels", {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(GetAllSubLabelSuccess(data));
    } catch (err: any) {
      dispatch(
        GetAllSubLabelFail(
          err.response?.data?.message || "Failed to fetch sub labels",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to fetch sub labels");
    }
  };

  const fetchAllCategories = async () => {
    try {
      dispatch(GetAllCategoryRequest());
      const { data } = await Axios.get("/all/category", {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(GetAllCategorySuccess(data));
    } catch (err: any) {
      dispatch(
        GetAllCategoryFail(
          err.response?.data?.message || "Failed to fetch categories",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    }
  };

  const handleCreateSubLabel = async () => {
    try {
      dispatch(SubLabelCreateRequest());

      const { data } = await Axios.post("/sub-label/create", subLabelFormData, {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(SubLabelCreateSuccess(data));
      toast.success(data.message);
      setIsSubLabelModalOpen(false);
      setSubLabelFormData({ title: "" });
    } catch (err: any) {
      dispatch(
        SubLabelCreateFail(
          err.response?.data?.message || "Failed to create sub label",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to create sub label");
    }
  };

  const handleUpdateSubLabel = async () => {
    if (!selectedSubLabel) return;

    try {
      dispatch(SubLabelUpdateRequest());
      const { data } = await Axios.put(
        `/sub-label/${selectedSubLabel._id}`,
        subLabelFormData,
        {
          headers: {
            Authorization: `Bearer ${session && (session?.user?.id as any)}`,
          },
        },
      );
      dispatch(SubLabelUpdateSuccess(data));
      toast.success(data.message);
      setIsSubLabelModalOpen(false);
      setSubLabelFormData({ title: "" });
      setSelectedSubLabel(null);
    } catch (err: any) {
      dispatch(
        SubLabelUpdateFail(
          err.response?.data?.message || "Failed to update sub label",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to update sub label");
    }
  };

  const handleDeleteSubLabel = async () => {
    if (!itemToDelete) return;

    try {
      dispatch(SubLabelDeleteRequest());
      const { data } = await Axios.delete(`/sub-label/${itemToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(SubLabelDeleteSuccess(data));
      toast.success(data.message);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      dispatch(
        SubLabelDeleteFail(
          err.response?.data?.message || "Failed to delete sub label",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to delete sub label");
    }
  };

  const handleCreateCategory = async () => {
    try {
      dispatch(CategoryCreateRequest());
      const { data } = await Axios.post("/create/category", categoryFormData, {
        headers: {
          Authorization: `Bearer ${session && (session?.user?.id as any)}`,
        },
      });
      dispatch(CategoryCreateSuccess(data));
      toast.success(data.message);
      setIsCategoryModalOpen(false);
      resetCategoryForm();
    } catch (err: any) {
      dispatch(
        CategoryCreateFail(
          err.response?.data?.message || "Failed to create category",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      dispatch(CategoryUpdateRequest());
      const { data } = await Axios.put(
        `/update/category/${selectedCategory._id}`,
        categoryFormData,
        {
          headers: {
            Authorization: `Bearer ${session && (session?.user?.id as any)}`,
          },
        },
      );
      dispatch(CategoryUpdateSuccess(data));
      toast.success(data.message);
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      setSelectedCategory(null);
    } catch (err: any) {
      dispatch(
        CategoryUpdateFail(
          err.response?.data?.message || "Failed to update category",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete) return;

    try {
      dispatch(CategoryDeleteRequest());
      const { data } = await Axios.delete(
        `/delete/category/${itemToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${session && (session?.user?.id as any)}`,
          },
        },
      );
      dispatch(CategoryDeleteSuccess(data));
      toast.success(data.message);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      dispatch(
        CategoryDeleteFail(
          err.response?.data?.message || "Failed to delete category",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  // Helper functions
  const resetCategoryForm = () => {
    setCategoryFormData({
      main_label: "",
      sub_label: [],
      category_image: {
        url: "",
      },
      navmenu: false,
      category_menu: true,
    });
  };

  const openSubLabelModal = (type: "create" | "edit", subLabel?: any) => {
    setModalType(type);
    if (type === "edit" && subLabel) {
      setSelectedSubLabel(subLabel);
      setSubLabelFormData({ title: subLabel.title });
    } else {
      setSelectedSubLabel(null);
      setSubLabelFormData({ title: "" });
    }
    setIsSubLabelModalOpen(true);
  };

  const openCategoryModal = (type: "create" | "edit", category?: any) => {
    setModalType(type);
    if (type === "edit" && category) {
      setSelectedCategory(category);
      setCategoryFormData({
        main_label: category.main_label,
        sub_label: category.sub_label.map((sl: any) => sl._id),
        category_image: category.category_image,
        navmenu: category.navmenu,
        category_menu: category.category_menu,
      });
    } else {
      setSelectedCategory(null);
      resetCategoryForm();
    }
    setIsCategoryModalOpen(true);
  };

  const openDeleteModal = (type: "sublabel" | "category", item: any) => {
    setDeleteType(type);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const toggleSubLabelSelection = (subLabelId: string) => {
    setCategoryFormData((prev) => ({
      ...prev,
      sub_label: prev.sub_label.includes(subLabelId)
        ? prev.sub_label.filter((id) => id !== subLabelId)
        : [...prev.sub_label, subLabelId],
    }));
  };

  // Calculate overall initial loading
  const initialLoading = getAllSubLabelLoading || getAllCategoryLoading;

  // Calculate loading states for different operations
  const subLabelActionLoading = subLabelCreateLoading || subLabelUpdateLoading;
  const categoryActionLoading = categoryCreateLoading || categoryUpdateLoading;
  const deleteLoading = subLabelDeleteLoading || categoryDeleteLoading;

  // Filter and sort functions
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    let filtered = [...categories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.main_label.toLowerCase().includes(query) ||
          category.sub_label.some((sub: any) =>
            sub.title.toLowerCase().includes(query),
          ),
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(
        (category) => category.navmenu || category.category_menu,
      );
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(
        (category) => !category.navmenu && !category.category_menu,
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name":
          return a.main_label.localeCompare(b.main_label);
        default:
          return 0;
      }
    });

    return filtered;
  }, [categories, searchQuery, statusFilter, sortBy]);

  const filteredSubLabels = useMemo(() => {
    if (!sub_label) return [];

    let filtered = [...sub_label];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((subLabel) =>
        subLabel.title.toLowerCase().includes(query),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sub_label, searchQuery, sortBy]);

  // Pagination calculations
  const currentCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, endIndex);
  }, [currentPage, filteredCategories]);

  const currentSubLabels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSubLabels.slice(startIndex, endIndex);
  }, [currentPage, filteredSubLabels]);

  const totalPages = useMemo(() => {
    if (selectedTab === "categories") {
      return Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
    } else {
      return Math.ceil(filteredSubLabels.length / ITEMS_PER_PAGE);
    }
  }, [selectedTab, filteredCategories, filteredSubLabels]);

  const totalItems = useMemo(() => {
    if (selectedTab === "categories") {
      return filteredCategories.length;
    } else {
      return filteredSubLabels.length;
    }
  }, [selectedTab, filteredCategories, filteredSubLabels]);

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Get pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  return (
    <div className="min-h-screen  text-black py-6 lg:pt-0 pb-8 mt-14 lg:mt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Category Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your categories and sub labels
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-green-800 text-sm sm:text-base break-words">
                {success}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-800 text-sm sm:text-base break-words">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-300 min-w-max">
            <button
              onClick={() => setSelectedTab("categories")}
              className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap ${selectedTab === "categories"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
                }`}
            >
              <div className="flex items-center">
                <Grid className="w-4 h-4 mr-2" />
                Categories ({categories?.length || 0})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("sublabels")}
              className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap ${selectedTab === "sublabels"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
                }`}
            >
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Sub Labels ({sub_label?.length || 0})
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Content */}
          <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedTab}...`}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter (only for categories) */}
                {selectedTab === "categories" && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                {/* View Toggle for Desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
              {selectedTab}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          {selectedTab === "categories" ? (
            <button
              onClick={() => openCategoryModal("create")}
              className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={initialLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </button>
          ) : (
            <button
              onClick={() => openSubLabelModal("create")}
              className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={initialLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Sub Label
            </button>
          )}
        </div>

        {/* Content Area */}
        {initialLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        ) : (
          <>
            {selectedTab === "categories" ? (
              viewMode === "table" ? (
                // Table View - Categories
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Main Label
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Sub Labels
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Image
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Menu Status
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Used Count
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentCategories && currentCategories.length > 0 ? (
                          currentCategories.map((category: CategoryType) => (
                            <tr key={category._id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-900 text-sm break-words">
                                {category.main_label}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {category.sub_label && category.sub_label.length > 0 ? (
                                    category.sub_label.map((sub: any) => (
                                      <span
                                        key={sub._id}
                                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                                      >
                                        {sub.title}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      No sub labels
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {category.category_image?.url ? (
                                  <div className="w-10 h-10 rounded overflow-hidden">
                                    <img
                                      src={category.category_image.url}
                                      alt={category.main_label}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center">
                                    {category.navmenu ? (
                                      <Eye className="w-4 h-4 text-green-600 mr-1" />
                                    ) : (
                                      <EyeOff className="w-4 h-4 text-red-600 mr-1" />
                                    )}
                                    <span className="text-xs text-gray-700">
                                      Nav: {category.navmenu ? "On" : "Off"}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {category.category_menu ? (
                                      <Menu className="w-4 h-4 text-green-600 mr-1" />
                                    ) : (
                                      <X className="w-4 h-4 text-red-600 mr-1" />
                                    )}
                                    <span className="text-xs text-gray-700">
                                      Menu: {category.category_menu ? "On" : "Off"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                  {category.used_count || 0}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openCategoryModal("edit", category)}
                                    className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={categoryActionLoading || initialLoading}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal("category", category)}
                                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={categoryActionLoading || initialLoading || (category.used_count || 0) > 0}
                                    title={(category.used_count || 0) > 0 ? "Cannot delete - category is in use" : "Delete category"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              {searchQuery || statusFilter !== "all"
                                ? "No categories match your search criteria"
                                : "No categories found. Create your first category!"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Grid View - Categories
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {currentCategories && currentCategories.length > 0 ? (
                    currentCategories.map((category: CategoryType) => (
                      <div key={category._id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="p-4">
                          {/* Image */}
                          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
                            {category.category_image?.url ? (
                              <img
                                src={category.category_image.url}
                                alt={category.main_label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Main Label */}
                          <h3 className="font-semibold text-gray-900 text-lg mb-2 break-words">
                            {category.main_label}
                          </h3>

                          {/* Sub Labels */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Sub Labels:</p>
                            <div className="flex flex-wrap gap-1">
                              {category.sub_label && category.sub_label.length > 0 ? (
                                category.sub_label.map((sub: any) => (
                                  <span key={sub._id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                    {sub.title}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">No sub labels</span>
                              )}
                            </div>
                          </div>

                          {/* Menu Status */}
                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Navigation:</span>
                              <div className="flex items-center">
                                {category.navmenu ? (
                                  <Eye className="w-4 h-4 text-green-600 mr-1" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-red-600 mr-1" />
                                )}
                                <span className="text-sm">{category.navmenu ? "On" : "Off"}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Category Menu:</span>
                              <div className="flex items-center">
                                {category.category_menu ? (
                                  <Menu className="w-4 h-4 text-green-600 mr-1" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600 mr-1" />
                                )}
                                <span className="text-sm">{category.category_menu ? "On" : "Off"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Used Count */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600">Used Count:</span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {category.used_count || 0}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openCategoryModal("edit", category)}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                              disabled={categoryActionLoading || initialLoading}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal("category", category)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                              disabled={categoryActionLoading || initialLoading || (category.used_count || 0) > 0}
                              title={(category.used_count || 0) > 0 ? "Cannot delete - category is in use" : "Delete category"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "No categories match your search criteria"
                        : "No categories found. Create your first category!"}
                    </div>
                  )}
                </div>
              )
            ) : (
              viewMode === "table" ? (
                // Table View - Sub Labels
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Title
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Created At
                          </th>
                          <th className="py-3 px-4 text-left text-gray-700 text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentSubLabels && currentSubLabels.length > 0 ? (
                          currentSubLabels.map((subLabel: SubLabelType) => (
                            <tr key={subLabel._id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-900 text-sm break-words">
                                {subLabel.title}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {new Date(subLabel.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openSubLabelModal("edit", subLabel)}
                                    className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    disabled={subLabelActionLoading || initialLoading}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal("sublabel", subLabel)}
                                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                    disabled={subLabelActionLoading || initialLoading}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-gray-500">
                              {searchQuery
                                ? "No sub labels match your search criteria"
                                : "No sub labels found. Create your first sub label!"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Grid View - Sub Labels
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {currentSubLabels && currentSubLabels.length > 0 ? (
                    currentSubLabels.map((subLabel: SubLabelType) => (
                      <div key={subLabel._id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg break-words">
                                {subLabel.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {new Date(subLabel.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Tag className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => openSubLabelModal("edit", subLabel)}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                              disabled={subLabelActionLoading || initialLoading}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal("sublabel", subLabel)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                              disabled={subLabelActionLoading || initialLoading}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-gray-500">
                      {searchQuery
                        ? "No sub labels match your search criteria"
                        : "No sub labels found. Create your first sub label!"}
                    </div>
                  )}
                </div>
              )
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto px-2">
                  {getPaginationRange().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg transition-colors ${currentPage === pageNum
                          ? "bg-black text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sub Label Modal */}
      {isSubLabelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                  {modalType === "create"
                    ? "Create New Sub Label"
                    : "Edit Sub Label"}
                </h2>
                <button
                  onClick={() => setIsSubLabelModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
                  disabled={subLabelActionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Label Title *
                  </label>
                  <input
                    type="text"
                    value={subLabelFormData.title}
                    onChange={(e) =>
                      setSubLabelFormData({ title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter sub label title"
                    disabled={subLabelActionLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
                <button
                  onClick={() => setIsSubLabelModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={subLabelActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    modalType === "create"
                      ? handleCreateSubLabel
                      : handleUpdateSubLabel
                  }
                  disabled={
                    subLabelActionLoading || !subLabelFormData.title.trim()
                  }
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {subLabelActionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {modalType === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {modalType === "create"
                        ? "Create Sub Label"
                        : "Update Sub Label"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                  {modalType === "create"
                    ? "Create New Category"
                    : "Edit Category"}
                </h2>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
                  disabled={categoryActionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Main Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Label *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.main_label}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({
                        ...prev,
                        main_label: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter main category label"
                    disabled={categoryActionLoading}
                  />
                </div>

                {/* Category Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image URL *
                  </label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      value={categoryFormData.category_image.url}
                      onChange={(e) =>
                        setCategoryFormData((prev) => ({
                          ...prev,
                          category_image: { url: e.target.value },
                        }))
                      }
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                      disabled={categoryActionLoading}
                    />
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                      disabled={categoryActionLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </button>
                  </div>
                  {categoryFormData.category_image.url && (
                    <div className="mt-2">
                      <div className="w-20 h-20 rounded overflow-hidden border border-gray-300">
                        <img
                          src={categoryFormData.category_image.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub Labels Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sub Labels
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {sub_label && sub_label.length > 0 ? (
                      sub_label.map((subLabel) => (
                        <div
                          key={subLabel._id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${categoryFormData.sub_label.includes(subLabel._id)
                              ? "bg-black text-white border-black"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                          onClick={() =>
                            !categoryActionLoading &&
                            toggleSubLabelSelection(subLabel._id)
                          }
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded border mr-2 flex-shrink-0 ${categoryFormData.sub_label.includes(
                                subLabel._id,
                              )
                                  ? "bg-white border-white"
                                  : "border-gray-400"
                                }`}
                            >
                              {categoryFormData.sub_label.includes(
                                subLabel._id,
                              ) && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <span className="text-sm break-words">
                              {subLabel.title}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 p-4 text-center text-gray-500">
                        No sub labels available. Create some first!
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-black text-sm">
                        Show in Navigation
                      </p>
                      <p className="text-xs text-gray-600">
                        Display in main navigation menu
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        !categoryActionLoading &&
                        setCategoryFormData((prev) => ({
                          ...prev,
                          navmenu: !prev.navmenu,
                        }))
                      }
                      disabled={categoryActionLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${categoryFormData.navmenu ? "bg-black" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${categoryFormData.navmenu
                            ? "translate-x-6"
                            : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 mr-4">
                      <p className="font-medium text-black text-sm">
                        Category Menu
                      </p>
                      <p className="text-xs text-gray-600">
                        Enable category menu display
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        !categoryActionLoading &&
                        setCategoryFormData((prev) => ({
                          ...prev,
                          category_menu: !prev.category_menu,
                        }))
                      }
                      disabled={categoryActionLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${categoryFormData.category_menu
                          ? "bg-black"
                          : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${categoryFormData.category_menu
                            ? "translate-x-6"
                            : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={categoryActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    modalType === "create"
                      ? handleCreateCategory
                      : handleUpdateCategory
                  }
                  disabled={
                    categoryActionLoading ||
                    !categoryFormData.main_label.trim() ||
                    !categoryFormData.category_image.url.trim()
                  }
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {categoryActionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {modalType === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {modalType === "create"
                        ? "Create Category"
                        : "Update Category"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-black text-center mb-4">
                Confirm Deletion
              </h2>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this {deleteType}?
              </p>

              <p className="text-red-600 text-center font-medium mb-6 break-words">
                {deleteType === "category" &&
                  itemToDelete &&
                  `"${itemToDelete.main_label}"`}
                {deleteType === "sublabel" &&
                  itemToDelete &&
                  `"${itemToDelete.title}"`}
              </p>

              {deleteType === "category" && itemToDelete?.used_count > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    ⚠️ This category has {itemToDelete.used_count} usage(s) and
                    cannot be deleted.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    deleteType === "category"
                      ? handleDeleteCategory
                      : handleDeleteSubLabel
                  }
                  disabled={
                    deleteLoading ||
                    (deleteType === "category" && itemToDelete?.used_count > 0)
                  }
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;