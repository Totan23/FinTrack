import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import { ExportModalComponent } from '../export-modal/export-modal.component';
import type { ContactProfile, TransactionType } from '../../shared/interfaces';

@Component({
    selector: 'app-contact-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ExportModalComponent],
    templateUrl: './contact-profile.component.html',
    styleUrl: './contact-profile.component.scss'
})
export class ContactProfileComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private contactsService = inject(ContactsService);
    private cdr = inject(ChangeDetectorRef);

    profile: ContactProfile | null = null;
    loading = false;
    error: string | null = null;

    // Operation form
    operationAmount = 0;
    operationType: TransactionType = 'CREDIT' as TransactionType;
    operationLoading = false;
    operationError: string | null = null;

    // Edit mode
    editMode = false;
    editName = '';

    // Export modal
    showExportModal = false;

    contactId: string | null = null;

    // Método que se ejecuta al inicializar el componente
    ngOnInit(): void {
        // Obtener ID del contacto desde los parámetros de la ruta
        this.contactId = this.route.snapshot.paramMap.get('id');
        // Si hay ID, cargar el perfil del contacto
        if (this.contactId) {
            this.loadProfile();
        }
    }

    // Función para cargar el perfil completo del contacto con sus transacciones
    loadProfile(): void {
        // Si no hay contactId, salir de la función
        if (!this.contactId) return;

        // Activar estado de carga y limpiar errores previos
        this.loading = true;
        this.error = null;
        // Forzar detección de cambios para mostrar el loader
        this.cdr.detectChanges();

        // Llamar al servicio para obtener el perfil del contacto
        this.contactsService.getContactProfile(this.contactId).subscribe({
            next: (profile) => {
                // Asignar perfil recibido y establecer nombre para edición
                this.profile = profile;
                this.editName = profile.contact.name;
                // Desactivar estado de carga
                this.loading = false;
                // Forzar detección de cambios para actualizar la vista
                this.cdr.detectChanges();
            },
            error: () => {
                // Si hay error, mostrar mensaje y desactivar carga
                this.error = 'Error al cargar perfil';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // Función para agregar una operación financiera (crédito o débito) al contacto
    addOperation(): void {
        // Validar que haya contactId y que el monto sea mayor a 0
        if (!this.contactId || this.operationAmount <= 0) {
            this.operationError = 'El monto debe ser mayor a 0';
            return;
        }

        // Activar estado de carga de operación y limpiar errores previos
        this.operationLoading = true;
        this.operationError = null;
        // Forzar detección de cambios para mostrar el estado de carga
        this.cdr.detectChanges();

        // Llamar al servicio para agregar la operación
        this.contactsService.addOperation(this.contactId, {
            amount: this.operationAmount,
            type: this.operationType
        }).subscribe({
            next: () => {
                // Si es exitoso, limpiar formulario y recargar perfil
                this.operationLoading = false;
                this.operationAmount = 0;
                this.operationError = null;
                this.cdr.detectChanges();
                // Recargar perfil para mostrar el nuevo balance y la operación agregada
                this.loadProfile();
            },
            error: (err) => {
                // Si hay error, desactivar carga y construir mensaje de error
                this.operationLoading = false;
                
                // Construir mensaje de error completo desde la respuesta del servidor
                let errorMessage = 'Error al agregar operación';
                
                if (err.error) {
                    // Si hay un mensaje de error del servidor, usarlo
                    if (err.error.error) {
                        errorMessage = err.error.error;
                    }
                    
                    // Si hay detalles adicionales, agregarlos al mensaje
                    if (err.error.details) {
                        // Si details es string, agregarlo directamente
                        if (typeof err.error.details === 'string') {
                            errorMessage += `: ${err.error.details}`;
                        } else if (Array.isArray(err.error.details)) {
                            // Si details es array, unir todos los mensajes con comas
                            errorMessage += `: ${err.error.details.join(', ')}`;
                        }
                    }
                }
                
                // Asignar mensaje de error y forzar detección de cambios
                this.operationError = errorMessage;
                this.cdr.detectChanges();
            }
        });
    }

    // Función para activar/desactivar modo de edición del nombre
    toggleEditMode(): void {
        this.editMode = !this.editMode;
        // Si se activa modo edición y hay perfil, establecer nombre actual en el campo de edición
        if (this.profile) {
            this.editName = this.profile.contact.name;
        }
    }

    // Función para guardar el nombre editado del contacto
    saveName(): void {
        // Validar que haya contactId y nombre para guardar
        if (!this.contactId || !this.editName) return;

        // Llamar al servicio para actualizar el nombre
        this.contactsService.updateContactName(this.contactId, { name: this.editName }).subscribe({
            next: () => {
                // Si es exitoso, desactivar modo edición y recargar perfil
                this.editMode = false;
                this.loadProfile();
            },
            error: () => {
                // Error silencioso al actualizar nombre (no se muestra mensaje al usuario)
            }
        });
    }

    // Función para navegar de vuelta a la lista de contactos
    goBack(): void {
        this.router.navigate(['/app']);
    }

    // Función para abrir el modal de exportación de transacciones
    openExportModal(): void {
        this.showExportModal = true;
    }

    // Función para cerrar el modal de exportación de transacciones
    closeExportModal(): void {
        this.showExportModal = false;
    }
}
