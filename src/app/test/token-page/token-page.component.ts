import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-token-page',
    standalone: false,
    templateUrl: './token-page.component.html',
    styleUrl: './token-page.component.scss'
})
export class TokenPageComponent implements OnInit {

    token: string | null = null;
    tokenHeader: any = null;
    tokenPayload: any = null;
    error: string | null = null;

    constructor(
        private auth: Auth,
        private snackBar: MatSnackBar
    ) {
    }

    async ngOnInit() {
        const user = this.auth.currentUser;

        if (!user) {
            this.error = 'Utente non autenticato.';
            return;
        }

        try {
            const idToken = await user.getIdToken();
            this.token = idToken;
            const parts = idToken.split('.');
            if (parts.length !== 3) {
                this.error = 'Token non valido.';
                return;
            }
            this.tokenHeader = this.decodeJwtPart(parts[0]);
            this.tokenPayload = this.decodeJwtPart(parts[1]);
        } catch (err) {
            this.error = 'Errore nel recupero del token.';
        }
    }

    private decodeJwtPart(part: string): any {
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(json);
    }

    copyToken(): void {
        if( !this.token )
            return;
        navigator.clipboard.writeText(this.token).then(() => {
            this.snackBar.open('Token copiato negli appunti.', 'Chiudi', { duration: 5000 });
        }).catch();
    }

    truncateToken(token: string, length: number = 40): string {
        if (!token) return '';
        return token.length > length ? token.substring(0, length) + '...' : token;
    }

}
