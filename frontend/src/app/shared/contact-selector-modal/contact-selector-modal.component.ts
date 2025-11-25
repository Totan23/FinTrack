import { Component, OnInit, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import type { Contact } from '../../shared/interfaces';

@Component({
    selector: 'app-contact-selector-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './contact-selector-modal.component.html',
    styleUrl: './contact-selector-modal.component.scss'
})
export class ContactSelectorModalComponent implements OnInit {
    @Output() contactSelected = new EventEmitter<string>();
    @Output() exportAll = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    private contactsService = inject(ContactsService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    contacts: Contact[] = [];
    loading = false;
    error: string | null = null;

    // Método que se ejecuta al inicializar el componente
    ngOnInit(): void {
        // Cargar lista de contactos al inicializar
        this.loadContacts();
    }

    // Función para cargar todos los contactos desde la API
    loadContacts(): void {
        // Activar estado de carga, limpiar errores y lista de contactos
        this.loading = true;
        this.error = null;
        this.contacts = [];
        // Forzar detección de cambios para mostrar el loader
        this.cdr.detectChanges();

        // Llamar al servicio para obtener todos los contactos
        this.contactsService.getAllContacts().subscribe({
            next: (contacts) => {
                // Asignar contactos recibidos (o array vacío si es null/undefined)
                this.contacts = contacts || [];
                // Desactivar estado de carga
                this.loading = false;
                // Forzar detección de cambios para actualizar la vista con los contactos
                this.cdr.detectChanges();
            },
            error: (err) => {
                // Si hay error, mostrar mensaje y limpiar lista de contactos
                this.error = `Error al cargar contactos: ${err?.message || err?.statusText || 'Error desconocido'}`;
                this.loading = false;
                this.contacts = [];
                // Forzar detección de cambios para mostrar el error
                this.cdr.detectChanges();
            }
        });
    }

    // Función para seleccionar un contacto y abrir el modal de exportación
    selectContact(contactId: string): void {
        // Emitir el ID del contacto seleccionado para que el componente padre abra el modal de exportación
        this.contactSelected.emit(contactId);
        // Cerrar este modal
        this.closeModal();
    }

    // Función para exportar transacciones de todos los contactos
    exportAllContacts(): void {
        // Emitir evento para que el componente padre exporte todas las transacciones
        this.exportAll.emit();
        // Cerrar este modal
        this.closeModal();
    }

    // Función para cerrar el modal de selección de contactos
    closeModal(): void {
        this.close.emit();
    }
}

