import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
    Contact,
    ContactProfile,
    CreateContactRequest,
    UpdateContactRequest,
    OperationRequest
} from '../shared/interfaces';

// Servicio Angular para gestionar las operaciones de contactos
@Injectable({
    providedIn: 'root'
})
export class ContactsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/contacts';

    // Crea un nuevo contacto
    createContact(data: CreateContactRequest): Observable<Contact> {
        return this.http.post<Contact>(this.apiUrl, data);
    }

    // Obtiene todos los contactos
    getAllContacts(): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.apiUrl);
    }

    // Obtiene un contacto específico por ID
    getContactById(id: string): Observable<Contact> {
        return this.http.get<Contact>(`${this.apiUrl}/${id}`);
    }

    // Actualiza únicamente el nombre de un contacto
    updateContactName(id: string, data: UpdateContactRequest): Observable<Contact> {
        return this.http.patch<Contact>(`${this.apiUrl}/${id}`, data);
    }

    // Agrega una operación financiera (crédito o débito) a un contacto
    addOperation(id: string, operation: OperationRequest): Observable<Contact> {
        return this.http.post<Contact>(`${this.apiUrl}/${id}/operations`, operation);
    }

    // Obtiene el perfil completo de un contacto con todas sus transacciones
    getContactProfile(id: string): Observable<ContactProfile> {
        return this.http.get<ContactProfile>(`${this.apiUrl}/${id}/profile`);
    }

    // Valida la consistencia del balance de un contacto
    validateBalance(id: string): Observable<{ valid: boolean }> {
        return this.http.get<{ valid: boolean }>(`${this.apiUrl}/${id}/validate-balance`);
    }
}
