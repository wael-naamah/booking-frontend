import { Service } from "./Category";
import { Contact } from "./Contact";

export interface Appointment {
  _id?: string;
  category_id: string;
  service_id: string;
  calendar_id: string;
  start_date: string;
  end_date: string;
  contact: Contact;
  brand_of_device?: string;
  model?: string;
  exhaust_gas_measurement?: boolean;
  has_maintenance_agreement?: boolean;
  has_bgas_before?: boolean;
  year?: string;
  invoice_number?: number;
  attachments?: {
    title: string;
    url: string;
  }[];
  remarks?: string;
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

export interface ContactAppointment extends Appointment {
  service: Service;
}