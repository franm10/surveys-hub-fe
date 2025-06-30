import { ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { finalize, Observable, Subject, takeUntil, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SurveyResponse } from '../../../template/interfaces/response-interfaces';
import { HomeService } from '../../services/home.service';
import { AuthService, UserInfo } from '../../../auth/services/auth.service';
import { QuestionsDialogComponent } from '../../../template/dialog-components/questions-dialog/questions-dialog.component';
import { AnswerSurveyDialogComponent } from '../../../template/dialog-components/answer-survey-dialog/answer-survey-dialog.component';
import { UserService } from '../../../user/services/user.service';
import {StatsDialogComponent} from '../../../template/dialog-components/stats-dialog/stats-dialog.component';

@Component({
  selector: 'app-public-surveys',
  standalone: false,
  templateUrl: './public-surveys.component.html',
  styleUrl: './public-surveys.component.scss'
})
export class PublicSurveysComponent implements OnInit, OnDestroy {

    surveys: SurveyResponse[] = [];

    submitted: String[] = [];

    userRole$: Observable<'admin' | 'user' | null>;

    showNoData = false;
    private destroy$ = new Subject<void>();

    userEmail?: string;

    constructor(
        private authSvc: AuthService,
        private homeSvc: HomeService,
        private userSvc: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef
    ) {
        this.userRole$ = this.authSvc.userRole$;
        this.authSvc.user$
            .pipe(takeUntilDestroyed())
            .subscribe(
                user => (this.userEmail = user?.email)
            );
    }

    ngOnInit(): void {
        this.homeSvc.getAllPublicSurveys()
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

        this.userRole$
            .pipe(takeUntil(this.destroy$), take(1))       // una sola emissione
            .subscribe(role => {
                if (role === 'user') {
                    this.userSvc.getAllSubmissionSurveysList()
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: res => this.submitted = res.data ?? [],
                            error: ()  => this.submitted = []         // fallback
                        });
                }
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
                    this.homeSvc.getQuestionsFromPublicSurvey(id).pipe(
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
                    this.homeSvc.getStatsFromPublicSurvey(id).pipe(
                        map(res => res.data ?? [])
                    )
            },
            width: '70vw', maxWidth: '70vw', maxHeight: '80vh'
        });
    }

    answerSurvey(s: SurveyResponse): void {
        this.userRole$.pipe(take(1)).subscribe(role => {
            if (role !== 'user') {
                this.snackBar.open("Devi essere registrato per poter rispondere al questionario!", 'Chiudi', {duration: 5000});
                return;
            }

            if( role === 'user' && s.approvalRequired) {
                this.snackBar.open("Il proprietario del questionario richiede un token di invito per poter rispondere!", 'Chiudi', {duration: 5000});
                return;
            }

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
        });
    }

    isDisabledButton(s: SurveyResponse): boolean {
        return s.status !== 'open' || this.isExpired(s);
    }

    isExpired(s: SurveyResponse): boolean {
        return new Date(s.expirationDate) < new Date();
    }
}
