import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup,
         Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { map } from 'rxjs/operators';

import { SubmissionSurveyRequest} from '../../interfaces/request-interfaces';
import { QuestionResponse, SurveyResponse } from '../../interfaces/response-interfaces';
import { UserService} from '../../../user/services/user.service';

@Component({
    selector: 'app-answer-survey-dialog',
    standalone: false,
    templateUrl: './answer-survey-dialog.component.html',
    styleUrl: './answer-survey-dialog.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AnswerSurveyDialogComponent  implements OnInit {

    survey!:    SurveyResponse;
    questions!: QuestionResponse[];

    answerForm!: FormGroup;
    loading = true;

    constructor(
        private dialogRef: MatDialogRef<AnswerSurveyDialogComponent>,
        private fb:       FormBuilder,
        private userSvc:  UserService,
        private snack:    MatSnackBar,

        @Inject(MAT_DIALOG_DATA)
        public data: { survey: SurveyResponse }
    ) {
        this.survey = data.survey;
    }

    /* --------------------------- lifecycle --------------------------- */
    ngOnInit(): void {
        this.userSvc.getAllQuestionsFromSurvey(this.survey.id)
            .pipe(map(res => res.data ?? []))
            .subscribe({
                next: qs => {
                    this.questions = qs.sort((a, b) => a.numSequence - b.numSequence);
                    this.buildForm();
                },
                complete: () => this.loading = false
            });
    }

    private buildForm(): void {
        const group: { [k: string]: any } = {};

        this.questions.forEach(q => {
            const key = String(q.numSequence);

            if (q.allowMultipleAnswers) {
                group[key] = this.fb.array(
                    q.questionChoices.map(() => this.fb.control(false)),
                    this.atLeastOneTrue()
                );
            } else {
                group[key] = new FormControl<number | null>(null, Validators.required);
            }
        });

        this.answerForm = this.fb.group(group);
    }

    private atLeastOneTrue(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const arr   = control as FormArray;
            const valid = arr.controls.some(
                ctrl => (ctrl as FormControl<boolean>).value     // true almeno una volta
            );
            return valid ? null : { required: true };
        };
    }

    submit(): void {
        if (this.answerForm.invalid) { this.answerForm.markAllAsTouched(); return; }

        const answers: Record<number, number[]> = {};

        this.questions.forEach(q => {
            const key = String(q.numSequence);
            const ctrl = this.answerForm.get(key)!;

            answers[q.numSequence] =
                q.allowMultipleAnswers
                    ? (ctrl.value as boolean[])
                        .map((v, idx) => (v ? idx + 1 : -1))
                        .filter(n => n !== -1)
                    : [ctrl.value];
        });

        const body: SubmissionSurveyRequest = { surveyId: this.survey.id, answers };

        this.userSvc.submitSurvey(body).subscribe({
            next: (res) => {
                this.snack.open('Risposte inviate, grazie!', 'Chiudi', { duration: 5000 });
                this.dialogRef.close(res?.data?.surveyId);
            },
            error: err => {
                const msg = err?.error?.message || 'Invio non riuscito.';
                this.snack.open(msg, 'Chiudi', { duration: 5000 });
            }
        });
    }

    hasChoiceImage(q: QuestionResponse): boolean {
        return q.questionChoices.some(c => !!c.imageUrl);
    }

    choiceKey(qi: number): string {
        return String(this.questions[qi].numSequence);
    }

    close(): void {
        this.dialogRef.close();
    }

}
