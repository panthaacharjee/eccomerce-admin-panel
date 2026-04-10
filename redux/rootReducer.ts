import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "@/redux/reducers/userReducer";
import productReducer from "@/redux/reducers/productReducer";
import { categoryReducer } from "./reducers/settingReducer";
import sliderReducer from "./reducers/SliderReducer";
import orderReducer from "./reducers/orderReducer";

const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  category: categoryReducer,
  slider: sliderReducer,
  order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
