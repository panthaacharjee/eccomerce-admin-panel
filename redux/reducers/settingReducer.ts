// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ICategory,
  ISubLabel,
  ICategoryState,
  ISliderState,
  ISlider,
} from "../interfaces/settingInterface";

const initialState: ICategoryState = {
  categories: [],
  sub_label: [],
  error: null,
  success: null,

  getAllSubLabelLoading: false,
  getAllCategoryLoading: false,
  subLabelCreateLoading: false,
  subLabelUpdateLoading: false,
  subLabelDeleteLoading: false,
  categoryCreateLoading: false,
  categoryUpdateLoading: false,
  categoryDeleteLoading: false,
};

interface ICategoryRespones {
  categories: ICategory[];
  message: string;
}

interface ISubLabelRespones {
  sub_label: ISubLabel[];
  message: string;
}

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    SubLabelCreateRequest(state) {
      state.subLabelCreateLoading = true;
    },
    SubLabelCreateSuccess(state, action: PayloadAction<ISubLabelRespones>) {
      state.subLabelCreateLoading = false;
      state.success = action.payload.message;
      state.sub_label = action.payload.sub_label;
    },
    SubLabelCreateFail(state, action: PayloadAction<string>) {
      state.subLabelCreateLoading = false;
      state.error = action.payload;
    },

    GetAllSubLabelRequest(state) {
      state.getAllSubLabelLoading = true;
    },
    GetAllSubLabelSuccess(state, action: PayloadAction<ISubLabelRespones>) {
      state.getAllSubLabelLoading = false;
      state.sub_label = action.payload.sub_label;
    },
    GetAllSubLabelFail(state, action: PayloadAction<string>) {
      state.getAllSubLabelLoading = false;
      state.error = action.payload;
    },

    SubLabelUpdateRequest(state) {
      state.subLabelUpdateLoading = true;
    },
    SubLabelUpdateSuccess(state, action: PayloadAction<ISubLabelRespones>) {
      state.subLabelUpdateLoading = false;
      state.success = action.payload.message;
      state.sub_label = action.payload.sub_label;
    },
    SubLabelUpdateFail(state, action: PayloadAction<string>) {
      state.subLabelUpdateLoading = false;
      state.error = action.payload;
    },

    SubLabelDeleteRequest(state) {
      state.subLabelDeleteLoading = true;
    },
    SubLabelDeleteSuccess(state, action: PayloadAction<ISubLabelRespones>) {
      state.subLabelDeleteLoading = false;
      state.success = action.payload.message;
      state.sub_label = action.payload.sub_label;
    },
    SubLabelDeleteFail(state, action: PayloadAction<string>) {
      state.subLabelDeleteLoading = false;
      state.error = action.payload;
    },

    CategoryCreateRequest(state) {
      state.categoryCreateLoading = true;
    },
    CategoryCreateSuccess(state, action: PayloadAction<ICategoryRespones>) {
      state.categoryCreateLoading = false;
      state.success = action.payload.message;
      state.categories = action.payload.categories;
    },
    CategoryCreateFail(state, action: PayloadAction<string>) {
      state.categoryCreateLoading = false;
      state.error = action.payload;
    },

    GetAllCategoryRequest(state) {
      state.getAllCategoryLoading = true;
    },
    GetAllCategorySuccess(state, action: PayloadAction<ICategoryRespones>) {
      state.getAllCategoryLoading = false;
      state.categories = action.payload.categories;
    },
    GetAllCategoryFail(state, action: PayloadAction<string>) {
      state.getAllCategoryLoading = false;
      state.error = action.payload;
    },

    CategoryUpdateRequest(state) {
      state.categoryUpdateLoading = true;
    },
    CategoryUpdateSuccess(state, action: PayloadAction<ICategoryRespones>) {
      state.categoryUpdateLoading = false;
      state.success = action.payload.message;
      state.categories = action.payload.categories;
    },
    CategoryUpdateFail(state, action: PayloadAction<string>) {
      state.categoryUpdateLoading = false;
      state.error = action.payload;
    },

    CategoryDeleteRequest(state) {
      state.categoryDeleteLoading = true;
    },
    CategoryDeleteSuccess(state, action: PayloadAction<ICategoryRespones>) {
      state.categoryDeleteLoading = false;
      state.success = action.payload.message;
      state.categories = action.payload.categories;
    },
    CategoryDeleteFail(state, action: PayloadAction<string>) {
      state.categoryDeleteLoading = false;
      state.error = action.payload;
    },

    CreateClearSuccess(state) {
      state.success = null;
    },
    CreateClearError(state) {
      state.error = null;
    },
  },
});

export const {
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
} = categorySlice.actions;

export const categoryReducer = categorySlice.reducer;
