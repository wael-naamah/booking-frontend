import { combineReducers } from "redux";
import categoriesReducer from "./reducers/categories";
import appointmentsReducer from "./reducers/appointments";

const rootReducer = combineReducers({
  categories: categoriesReducer,
  appointments: appointmentsReducer,
});

export default rootReducer;
