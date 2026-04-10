import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISlider, ISliderState } from "../interfaces/settingInterface";

const initialState: ISliderState = {
  error: null,
  success: null,

  slider: [],

  getAllSliderLoading: false,
  SliderCreateLoading: false,
  SliderUpdateLoading: false,
  SliderDeleteLoading: false,
};

interface ISliderRespones {
  slider: ISlider[];
  message: string;
}

export const sliderSlice = createSlice({
  name: "slider",
  initialState,
  reducers: {
    SliderCreateRequest(state) {
      state.SliderCreateLoading = true;
    },
    SliderCreateSuccess(state, action: PayloadAction<ISliderRespones>) {
      state.SliderCreateLoading = false;
      state.success = action.payload.message;
      state.slider = action.payload.slider;
    },
    SliderCreateFail(state, action: PayloadAction<string>) {
      state.SliderCreateLoading = false;
      state.error = action.payload;
    },

    GetAllSliderRequest(state) {
      state.getAllSliderLoading = true;
    },
    GetAllSliderSuccess(state, action: PayloadAction<ISliderRespones>) {
      state.getAllSliderLoading = false;
      state.slider = action.payload.slider;
    },
    GetAllSliderFail(state, action: PayloadAction<string>) {
      state.getAllSliderLoading = false;
      state.error = action.payload;
    },

    SliderUpdateRequest(state) {
      state.SliderUpdateLoading = true;
    },
    SliderUpdateSuccess(state, action: PayloadAction<ISliderRespones>) {
      state.SliderUpdateLoading = false;
      state.success = action.payload.message;
      state.slider = action.payload.slider;
    },
    SliderUpdateFail(state, action: PayloadAction<string>) {
      state.SliderUpdateLoading = false;
      state.error = action.payload;
    },

    SliderDeleteRequest(state) {
      state.SliderDeleteLoading = true;
    },
    SliderDeleteSuccess(state, action: PayloadAction<ISliderRespones>) {
      state.SliderDeleteLoading = false;
      state.success = action.payload.message;
      state.slider = action.payload.slider;
    },
    SliderDeleteFail(state, action: PayloadAction<string>) {
      state.SliderDeleteLoading = false;
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
  SliderCreateRequest,
  SliderCreateSuccess,
  SliderCreateFail,
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
} = sliderSlice.actions;

export default sliderSlice.reducer;
