import type { IContact, IContactProfile, ICreateContactRequest, IUpdateContactRequest, IOperationRequest } from '../types/types.js';
export declare class ContactService {
    createContact(data: ICreateContactRequest): Promise<IContact>;
    getAllContacts(): Promise<IContact[]>;
    getContactById(id: string): Promise<IContact | null>;
    updateContactName(id: string, data: IUpdateContactRequest): Promise<IContact | null>;
    addOperation(contactId: string, operation: IOperationRequest): Promise<IContact>;
    private addOperationWithTransaction;
    private addOperationWithoutTransaction;
    getContactProfile(id: string): Promise<IContactProfile | null>;
    validateBalance(contactId: string): Promise<{
        valid: boolean;
        storedBalance: number;
        calculatedBalance: number;
        difference: number;
        transactionCount: number;
    }>;
}
//# sourceMappingURL=contactService.d.ts.map