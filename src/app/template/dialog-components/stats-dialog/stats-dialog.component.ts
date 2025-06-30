import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ChartConfiguration } from 'chart.js';

import {StatsResponse, QuestionStatsResponse, SurveyResponse} from '../../interfaces/response-interfaces';

@Component({
  selector: 'app-stats-dialog',
  standalone: false,
  templateUrl: './stats-dialog.component.html',
  styleUrl: './stats-dialog.component.scss'
})
export class StatsDialogComponent implements OnInit {

    survey!: SurveyResponse;
    stats!: StatsResponse;

    loading = true;

    constructor(
        private dialogRef: MatDialogRef<StatsDialogComponent>,

        @Inject(MAT_DIALOG_DATA)
        public data: {
            survey: SurveyResponse;
            loadStats: (id: string) => Observable<StatsResponse>;
        }
    ) {
        this.survey = data.survey;
    }

    ngOnInit(): void {
        this.data.loadStats(this.survey.id)
            .subscribe({
                next: (res: StatsResponse) => {
                    this.stats = res;
                    this.stats.questionsStats = res.questionsStats.sort((a, b) => a.numSequence - b.numSequence);
                },
                complete: () => this.loading = false
            });
    }

    hasChoiceImage(q: QuestionStatsResponse): boolean {
        return q.choices.some(c => !!c.imageUrl);
    }

    close(): void {
        this.dialogRef.close();
    }

    /**
     * Costruisce i dati e le labels per il grafico a barre di una domanda.
     */
    chartDataFor(q: QuestionStatsResponse): ChartConfiguration<'bar'> {
        return {
            type: 'bar',
            data: {
                labels: q.choices.map(c => `${c.numSequence}. ${c.text}`),
                datasets: [
                    {
                        data: q.choices.map(c => c.count),
                        label: 'Risposte'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: `Domanda ${q.numSequence}` }
                },
                scales: {
                    x: { ticks: { autoSkip: false } },
                    y: { beginAtZero: true }
                }
            }
        };
    }

    pieChartDataFor(q: QuestionStatsResponse): ChartConfiguration<'pie'> {
        return {
            type: 'pie',
            data: {
                labels: q.choices.map(c => `${c.numSequence}. ${c.text}`),
                datasets: [{
                    data:   q.choices.map(c => c.count),
                    // puoi personalizzare backgroundColor o lasciare i default
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
                    title: { display: true, text: `Distribuzione domanda ${q.numSequence}` }
                }
            }
        };
    }

}
