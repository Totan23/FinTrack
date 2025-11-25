import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../services/contacts.service';

@Component({
    selector: 'app-contact-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-form.component.html'
})
export class ContactFormComponent {
    @Output() contactCreated = new EventEmitter<void>();

    private contactsService = inject(ContactsService);

    email = '';
    name = '';
    loading = false;
    error: string | null = null;
    
    // Mensajes de error específicos para cada campo
    emailError: string | null = null;
    nameError: string | null = null;

    // Función para validar el formato del email
    validateEmail(): void {
        // Limpiar error previo
        this.emailError = null;
        
        // Si el campo está vacío, no validar (se validará al enviar)
        if (!this.email || this.email.trim() === '') {
            return;
        }
        
        const emailTrimmed = this.email.trim();
        
        // Validar que tenga al menos un carácter antes del @
        if (!emailTrimmed.includes('@')) {
            this.emailError = 'El email debe contener el símbolo @';
            return;
        }
        
        // Dividir email en partes (antes y después del @)
        const parts = emailTrimmed.split('@');
        
        // Validar que solo haya un @
        if (parts.length !== 2) {
            this.emailError = 'El email solo puede contener un símbolo @';
            return;
        }
        
        const [localPart, domain] = parts;
        
        // Validar parte local (antes del @)
        if (!localPart || localPart.length === 0) {
            this.emailError = 'Debe haber al menos un carácter antes del @';
            return;
        }
        
        // Validar dominio (después del @)
        if (!domain || domain.length === 0) {
            this.emailError = 'Debe haber un dominio después del @ (ejemplo: gmail.com)';
            return;
        }
        
        // Validar que el dominio tenga al menos un punto
        if (!domain.includes('.')) {
            this.emailError = 'El dominio debe contener al menos un punto (ejemplo: gmail.com)';
            return;
        }
        
        // Validar que el dominio tenga una extensión válida
        const domainParts = domain.split('.');
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
            this.emailError = 'El dominio debe tener una extensión válida (ejemplo: .com, .org)';
            return;
        }
        
        // Validar formato completo con regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            this.emailError = 'El formato del email no es válido';
            return;
        }
        
        // Validar que termine en @gmail.com (según requisitos anteriores)
        if (!emailTrimmed.toLowerCase().endsWith('@gmail.com')) {
            this.emailError = 'El email debe terminar en @gmail.com';
            return;
        }
    }

    // Función para validar el nombre
    validateName(): void {
        // Limpiar error previo
        this.nameError = null;
        
        // Si el campo está vacío, no validar (se validará al enviar)
        if (!this.name || this.name.trim() === '') {
            return;
        }
        
        const nameTrimmed = this.name.trim();
        
        // Validar longitud mínima
        if (nameTrimmed.length < 2) {
            this.nameError = 'El nombre debe tener al menos 2 caracteres';
            return;
        }
        
        // Validar que solo contenga letras, espacios y acentos
        // Permitir letras (a-z, A-Z), espacios, y caracteres acentuados comunes
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!nameRegex.test(nameTrimmed)) {
            this.nameError = 'El nombre solo puede contener letras y espacios (sin números ni caracteres especiales)';
            return;
        }
        
        // Validar que no sea solo espacios
        if (nameTrimmed.replace(/\s/g, '').length === 0) {
            this.nameError = 'El nombre no puede ser solo espacios';
            return;
        }
    }

    // Función para verificar si hay errores de validación
    hasErrors(): boolean {
        return this.emailError !== null || this.nameError !== null || 
               !this.email || this.email.trim() === '' || 
               !this.name || this.name.trim() === '';
    }

    // Función que se ejecuta al enviar el formulario de creación de contacto
    onSubmit(): void {
        // Limpiar errores previos
        this.error = null;
        this.emailError = null;
        this.nameError = null;
        
        // Validar campos vacíos
        if (!this.email || this.email.trim() === '') {
            this.emailError = 'El email es obligatorio';
            return;
        }
        
        if (!this.name || this.name.trim() === '') {
            this.nameError = 'El nombre es obligatorio';
            return;
        }
        
        // Validar formato de email
        this.validateEmail();
        if (this.emailError) {
            return;
        }
        
        // Validar formato de nombre
        this.validateName();
        if (this.nameError) {
            return;
        }
        
        // Si hay errores, no continuar
        if (this.hasErrors()) {
            return;
        }

        // Activar estado de carga
        this.loading = true;

        // Llamar al servicio para crear el contacto con valores trimmeados
        this.contactsService.createContact({ 
            email: this.email.trim(), 
            name: this.name.trim() 
        }).subscribe({
            next: () => {
                // Si es exitoso, limpiar formulario y emitir evento de contacto creado
                this.loading = false;
                this.email = '';
                this.name = '';
                this.error = null;
                this.emailError = null;
                this.nameError = null;
                // Emitir evento para notificar al componente padre que se creó un contacto
                this.contactCreated.emit();
            },
            error: (err) => {
                // Si hay error, desactivar carga y construir mensaje de error
                this.loading = false;
                
                // Construir mensaje de error completo desde la respuesta del servidor
                let errorMessage = 'Error al crear contacto';
                
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
                
                // Asignar mensaje de error para mostrarlo en la vista
                this.error = errorMessage;
            }
        });
    }
}
