import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SurveyResponse } from '../../interfaces/response-interfaces';

@Component({
  selector: 'app-survey-info-dialog',
  standalone: false,
  templateUrl: './survey-info-dialog.component.html',
  styleUrl: './survey-info-dialog.component.scss'
})
export class SurveyInfoDialogComponent {

    survey!: SurveyResponse;

    constructor(
        private dialogRef: MatDialogRef<SurveyInfoDialogComponent>,

        @Inject(MAT_DIALOG_DATA)
        public data: { survey: SurveyResponse }
    ) {
        this.survey = data.survey;
    }

    translateStatus(): string {
        switch(this.survey.status) {
            case 'open':    return 'Aperto';
            case 'closed':  return 'Chiuso';
            default:        return 'Archiviato';
        }
    }

    statusClass(): string {
        switch(this.survey.status) {
            case 'open':   return 'open';
            case 'closed': return 'closed';
            default:       return 'archived';
        }
    }

    close(): void {
        this.dialogRef.close();
    }

}
