import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ContactSelectorModalComponent } from '../../shared/contact-selector-modal/contact-selector-modal.component';
import { ExportModalComponent } from '../export-modal/export-modal.component';
import type { Contact } from '../../shared/interfaces';

@Component({
    selector: 'app-contact-list',
    standalone: true,
    imports: [
        CommonModule, 
        ContactFormComponent,
        ContactSelectorModalComponent,
        ExportModalComponent
    ],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit {
    private contactsService = inject(ContactsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    contacts: Contact[] = [];
    loading = false;
    error: string | null = null;
    showCreateForm = false;
    
    // Propiedades para controlar los modales de exportación
    showContactSelector = false;
    showExportModal = false;
    selectedContactId: string | undefined;

    // Método que se ejecuta al inicializar el componente
    ngOnInit(): void {
        // Suscribirse a cambios en los query params para verificar si se debe abrir el formulario
        this.route.queryParams.subscribe(params => {
            // Si el query param 'create' es 'true', mostrar el formulario de creación
            if (params['create'] === 'true') {
                this.showCreateForm = true;
            }
        });
        // Cargar lista de contactos al inicializar
        this.loadContacts();
    }

    // Función para cargar todos los contactos desde la API
    loadContacts(): void {
        // Activar estado de carga y limpiar errores previos
        this.loading = true;
        this.error = null;
        // Forzar detección de cambios para actualizar la vista
        this.cdr.detectChanges();

        // Llamar al servicio para obtener todos los contactos
        this.contactsService.getAllContacts().subscribe({
            next: (contacts) => {
                // Asignar contactos recibidos (o array vacío si es null/undefined)
                this.contacts = contacts || [];
                // Desactivar estado de carga
                this.loading = false;
                // Forzar detección de cambios para actualizar la vista con los nuevos datos
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

    // Función para navegar a la vista de perfil de un contacto
    viewContact(id: string | undefined): void {
        // Si el ID existe, navegar a la ruta del perfil del contacto
        if (id) {
            this.router.navigate(['/app/contacts', id]);
        }
    }

    // Función para navegar de vuelta a la página de inicio (landing)
    goToHome(): void {
        this.router.navigate(['/']);
    }

    // Función para mostrar/ocultar el formulario de creación de contacto
    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
    }

    // Función que se ejecuta cuando se crea un contacto exitosamente
    onContactCreated(): void {
        // Ocultar formulario y recargar lista de contactos
        this.showCreateForm = false;
        this.loadContacts();
    }

    // Función para abrir el modal de selección de contactos para exportar
    openExportModal(): void {
        // Abrir el modal de selección de contactos
        this.showContactSelector = true;
    }

    // Función para cerrar el modal de selección de contactos
    closeContactSelector(): void {
        this.showContactSelector = false;
    }

    // Función que se ejecuta cuando se selecciona un contacto para exportar
    onContactSelected(contactId: string): void {
        // Cerrar el selector y abrir el modal de exportación con el contacto seleccionado
        this.closeContactSelector();
        this.selectedContactId = contactId;
        this.showExportModal = true;
    }

    // Función para exportar todas las transacciones (sin contacto específico)
    onExportAll(): void {
        // Cerrar el selector y abrir el modal de exportación sin contactId (exportar todos)
        this.closeContactSelector();
        this.selectedContactId = undefined;
        this.showExportModal = true;
    }

    // Función para cerrar el modal de exportación
    closeExportModal(): void {
        this.showExportModal = false;
        this.selectedContactId = undefined;
    }
}
