// Shared TypeScript interfaces matching backend types

export interface Contact {
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

export interface Transaction {
    _id?: string;
    contactId: string;
    amount: number;
    type: TransactionType;
    description?: string;
    createdAt?: Date;
}

export interface ContactProfile {
    contact: Contact;
    operations: Transaction[];
}

export interface OperationRequest {
    amount: number;
    type: TransactionType;
}

export interface CreateContactRequest {
    email: string;
    name: string;
}

export interface UpdateContactRequest {
    name: string;
}

export interface ExportQuery {
    contactId?: string;
    startDate?: string;
    noStartLimit?: boolean;
    endDate?: string;
    untilNow?: boolean;
}
