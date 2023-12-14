import { Category } from "../../Schema";
import { CategoriesAction } from "../actions";

interface CategoriesState {
  categories: Category[];
  loading: boolean;
}

const initialState: CategoriesState = {
  categories: [],
  loading: true,
};

const categoriesReducer = (
  state: CategoriesState = initialState,
  action: CategoriesAction
): CategoriesState => {
  switch (action.type) {
    case "categories/GET_ALL":
      return {
        ...state,
        loading: true,
      };
    case "categories/GET_ALL_DONE":
      return {
        ...state,
        loading: false,
        categories: action.payload,
      };
    default:
      return state;
  }
};

export default categoriesReducer;
