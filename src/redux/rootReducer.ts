import { combineReducers } from "redux";
import categoriesReducer from "./reducers/categories";
import appointmentsReducer from "./reducers/appointments";
import authReducer from "./reducers/auth";
import calendarsReducer from "./reducers/calendars";
import schedulesReducer from "./reducers/schedules";

const rootReducer = combineReducers({
  categories: categoriesReducer,
  appointments: appointmentsReducer,
  auth: authReducer,
  calendars: calendarsReducer,
  schedules: schedulesReducer,
});

export default rootReducer;
