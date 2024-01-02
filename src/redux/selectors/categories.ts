import { RootState } from '../store';

export const selectCategories = (state: RootState) => state.categories.categories;
export const selectCategoriesLoading = (state: RootState) => state.categories.loading;

export const selectUpdateCategoryLoading = (state: RootState) => state.categories.updateCategoryLoading;
export const selectDeleteCategoryLoading = (state: RootState) => state.categories.deleteCategoryLoading;


