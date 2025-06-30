import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { SurveyResponse, QuestionResponse } from '../../interfaces/response-interfaces';

@Component({
  selector: 'app-questions-dialog',
  standalone: false,
  templateUrl: './questions-dialog.component.html',
  styleUrl: './questions-dialog.component.scss'
})
export class QuestionsDialogComponent implements OnInit {

    survey!: SurveyResponse;
    questions: QuestionResponse[] = [];

    loading = true;

    constructor(
        private dialogRef: MatDialogRef<QuestionsDialogComponent>,

        @Inject(MAT_DIALOG_DATA)
        public data: {
            survey: SurveyResponse;
            loadQuestions: (id: string) => Observable<QuestionResponse[]>;
        }
    ) {
        this.survey = data.survey;
    }

    ngOnInit(): void {
        this.data.loadQuestions(this.survey.id)
            .subscribe({
                next: list =>
                    this.questions = list.sort((a, b) => a.numSequence - b.numSequence),
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
