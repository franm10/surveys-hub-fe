import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { finalize, Observable, Subject, takeUntil, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { SurveyResponse } from '../../../template/interfaces/response-interfaces';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { QuestionsDialogComponent } from '../../../template/dialog-components/questions-dialog/questions-dialog.component';
import {StatsDialogComponent} from '../../../template/dialog-components/stats-dialog/stats-dialog.component';
import {
    SurveySettingsDialogComponent
} from '../../../template/dialog-components/survey-settings-dialog/survey-settings-dialog.component';


@Component({
  selector: 'app-my-surveys',
  standalone: false,
  templateUrl: './my-surveys.component.html',
  styleUrl: './my-surveys.component.scss'
})
export class MySurveysComponent implements OnInit, OnDestroy {

    surveys: SurveyResponse[] = [];

    userRole$: Observable<'admin' | 'user' | null>;

    showNoData = false;
    private destroy$ = new Subject<void>();

    constructor(
        private authSvc: AuthService,
        private userSvc: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.userRole$ = this.authSvc.userRole$;
    }

    ngOnInit(): void {
        this.userSvc.getMySurveys()
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

    detailsSurvey(s: SurveyResponse): void {
        const ref = this.dialog.open(SurveySettingsDialogComponent, {
            data: { survey: s },
            width: '70vw', maxWidth: '70vw', height: '80vh'
        });

        ref.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((updated: SurveyResponse | undefined) => {
                if (updated) {
                    const i = this.surveys.findIndex(x => x.id === updated.id);
                    if (i > -1) {
                        this.surveys[i] = updated;
                    }
                }
            });
    }

    manageSurvey(s: SurveyResponse): void {
        this.router.navigate(
            ['/user/survey-invite-settings'],
            { queryParams: { s: s.id } }
        );
    }

    isDisabledButton(s: SurveyResponse): boolean {
        return s.status !== 'open' || this.isExpired(s);
    }

    isExpired(s: SurveyResponse): boolean {
        return new Date(s.expirationDate) < new Date();
    }
}
