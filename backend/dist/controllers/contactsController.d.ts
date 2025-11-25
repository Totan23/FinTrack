import type { Request, Response } from 'express';
/**
 * Crear un nuevo contacto
 */
export declare const createContact: (req: Request, res: Response) => Promise<void>;
/**
 * Listar todos los contactos
 */
export declare const listContacts: (_req: Request, res: Response) => Promise<void>;
/**
 * Obtener un contacto por ID con sus operaciones (opcional, paginadas)
 */
export declare const getContactById: (req: Request, res: Response) => Promise<void>;
/**
 * Actualizar solo el nombre de un contacto
 */
export declare const updateContact: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=contactsController.d.ts.map