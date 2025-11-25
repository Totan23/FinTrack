import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionsService } from '../../services/transactions.service';
import { ContactsService } from '../../services/contacts.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-export-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './export-modal.component.html',
    styleUrl: './export-modal.component.scss'
})
export class ExportModalComponent implements OnInit {
    @Input() contactId?: string;
    @Input() contactName?: string; // Permitir pasar el nombre directamente
    @Output() close = new EventEmitter<void>();

    private transactionsService = inject(TransactionsService);
    private contactsService = inject(ContactsService);

    noStartLimit = false;
    startDate = '';
    untilNow = true;
    endDate = '';
    loading = false;
    error: string | null = null;
    resolvedContactName: string | null = null;

    // Método que se ejecuta al inicializar el componente
    ngOnInit(): void {
        // Si ya se pasó el nombre del contacto como input, usarlo directamente
        if (this.contactName) {
            this.resolvedContactName = this.contactName;
        } else if (this.contactId) {
            // Si no hay nombre pero sí hay contactId, obtener el nombre del contacto desde la API
            this.contactsService.getContactById(this.contactId).subscribe({
                next: (contact) => {
                    // Asignar nombre del contacto obtenido
                    this.resolvedContactName = contact.name;
                },
                error: (err) => {
                    // Si hay error al obtener el contacto, continuar sin el nombre (se usará el ID)
                }
            });
        }
    }

    // Función para exportar transacciones a CSV con los filtros seleccionados
    export(): void {
        // Activar estado de carga y limpiar errores previos
        this.loading = true;
        this.error = null;

        // Construir objeto de consulta con todos los filtros del formulario
        const query = {
            contactId: this.contactId,
            noStartLimit: this.noStartLimit,
            startDate: this.startDate,
            untilNow: this.untilNow,
            endDate: this.endDate
        };

        // Llamar al servicio para exportar transacciones
        this.transactionsService.exportTransactions(query).subscribe({
            next: (blob) => {
                // Generar el nombre del archivo en el frontend usando el nombre del contacto
                const filename = this.transactionsService.generateFilename(
                    this.resolvedContactName,
                    this.contactId || null
                );
                
                // Descargar el archivo CSV con el nombre generado
                this.transactionsService.downloadCSV(blob, filename);
                // Desactivar carga y cerrar el modal
                this.loading = false;
                this.close.emit();
            },
            error: (err) => {
                // Si hay error, mostrar mensaje y desactivar carga
                this.error = 'Error al exportar transacciones';
                this.loading = false;
            }
        });
    }

    // Función para cerrar el modal de exportación
    closeModal(): void {
        this.close.emit();
    }
}
