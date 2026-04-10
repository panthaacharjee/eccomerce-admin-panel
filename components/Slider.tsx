"use client";
import {
  SliderCreateFail,
  SliderCreateRequest,
  SliderCreateSuccess,
  GetAllSliderRequest,
  GetAllSliderSuccess,
  GetAllSliderFail,
  SliderUpdateRequest,
  SliderUpdateSuccess,
  SliderUpdateFail,
  SliderDeleteRequest,
  SliderDeleteSuccess,
  SliderDeleteFail,
  CreateClearSuccess,
  CreateClearError,
} from "@/redux/reducers/SliderReducer";
import { RootState } from "@/redux/rootReducer";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Axios from "./Axios";
import { ISlider } from "@/redux/interfaces/settingInterface";
import { Edit, Trash2 } from "lucide-react";

interface SliderFormData {
  _id?: string;
  title: string;
  description: string;
  image: string;
  status: "Published" | "Draft" | "Archive";
  url: string;
  order: number;
}

const SliderComponent = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // State from Redux
  const {
    slider: sliders,
    SliderCreateLoading,
    getAllSliderLoading,
    SliderUpdateLoading,
    SliderDeleteLoading,
  } = useSelector((state: RootState) => state.slider);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<ISlider | null>(null);

  // Form state
  const [formData, setFormData] = useState<SliderFormData>({
    title: "",
    description: "",
    image: "",
    status: "Draft",
    url: "",
    order: 0,
  });

  const [errors, setErrors] = useState<Partial<SliderFormData>>({});

  // Fetch all sliders on component mount
  useEffect(() => {
    getAllSliders();
  }, []);

  // Get all sliders
  const getAllSliders = async () => {
    try {
      dispatch(GetAllSliderRequest());
      const { data } = await Axios.get("/all/slider", {
        headers: {
          Authorization: `Bearer ${session?.user?.id || ""}`,
        },
      });
      dispatch(GetAllSliderSuccess(data));
    } catch (err: any) {
      dispatch(
        GetAllSliderFail(
          err.response?.data?.message || "Failed to fetch sliders",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to fetch sliders");
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name as keyof SliderFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<SliderFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = "Please enter a valid URL";
    }

    if (formData.order < 0) {
      (newErrors.order as any) = "Order cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (urlString: string) => {
    try {
      return Boolean(new URL(urlString));
    } catch (e) {
      return false;
    }
  };

  // Create slider
  const handleSliderCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      dispatch(SliderCreateRequest());
      const { data } = await Axios.post("/create/slider", formData, {
        headers: {
          Authorization: `Bearer ${session?.user?.id || ""}`,
        },
      });
      dispatch(SliderCreateSuccess(data));
      toast.success(data.message);
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      dispatch(
        SliderCreateFail(
          err.response?.data?.message || "Failed to create slider",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to create slider");
    }
  };

  // Update slider
  const handleSliderUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedSlider) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      dispatch(SliderUpdateRequest());
      const { data } = await Axios.put(
        `/update/slider/${selectedSlider._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.id || ""}`,
          },
        },
      );
      dispatch(SliderUpdateSuccess(data));
      toast.success(data.message);
      setShowEditModal(false);
      resetForm();
      setSelectedSlider(null);
    } catch (err: any) {
      dispatch(
        SliderUpdateFail(
          err.response?.data?.message || "Failed to update slider",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to update slider");
    }
  };

  // Delete slider
  const handleSliderDelete = async () => {
    if (!selectedSlider) return;

    try {
      dispatch(SliderDeleteRequest());
      const { data } = await Axios.delete(
        `/delete/slider/${selectedSlider._id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.id || ""}`,
          },
        },
      );
      dispatch(SliderDeleteSuccess(data));
      toast.success(data.message);
      setShowDeleteModal(false);
      setSelectedSlider(null);
    } catch (err: any) {
      dispatch(
        SliderDeleteFail(
          err.response?.data?.message || "Failed to delete slider",
        ),
      );
      toast.error(err.response?.data?.message || "Failed to delete slider");
    }
  };

  // Edit slider
  const handleEditClick = (slider: ISlider) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description,
      image: slider.image,
      status: slider.status as "Published" | "Draft" | "Archive",
      url: slider.url || "",
      order: slider.order || 0,
    });
    setShowEditModal(true);
  };

  // Delete confirmation
  const handleDeleteClick = (slider: ISlider) => {
    setSelectedSlider(slider);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      status: "Draft",
      url: "",
      order: 0,
    });
    setErrors({});
  };

  // Filter sliders based on search and status
  const filteredSliders = sliders?.filter((slider) => {
    const matchesSearch =
      slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slider.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || slider.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Clear success/error messages
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(CreateClearSuccess());
      dispatch(CreateClearError());
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Slider Management
        </h1>
        <p className="text-gray-600">Manage your website sliders and banners</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sliders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archive">Archive</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200"
          >
            <i className="fas fa-plus"></i>
            Create New Slider
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sliders</p>
              <p className="text-2xl font-bold">{sliders?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="fas fa-images text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold">
                {sliders?.filter((s) => s.status === "Published").length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <i className="fas fa-eye text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold">
                {sliders?.filter((s) => s.status === "Draft").length || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <i className="fas fa-pencil-alt text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-2xl font-bold">
                {sliders?.filter((s) => s.status === "Archive").length || 0}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <i className="fas fa-archive text-gray-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {getAllSliderLoading ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading sliders...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSliders?.length > 0 ? (
                    filteredSliders.map((slider) => (
                      <tr key={slider._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-12 w-20">
                            <img
                              className="h-12 w-20 rounded object-cover"
                              src={slider.image}
                              alt={slider.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/80x48?text=No+Image";
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {slider.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {slider.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              slider.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : slider.status === "Draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {slider.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slider.order || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(slider.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(slider)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              <Edit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(slider)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <i className="fas fa-images text-4xl mb-4"></i>
                          <p className="text-lg">No sliders found</p>
                          <p className="text-sm">
                            Create your first slider to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Slider
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSliderCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter slider title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.description
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter slider description"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/500 characters
                    </p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.image
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.image}
                      </p>
                    )}
                    {formData.image && !errors.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-32 w-full object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x200?text=Invalid+URL";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.url
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="https://example.com"
                    />
                    {errors.url && (
                      <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.order
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        min="0"
                      />
                      {errors.order && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.order}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={SliderCreateLoading}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {SliderCreateLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Create Slider
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Slider
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedSlider(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSliderUpdate}>
                {/* Same form fields as create modal */}
                {/* You can reuse the same form structure */}
                {/* Just change the heading and submit button text */}
                <div className="space-y-4">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter slider title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.description
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter slider description"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/500 characters
                    </p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Image URL Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.image
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.image}
                      </p>
                    )}
                    {formData.image && !errors.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-32 w-full object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x200?text=Invalid+URL";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* URL Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.url
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="https://example.com"
                    />
                    {errors.url && (
                      <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                    )}
                  </div>

                  {/* Status and Order Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.order
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        min="0"
                      />
                      {errors.order && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.order}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setSelectedSlider(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={SliderUpdateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {SliderUpdateLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Update Slider
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Slider
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "
                <span className="font-medium">{selectedSlider?.title}</span>"?
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedSlider(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSliderDelete}
                  disabled={SliderDeleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {SliderDeleteLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i>
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

export default SliderComponent;
