import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { SurveyResponse } from '../../interfaces/response-interfaces';
import { SurveyParamsRequest } from '../../interfaces/request-interfaces';
import { UserService } from '../../../user/services/user.service';

@Component({
    selector: 'app-survey-settings-dialog',
    standalone: false,
    templateUrl: './survey-settings-dialog.component.html',
    styleUrl: './survey-settings-dialog.component.scss'
})
export class SurveySettingsDialogComponent implements OnInit {

    survey!: SurveyResponse;

    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<SurveySettingsDialogComponent, SurveyResponse>,

        @Inject(MAT_DIALOG_DATA)
        public data: { survey: SurveyResponse }
    ) {
        this.survey = data.survey;
    }

    ngOnInit() {
        const expDate = new Date(this.survey.expirationDate);
        const hh = String(expDate.getHours()).padStart(2, '0');
        const mm = String(expDate.getMinutes()).padStart(2, '0');
        this.form = this.fb.group({
            status:         [this.survey.status,       [Validators.required]],
            visibility:     [this.survey.visibility,   [Validators.required]],
            expirationDate: [expDate,                  [Validators.required]],
            expirationTime: [`${hh}:${mm}`,            [Validators.required]]
        });
    }

    close(): void {
        this.dialogRef.close();
    }

    save(): void {
        if( this.form.invalid ) {
            return;
        }

        const date: Date = this.form.value.expirationDate;
        const [hours, minutes] = (this.form.value.expirationTime as string).split(':').map(v => +v);
        date.setHours(hours, minutes, 0, 0);

        const payload: SurveyParamsRequest = {
            status: this.form.value.status,
            visibility: this.form.value.visibility,
            expirationDate: (this.form.value.expirationDate as Date).toISOString()
        };

        this.userService
            .updateSurveySettings(this.survey.id, payload)
            .pipe(
                catchError(err => {
                    const msg = err.error?.message || 'Errore imprevisto';
                    this.snackBar.open(msg, 'Chiudi', { duration: 5000 });
                    return throwError(() => err);
                })
            )
            .subscribe(apiResp => {
                if (apiResp.data) {
                    this.snackBar.open("Impostazioni aggiornate!", 'Chiudi', { duration: 3000 });
                    this.dialogRef.close(apiResp.data);
                } else {
                    this.snackBar.open("Nessuna modifica applicata", 'Chiudi', { duration: 3000 });
                    this.dialogRef.close();
                }
            });
    }
}
