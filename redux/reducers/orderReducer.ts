// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrderState } from "../interfaces/orderInterface";
import { GetAllProductRequest } from "./productReducer";


const initialState: OrderState = {
  status: false,
  loading: false,
  orders: [],
  error: null,
  success: null,
};

interface IOrderResponse {
  orders: Order[];
  message: string;
}


export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
   
    GetAllOrderRequest(state) {
      state.loading = true;
    },
    GetAllOrderSuccess(state, action: PayloadAction<IOrderResponse>) {
      state.loading = false;
      state.orders = action.payload.orders;
    },
    GetAllOrderFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },  

    UpdateOrderStatusRequest(state) {
      state.loading = true;
    },  
    UpdateOrderStatusSuccess(state, action: PayloadAction<IOrderResponse>) {
      state.loading = false;
      state.orders = action.payload.orders;
      state.success = action.payload.message;
    },
    UpdateOrderStatusFail(state, action: PayloadAction<string>) {
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
  GetAllOrderRequest,
  GetAllOrderSuccess,
  GetAllOrderFail,
  UpdateOrderStatusRequest,
  UpdateOrderStatusSuccess,
  UpdateOrderStatusFail,
  CreateClearSuccess,
  CreateClearError
} = orderSlice.actions;

export default orderSlice.reducer;