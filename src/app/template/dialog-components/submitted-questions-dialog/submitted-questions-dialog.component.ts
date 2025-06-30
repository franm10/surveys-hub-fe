import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

import { UserService } from '../../../user/services/user.service';
import { SurveyResponse, QuestionResponse, SubmissionSurveyCompleteResponse } from '../../interfaces/response-interfaces';

@Component({
  selector: 'app-submitted-questions-dialog',
  standalone: false,
  templateUrl: './submitted-questions-dialog.component.html',
  styleUrl: './submitted-questions-dialog.component.scss'
})
export class SubmittedQuestionsDialogComponent implements OnInit {

    survey!: SurveyResponse;
    questions: QuestionResponse[] = [];

    loading = true;

    constructor(
        private dialogRef: MatDialogRef<SubmittedQuestionsDialogComponent>,
        private userSvc:  UserService,

        @Inject(MAT_DIALOG_DATA)
        public data: { survey: SurveyResponse }
    ) {
        this.survey = data.survey;
    }

    ngOnInit(): void {
        this.userSvc.getSubmissionSurvey(this.survey.id)
            .pipe(map(res => res.data?.answers ?? []))
            .subscribe({
                next: qs => {
                    this.questions = qs.sort((a, b) => a.numSequence - b.numSequence);
                },
                complete: () => this.loading = false
            });
    }

    hasChoiceImage(q: QuestionResponse): boolean {
        return q.questionChoices.some(c => !!c.imageUrl);
    }

    close(): void {
        this.dialogRef.close();
    }

}
