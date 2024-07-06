export interface Contact {
  _id?: string;
  salutation: string;
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
  contract_link?: string;
  sign_url?: string;
  note_on_address?: string;
  newsletter?: boolean;
  categories_permission?: string[];
  remarks?: string;
  imported?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddContactRequest
  extends Omit<Contact, "_id" | "createdAt" | "updatedAt"> {}
