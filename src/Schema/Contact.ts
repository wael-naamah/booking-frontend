export enum Salutation {
  WOMAN = "Mrs",
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
  password?: string;
  note_on_address?: string;
  newsletter?: boolean;
  categories_permission?: string[];
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddContactRequest
  extends Omit<Contact, "_id" | "createdAt" | "updatedAt"> {}
