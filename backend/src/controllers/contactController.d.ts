import type { Request, Response } from 'express';
export declare class ContactController {
    createContact(req: Request, res: Response): Promise<void>;
    getAllContacts(req: Request, res: Response): Promise<void>;
    getContactById(req: Request, res: Response): Promise<void>;
    updateContactName(req: Request, res: Response): Promise<void>;
    addOperation(req: Request, res: Response): Promise<void>;
    getContactProfile(req: Request, res: Response): Promise<void>;
    validateBalance(req: Request, res: Response): Promise<void>;
}
