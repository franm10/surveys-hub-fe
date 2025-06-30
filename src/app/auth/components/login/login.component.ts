import { Component, EventEmitter, Inject, OnInit, Optional, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    standalone: false
})
export class LoginComponent implements OnInit {

    @Output() loginCompleted = new EventEmitter<void>();

    isDialog = false;

    loginForm!: FormGroup;

    hidePassword = true;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private router: Router,
        private authService: AuthService,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
        this.isDialog = !!this.data?.isDialog;
        this.loginForm = this.formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]]
        });
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    async loginEmail(): Promise<void> {
        if (this.loginForm.invalid)
            return;

        const {email, password} = this.loginForm.value;
        try {
            await this.authService.login(email!, password!);
            this.snackBar.open("Login effettuato con successo!", 'Chiudi', {duration: 5000});
            this.router.navigateByUrl('/');
        } catch {
            this.snackBar.open("Utente non registrato e/o credenziali errate.", 'Chiudi', {
                duration: 5000,
                panelClass: 'error-snackbar'
            });
            this.loginForm.reset();
        }
        this.loginCompleted.emit();
    }

    async loginGoogle(): Promise<void> {
        try {
            await this.authService.loginWithGoogle();
            this.snackBar.open("Login effettuato con successo!", 'Chiudi', {duration: 5000});
            this.router.navigateByUrl('/');
        } catch {
            this.snackBar.open("Qualcosa è andato storto. Riprovare.", 'Chiudi', {
                duration: 5000,
                panelClass: 'error-snackbar'
            });
        }
        this.loginCompleted.emit();
    }

    signup(): void {
        this.loginCompleted.emit();
        this.router.navigateByUrl('/signup');
    }

}
