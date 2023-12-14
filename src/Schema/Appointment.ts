import { Contact } from "./Contact";

export interface Appointment {
  _id?: string;
  category_id: string;
  service_id: string;
  calendar_id: string;
  start_date: Date;
  end_date: Date;
  contact: Contact;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentForm {
  start: string;
  end: string;
}

export interface AddAppointmentRequest
  extends Omit<Appointment, "_id" | "contact" | "createdAt" | "updatedAt"> {
    contact_id: string;
}
export interface TimeSlotsForm {
  date: string;
  category_id?: string;
  service_id?: string;
}
