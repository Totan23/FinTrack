import type { Request, Response } from 'express';
/**
 * Crear una operación (crédito o débito) y actualizar el balance del contacto
 * Usa transacciones MongoDB para garantizar atomicidad
 */
export declare const createOperation: (req: Request, res: Response) => Promise<void>;
/**
 * Listar operaciones de un contacto, ordenadas por fecha DESC
 */
export declare const listOperations: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=operationsController.d.ts.map