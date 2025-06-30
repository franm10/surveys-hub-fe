import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contacts',
  standalone: false,
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {

    contactForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.contactForm = this.formBuilder.group({
            name: [null, [Validators.required]],
            email: [null, [Validators.email, Validators.required]],
            object: [null, [Validators.required]],
            description: [null, [Validators.required]]
        })
    }

    contactUs(): void {
        if(this.contactForm.valid)
            this.snackBar.open("Richiesta inviata con successo", 'Chiudi', { duration: 5000 });
        this.contactForm.markAllAsTouched();
        return;
        /*
        if(this.contactForm.valid) {
          this.homeService.contact(this.contactForm.value).subscribe(
            response => {
                this.snackBar.open('Richiesta inviata con successo.', 'Chiudi', { duration: 5000 });
                this.router.navigateByUrl('');
            },
            error => {
              this.snackBar.open("Errore durante l'inoltro della richiesta. Riprovare", 'Chiudi', { duration: 5000, panelClass: 'error-snackbar' });
            });
        }else {
          this.contactForm.markAllAsTouched();
        }
        */
    }
}
