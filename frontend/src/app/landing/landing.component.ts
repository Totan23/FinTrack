import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactSelectorModalComponent } from '../shared/contact-selector-modal/contact-selector-modal.component';
import { ExportModalComponent } from '../contacts/export-modal/export-modal.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        CommonModule,
        ContactSelectorModalComponent,
        ExportModalComponent
    ],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent {
    private router = inject(Router);

    showContactSelector = false;
    showExportModal = false;
    selectedContactId: string | undefined;

    navigateToContacts(): void {
        this.router.navigate(['/app']);
    }

    navigateToCreateContact(): void {
        this.router.navigate(['/app'], { queryParams: { create: 'true' } });
    }

    openExportModal(): void {
        // Abrir el modal de selección de contactos
        this.showContactSelector = true;
    }

    closeContactSelector(): void {
        this.showContactSelector = false;
    }

    onContactSelected(contactId: string): void {
        // Cerrar el selector y abrir el modal de exportación con el contacto seleccionado
        this.closeContactSelector();
        this.selectedContactId = contactId;
        this.showExportModal = true;
    }

    onExportAll(): void {
        // Cerrar el selector y abrir el modal de exportación sin contactId (exportar todos)
        this.closeContactSelector();
        this.selectedContactId = undefined;
        this.showExportModal = true;
    }

    closeExportModal(): void {
        this.showExportModal = false;
        this.selectedContactId = undefined;
    }
}
