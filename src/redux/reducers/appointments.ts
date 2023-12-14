import { Appointment, Calendar } from "../../Schema";
import { AppointmentsAction } from "../actions";

interface CategoriesState {
  timeslots: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[];
  timeslotsLoading: boolean;
  appointments: Appointment[];
  appointmentsLoading: boolean;
  employees: Calendar[];
  employeesLoading: boolean;
}

const initialState: CategoriesState = {
  timeslots: [],
  timeslotsLoading: true,
  appointments: [],
  appointmentsLoading: true,
  employees: [],
  employeesLoading: true,
};

const categoriesReducer = (
  state: CategoriesState = initialState,
  action: AppointmentsAction
): CategoriesState => {
  switch (action.type) {
    case "appointments/GET_TIME_SLOTS":
      return {
        ...state,
        timeslotsLoading: true,
      };
    case "appointments/GET_TIME_SLOTS_DONE":
      return {
        ...state,
        timeslotsLoading: false,
        timeslots: [...action.payload],
      };
    case "appointments/GET_APPOINTMENTS":
      return {
        ...state,
        appointmentsLoading: true,
      };
    case "appointments/GET_APPOINTMENTS_DONE":
      return {
        ...state,
        appointmentsLoading: false,
        appointments: action.payload,
      };
    case "appointments/GET_EMPLOYEES":
      return {
        ...state,
        employeesLoading: true,
      };
    case "appointments/GET_EMPLOYEES_DONE":
      return {
        ...state,
        employeesLoading: false,
        employees: action.payload,
      };
    default:
      return state;
  }
};

export default categoriesReducer;
