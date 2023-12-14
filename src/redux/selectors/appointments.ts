import { RootState } from '../store';

export const selectTimeslots = (state: RootState) => state.appointments.timeslots;
export const selectTimeslotsLoading = (state: RootState) => state.appointments.timeslotsLoading;


export const selectAppointments = (state: RootState) => state.appointments.appointments;
export const selectAppointmentsLoading = (state: RootState) => state.appointments.appointmentsLoading;


export const selectEmployees = (state: RootState) => state.appointments.employees;
export const selectEmployeesLoading = (state: RootState) => state.appointments.employeesLoading;
