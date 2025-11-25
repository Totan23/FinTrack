import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { ExportQuery } from '../shared/interfaces';

// Servicio Angular para gestionar la exportación de transacciones
@Injectable({
    providedIn: 'root'
})
export class TransactionsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/transactions';

    // Exporta transacciones a CSV, retorna un Blob que puede ser descargado
    exportTransactions(query: ExportQuery): Observable<Blob> {
        const params: any = {
            noStartLimit: query.noStartLimit ? 'true' : 'false',
            untilNow: query.untilNow ? 'true' : 'false'
        };

        if (query.contactId) {
            params.contactId = query.contactId;
        }
        if (query.startDate && !query.noStartLimit) {
            params.startDate = query.startDate;
        }
        if (query.endDate && !query.untilNow) {
            params.endDate = query.endDate;
        }

        return this.http.get(`${this.apiUrl}/export`, {
            params,
            responseType: 'blob'
        });
    }

    // Genera el nombre del archivo CSV basado en el contacto
    generateFilename(contactName: string | null, contactId: string | null): string {
        if (contactName) {
            const sanitizedName = contactName
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .trim()
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .filter(word => word.length > 0)
                .join('');
            
            return `${sanitizedName}TransactionsHistory.csv`;
        } else if (contactId) {
            return `ContactTransactionsHistory.csv`;
        } else {
            return 'AllTransactionsHistory.csv';
        }
    }

    // Descarga un archivo CSV desde un Blob creando un enlace temporal
    downloadCSV(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
