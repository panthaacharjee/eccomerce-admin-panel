export interface ISubLabel {
  _id: string;
  title: string;
  createdAt: string;
}

export interface ICategory {
  _id: string;
  main_label: string;
  sub_label: ISubLabel[];
  category_image: {
    url: string;
  };
  navmenu: boolean;
  category_menu: boolean;
  used_count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryState {
  success: string | null;
  error: string | null;
  categories: ICategory[];
  sub_label: ISubLabel[];

  getAllSubLabelLoading: boolean;
  getAllCategoryLoading: boolean;
  subLabelCreateLoading: boolean;
  subLabelUpdateLoading: boolean;
  subLabelDeleteLoading: boolean;
  categoryCreateLoading: boolean;
  categoryUpdateLoading: boolean;
  categoryDeleteLoading: boolean;
}

export interface ISlider {
  _id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  url?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISliderState {
  success: string | null;
  error: string | null;
  slider: ISlider[];

  getAllSliderLoading: boolean;
  SliderCreateLoading: boolean;
  SliderUpdateLoading: boolean;
  SliderDeleteLoading: boolean;
}
