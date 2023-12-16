import { combineReducers } from "redux";
import categoriesReducer from "./reducers/categories";
import appointmentsReducer from "./reducers/appointments";
import authReducer from "./reducers/auth";

const rootReducer = combineReducers({
  categories: categoriesReducer,
  appointments: appointmentsReducer,
  auth: authReducer,
});

export default rootReducer;
