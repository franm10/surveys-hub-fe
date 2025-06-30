import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { SurveyInfoDialogComponent } from '../../../template/dialog-components/survey-info-dialog/survey-info-dialog.component';

@Component({
  selector: 'app-invite-token',
  standalone: false,
  templateUrl: './invite-token.component.html',
  styleUrl: './invite-token.component.scss'
})
export class InviteTokenComponent implements OnInit {

    inputForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<InviteTokenComponent>,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.inputForm = this.fb.group({
            token: ['', Validators.required]
        });
    }

    submitInviteToken(): void {
        if( this.inputForm.invalid )
            return;

        const token = this.inputForm.value.token;

        this.userService.submitInviteToken(token).subscribe({
            next: (response) => {
                const survey = response.data;
                if( survey?.id ) {
                    this.snackBar.open("Codice di invito valido. Richiesta approvata.", 'Chiudi', { duration: 5000 });
                    this.dialog.open(SurveyInfoDialogComponent, { width: '500px', data: { survey: survey } });
                    this.dialogRef.close();
                }
                else {
                    this.snackBar.open("Codice di invito valido. Richiesta in approvazione.", 'Chiudi', {duration: 6000});
                    this.dialogRef.close();
                }
            },
            error: (error) => {
                if( error.status === 422 )
                    this.snackBar.open("Codice di invito già utilizzato.", 'Chiudi', { duration: 5000 });
                else if( error.status === 400 || error.status === 409 )
                    this.snackBar.open("Codice di invito scaduto e/o non valido.", 'Chiudi', { duration: 5000 });
                else
                    this.snackBar.open("Richiesta non andata a buon fine. Riprovare più tardi.", 'Chiudi', { duration: 5000 });
                this.inputForm.reset();
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

}
