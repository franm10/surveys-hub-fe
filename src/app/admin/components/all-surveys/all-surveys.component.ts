import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { finalize, Observable, Subject, takeUntil, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { SurveyResponse } from '../../../template/interfaces/response-interfaces';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';
import { QuestionsDialogComponent } from '../../../template/dialog-components/questions-dialog/questions-dialog.component';
import { StatsDialogComponent } from '../../../template/dialog-components/stats-dialog/stats-dialog.component';

@Component({
    selector: 'app-all-surveys',
    standalone: false,
    templateUrl: './all-surveys.component.html',
    styleUrl: './all-surveys.component.scss'
})
export class AllSurveysComponent implements OnInit, OnDestroy {

    surveys: SurveyResponse[] = [];

    userRole$: Observable<'admin' | 'user' | null>;

    showNoData = false;
    private destroy$ = new Subject<void>();

    constructor(
        private authSvc: AuthService,
        private adminSvc: AdminService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.userRole$ = this.authSvc.userRole$;
    }

    ngOnInit(): void {
        this.adminSvc.getAllSurveys()
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
                    this.adminSvc.getAllQuestionsFromSurvey(id).pipe(
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
                    this.adminSvc.getAllStatsFromSurvey(id).pipe(
                        map(res => res.data ?? [])
                    )
            },
            width: '70vw', maxWidth: '70vw', maxHeight: '80vh'
        });
    }

    deleteSurvey(s: SurveyResponse): void {
        this.adminSvc.deleteSurvey(s.id).subscribe({
            next:
                res => {
                    this.snackBar.open("Questionario eliminato con successo.", 'Chiudi', { duration: 5000 } );
                    this.surveys = this.surveys.filter(survey => survey.id !== s.id);
            },
            error:
                err => {
                    this.snackBar.open("Errore nell'eliminazione del questionario.", 'Chiudi', { duration: 5000 } );
            }
        });
    }

    manageSurvey(s: SurveyResponse): void {
        this.snackBar.open("Funzionalità non ancora disponibile", 'Chiudi', { duration: 5000 } );
    }

    isDisabledButton(s: SurveyResponse): boolean {
        return s.status !== 'open' || this.isExpired(s);
    }

    isExpired(s: SurveyResponse): boolean {
        return new Date(s.expirationDate) < new Date();
    }
}
