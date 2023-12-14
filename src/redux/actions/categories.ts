import { Category } from "../../Schema";
import { Dispatch } from "redux";

const GET_CATEGORIES = "categories/GET_ALL" as const;
const GET_CATEGORIES_DONE = "categories/GET_ALL_DONE" as const;

export const getCategories = () => ({
  type: GET_CATEGORIES,
});

export const getCategoriesDone = (data: Category[]) => ({
  type: GET_CATEGORIES_DONE,
  payload: data,
});

export const fetchCategories = (page: number = 1, limit: number = 10) => {
  return async (dispatch: Dispatch) => {
    dispatch(getCategories());

    try {
      const response = await fetch(
        `http://localhost:11700/categories?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      dispatch(getCategoriesDone(data.data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getCategoriesDone([]));
    }
  };
};

export type CategoriesAction = ReturnType<
  typeof getCategories | typeof getCategoriesDone
>;
