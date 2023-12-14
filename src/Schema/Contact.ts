export enum Salutation {
  WOMAN = "Mrs.",
  MISTER = "Mr",
  COMPANY = "Company",
}

export interface Contact {
  _id?: string;
  salutation: Salutation;
  first_name: string;
  last_name: string;
  address: string;
  zip_code: string;
  location: string;
  telephone: string;
  phone_numbber_2?: string;
  phone_numbber_3?: string;
  email: string;
  note_on_address?: string;
  brand_of_device?: string;
  model?: string;
  exhaust_gas_measurement?: boolean;
  has_maintenance_agreement?: boolean;
  has_bgas_before?: boolean;
  year?: string;
  invoice_number?: number;
  newsletter?: boolean;
  remarks?: string;
  attachments?: {
    title: string;
    url: string;
  }[];
  categories_permission?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddContactRequest
  extends Omit<Contact, "_id" | "createdAt" | "updatedAt"> {}
