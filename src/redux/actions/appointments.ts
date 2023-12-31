import { Dispatch } from "redux";
import {
  Appointment,
  AppointmentForm,
  Calendar,
  Contact,
  PaginatedForm,
} from "../../Schema";
import { API_URL } from "../network/api";

const GET_TIME_SLOTS = "appointments/GET_TIME_SLOTS" as const;
const GET_TIME_SLOTS_DONE = "appointments/GET_TIME_SLOTS_DONE" as const;
const GET_APPOINTMENTS = "appointments/GET_APPOINTMENTS" as const;
const GET_APPOINTMENTS_DONE = "appointments/GET_APPOINTMENTS_DONE" as const;
const GET_EMPLOYEES = "appointments/GET_EMPLOYEES" as const;
const GET_EMPLOYEES_DONE = "appointments/GET_EMPLOYEES_DONE" as const;

export const getTimeSlots = () => ({
  type: GET_TIME_SLOTS,
});

export const getTimeSlotsDone = (
  data: {
    start: string;
    end: string;
    calendar_id: string;
    employee_name: string;
  }[]
) => ({
  type: GET_TIME_SLOTS_DONE,
  payload: data,
});

export const fetchTimeSlots = (
  date: string,
  category_id?: string,
  service_id?: string
) => {
  return async (dispatch: Dispatch) => {
    dispatch(getTimeSlots());

    try {
      const queryparams = new URLSearchParams();
      date && queryparams.append("date", date);
      category_id && queryparams.append("category_id", category_id);
      service_id && queryparams.append("service_id", service_id);

      const response = await fetch(
        `${API_URL}/appointments/timeslots?${queryparams.toString()}`
      );
      const data = await response.json();

      dispatch(getTimeSlotsDone(data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getTimeSlotsDone([]));
    }
  };
};

export const getAppointments = () => ({
  type: GET_APPOINTMENTS,
});

export const getAppointmentsDone = (data: Appointment[]) => ({
  type: GET_APPOINTMENTS_DONE,
  payload: data,
});

export const fetchAppointments = (form: AppointmentForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(getAppointments());

    try {
      const queryparams = new URLSearchParams();
      form.start && queryparams.append("start", form.start);
      form.end && queryparams.append("end", form.end);

      const response = await fetch(
        `${API_URL}/appointments?${queryparams.toString()}`
      );
      const data = await response.json();

      dispatch(getAppointmentsDone(data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getAppointmentsDone([]));
    }
  };
};

export const addAppointment = (
  category_id: string,
  service_id: string,
  calendar_id: string,
  start_date: string,
  end_date: string,
  contact: Contact
) => {
  return async () => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        body: JSON.stringify({
          category_id,
          service_id,
          calendar_id,
          start_date,
          end_date,
          contact,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return null;
    }
  };
};

export const getEmployees = () => ({
  type: GET_EMPLOYEES,
});

export const getEmployeesDone = (data: Calendar[]) => ({
  type: GET_EMPLOYEES_DONE,
  payload: data,
});

export const fetchEmployees = (form: PaginatedForm) => {
  return async (dispatch: Dispatch) => {
    dispatch(getEmployees());

    try {
      const queryparams = new URLSearchParams();
      form.page && queryparams.append("page", form.page.toString());
      form.limit && queryparams.append("limit", form.limit.toString());
      form.search && queryparams.append("search", form.search.toString());

      const response = await fetch(
        `${API_URL}/calendars?${queryparams.toString()}`
      );
      const data = await response.json();

      dispatch(getEmployeesDone(data.data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getEmployeesDone([]));
    }
  };
};

export type AppointmentsAction = ReturnType<
  | typeof getTimeSlots
  | typeof getTimeSlotsDone
  | typeof getAppointments
  | typeof getAppointmentsDone
  | typeof getEmployees
  | typeof getEmployeesDone
>;
