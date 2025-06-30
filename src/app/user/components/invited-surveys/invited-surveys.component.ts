import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { SurveyResponse } from '../../../template/interfaces/response-interfaces';
import { QuestionsDialogComponent } from '../../../template/dialog-components/questions-dialog/questions-dialog.component';
import { AnswerSurveyDialogComponent } from '../../../template/dialog-components/answer-survey-dialog/answer-survey-dialog.component';
import { UserService } from '../../services/user.service';
import { InviteTokenComponent } from '../invite-token/invite-token.component';
import {StatsDialogComponent} from '../../../template/dialog-components/stats-dialog/stats-dialog.component';


@Component({
    selector: 'app-invited-surveys',
    standalone: false,
    templateUrl: './invited-surveys.component.html',
    styleUrl: './invited-surveys.component.scss'
})
export class InvitedSurveysComponent implements OnInit, OnDestroy {

    surveys: SurveyResponse[] = [];

    submitted: String[] = [];

    showNoData = false;
    private destroy$ = new Subject<void>();

    constructor(
        private userSvc: UserService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.userSvc.getAllOpenSurveysWhenUserInvited()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.handleNoData())
            )
            .subscribe({
                next: res => {
                    this.surveys = (res.data ?? [])
                        .sort((a, b) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                },
                error: () => this.showNoData = true
            });

        this.userSvc.getAllSubmissionSurveysList()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: res => this.submitted = res.data ?? [],
                error: ()  => this.submitted = []
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private handleNoData(): void {
        timer(1000)                       // milli sec
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.surveys.length === 0) {
                    this.showNoData = true;
                }
            });
    }

    invite(): void {
        this.dialog.open(InviteTokenComponent);
    }

    isAlreadySubmitted(surveyId: string): boolean {
        return this.submitted.includes(surveyId);
    }

    translateStatus(st: string): string {
        switch(st) {
            case 'open':    return 'Aperto';
            case 'closed':  return 'Chiuso';
            default:        return 'Archiviato';
        }
    }

    statusClass(st: string): string {
        switch(st) {
            case 'open':   return 'open';
            case 'closed': return 'closed';
            default:       return 'archived';
        }
    }

    openQuestions(s: SurveyResponse): void {
        this.dialog.open(QuestionsDialogComponent, {
            data: {
                survey: s,
                loadQuestions: (id: string) =>
                    this.userSvc.getAllQuestionsFromSurvey(id).pipe(
                        map(res => res.data ?? [])
                    )
            },
            width: '70vw', maxWidth: '70vw', maxHeight: '80vh'
        });
    }

    statsSurvey(s: SurveyResponse): void {
        this.dialog.open(StatsDialogComponent, {
            data: {
                survey: s,
                loadStats: (id: string) =>
                    this.userSvc.getAllStatsFromSurvey(id).pipe(
                        map(res => res.data ?? [])
                    )
            },
            width: '70vw', maxWidth: '70vw', maxHeight: '80vh'
        });
    }

    answerSurvey(s: SurveyResponse): void {
        const ref = this.dialog.open(AnswerSurveyDialogComponent, {
                                                                data: { survey: s },
                                                                width: '70vw', maxWidth: '70vw', maxHeight: '80vh'
                                                            });
        ref.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((newId?: string) => {
                if( newId ) {
                    this.submitted = [...this.submitted, newId];
                    this.cdRef.markForCheck();
                }
            });
    }

    isDisabledButton(s: SurveyResponse): boolean {
        return s.status !== 'open' || this.isExpired(s);
    }

    isExpired(s: SurveyResponse): boolean {
        return new Date(s.expirationDate) < new Date();
    }
}
