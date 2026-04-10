// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductState } from "../interfaces/productInterface";

const initialState: ProductState = {
  status: false,
  loading: false,
  products: [],
  error: null,
  success: null,
};

interface IProductRespones {
  products: Product[];
  message: string;
}

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    ProductCreateRequest(state) {
      state.loading = true;
    },
    ProductCreateSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.success = action.payload.message;
      state.products = action.payload.products;
    },
    ProductCreateFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    GetAllProductRequest(state) {
      state.loading = true;
    },
    GetAllProductSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.products = action.payload.products;
    },
    GetAllProductFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    ProductUpdateRequest(state) {
      state.loading = true;
    },
    ProductUpdateSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.success = action.payload.message;
      state.products = action.payload.products;
    },
    ProductUpdateFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    ProductDeleteRequest(state) {
      state.loading = true;
    },
    ProductDeleteSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.success = action.payload.message;
      state.products = action.payload.products;
    },
    ProductDeleteFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    ProductAllDeleteRequest(state) {
      state.loading = true;
    },
    ProductAllDeleteSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.success = action.payload.message;
      state.products = action.payload.products;
    },
    ProductAllDeleteFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    ProductAllRestoreRequest(state) {
      state.loading = true;
    },
    ProductAllRestoreSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.success = action.payload.message;
      state.products = action.payload.products;
    },
    ProductAllRestoreFail(state, action: PayloadAction<string>) {
      state.loading = false;
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
  ProductCreateRequest,
  ProductCreateSuccess,
  ProductCreateFail,
  GetAllProductRequest,
  GetAllProductSuccess,
  GetAllProductFail,
  ProductUpdateRequest,
  ProductUpdateSuccess,
  ProductUpdateFail,
  ProductDeleteRequest,
  ProductDeleteSuccess,
  ProductDeleteFail,
  ProductAllDeleteRequest,
  ProductAllDeleteSuccess,
  ProductAllDeleteFail,
  ProductAllRestoreRequest,
  ProductAllRestoreSuccess,
  ProductAllRestoreFail,

  CreateClearSuccess,
  CreateClearError,
} = productSlice.actions;

export default productSlice.reducer;
