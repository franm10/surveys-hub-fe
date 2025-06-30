import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: false
})
export class FooterComponent implements OnInit {

    newsletterForm!: FormGroup;

    userRole$: Observable<'admin' | 'user' | null>;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        this.userRole$ = this.authService.userRole$;
    }

    ngOnInit(): void {
        this.newsletterForm = this.formBuilder.group({
            email: [null, [Validators.required, Validators.email]]
        });
    }

    newsletterSubscribe(): void {
        this.snackBar.open('Attualmente non disponibile.', 'Chiudi', { duration: 7500 });
    }

}
