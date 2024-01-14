export interface EmailConfig {
    _id?: string;
    sender: string;
    server: string;
    username: string;
    password: string;
    port: number;
    ssl_enabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SendEmailForm {
    to: string;
    subject: string;
    text: string;
}

export interface AddEmailConfigRequest
  extends Omit<EmailConfig, "_id" | "createdAt" | "updatedAt"> {}
