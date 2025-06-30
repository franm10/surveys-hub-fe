import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: false,
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {

    signupForm!: FormGroup;
    hidePassword = true;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.signupForm = this.formBuilder.group({
            name: [null, [Validators.required]],
            surname: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, this.passwordStrengthValidator()]],
            confirmPassword: [null, [Validators.required]]
        }, { validators: this.passwordsMatchValidator });
    }

    async onSubmit(): Promise<void> {
        if( this.signupForm.invalid ) {
            this.signupForm.markAllAsTouched();
            return;
        }

        const fullName = this.signupForm.get('name')?.value + ' ' + this.signupForm.get('surname')?.value;
        const { email, password } = this.signupForm.value;

        try {
            await this.authService.signup(fullName, email, password);
            this.snackBar.open("Registrazione completata!", 'Chiudi', { duration: 5000 });
            this.router.navigateByUrl("/login");
        } catch( error:any ) {
            this.snackBar.open("La registrazione non è andata a buon fine. Riprovare.", 'Chiudi', { duration: 5000, panelClass:'error-snackbar' });
        }
    }

    /**
     *      PASSWORD FIELD UTILITIES
     * */
    private passwordsMatchValidator: ValidatorFn = (group: AbstractControl) => {
        const passwordControl = group.get('password');
        const confirmPasswordControl = group.get('confirmPassword');
        if (!passwordControl || !confirmPasswordControl)
            return null;

        if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordsMismatch'])
            return null;

        if (passwordControl.value !== confirmPasswordControl.value) {
            confirmPasswordControl.setErrors({ passwordsMismatch: true });
            return { passwordsMismatch: true };
        } else {
            confirmPasswordControl.setErrors(null);
            return null;
        }
    };

    private passwordStrengthValidator(): ValidatorFn {
        return (control: AbstractControl) => {
            const value = control.value;
            if (!value) return null;

            // Regex:
            // - minimo 8 caratteri
            // - almeno 1 maiuscola
            // - almeno 1 minuscola
            // - almeno 1 numero o simbolo
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;

            const valid = regex.test(value);
            return valid ? null : { weakPassword: true };
        };
    }

    passwordContainsUppercase(): boolean {
        const pw = this.signupForm.get('password')?.value || '';
        return /[A-Z]/.test(pw);
    }

    passwordContainsLowercase(): boolean {
        const pw = this.signupForm.get('password')?.value || '';
        return /[a-z]/.test(pw);
    }

    passwordContainsNumberOrSpecial(): boolean {
        const pw = this.signupForm.get('password')?.value || '';
        return /[\d\W]/.test(pw);
    }

    passwordMinLength(): boolean {
        const pw = this.signupForm.get('password')?.value || '';
        return pw.length >= 8;
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

}
