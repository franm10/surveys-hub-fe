import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-example-json-dialog',
  standalone: false,
  templateUrl: './example-json-dialog.component.html',
  styleUrl: './example-json-dialog.component.scss'
})
export class ExampleJsonDialogComponent implements OnInit {
    jsonText = '';

    constructor(
        private http: HttpClient,
        private dialogRef: MatDialogRef<ExampleJsonDialogComponent>
    ) {}

    ngOnInit(): void {
        this.http.get('assets/example-survey.json', { responseType: 'text' })
            .subscribe({
                next: txt => this.jsonText = txt,
                error: ()  => this.jsonText = 'Errore: impossibile caricare example-survey.json'
            });
    }

    close(): void {
        this.dialogRef.close();
    }

}
