import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { SurveyResponse } from '../../../template/interfaces/response-interfaces';
import { QuestionsDialogComponent } from '../../../template/dialog-components/questions-dialog/questions-dialog.component';
import { UserService } from '../../services/user.service';
import {
    SubmittedQuestionsDialogComponent
} from '../../../template/dialog-components/submitted-questions-dialog/submitted-questions-dialog.component';
import {StatsDialogComponent} from '../../../template/dialog-components/stats-dialog/stats-dialog.component';

@Component({
  selector: 'app-submitted-surveys',
  standalone: false,
  templateUrl: './submitted-surveys.component.html',
  styleUrl: './submitted-surveys.component.scss'
})
export class SubmittedSurveysComponent implements OnInit, OnDestroy {

    surveys: SurveyResponse[] = [];

    showNoData = false;
    private destroy$ = new Subject<void>();

    constructor(
        private userSvc: UserService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.userSvc.getAllSurveysSubmittedByUser()
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

    viewSubmittedQuestions(s: SurveyResponse): void {
        this.dialog.open(SubmittedQuestionsDialogComponent, {
            data: { survey: s },
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

}
