// Shared TypeScript types for FinTrack backend

export interface IContact {
  _id?: string;
  email: string;
  name: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface ITransaction {
  _id?: string;
  contactId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  createdAt?: Date;
}

export interface IContactProfile {
  contact: IContact;
  operations: ITransaction[];
}

export interface IOperationRequest {
  amount: number;
  type: TransactionType;
}

export interface ICreateContactRequest {
  email: string;
  name: string;
}

export interface IUpdateContactRequest {
  name: string;
}

export interface IExportQuery {
  contactId?: string;
  startDate?: string;
  noStartLimit?: boolean;
  endDate?: string;
  untilNow?: boolean;
}
