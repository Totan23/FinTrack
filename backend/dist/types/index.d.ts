import { Types } from 'mongoose';
/**
 * Tipo de operación financiera
 */
export type OperationType = 'credit' | 'debit';
/**
 * Interfaz para Contact
 */
export interface IContact {
    _id?: Types.ObjectId;
    email: string;
    name: string;
    balance: number;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Interfaz para Operation
 */
export interface IOperation {
    _id?: Types.ObjectId;
    contactId: Types.ObjectId;
    amount: number;
    type: OperationType;
    description?: string;
    createdAt?: Date;
}
/**
 * DTO para crear un contacto
 */
export interface CreateContactDTO {
    email: string;
    name: string;
}
/**
 * DTO para actualizar un contacto (solo nombre)
 */
export interface UpdateContactDTO {
    name: string;
}
/**
 * DTO para crear una operación
 */
export interface CreateOperationDTO {
    amount: number;
    type: OperationType;
    description?: string;
}
/**
 * DTO para exportación de transacciones
 */
export interface ExportOperationsQuery {
    startDate?: string;
    endDate?: string;
    fromStart?: boolean;
    untilNow?: boolean;
}
//# sourceMappingURL=index.d.ts.map