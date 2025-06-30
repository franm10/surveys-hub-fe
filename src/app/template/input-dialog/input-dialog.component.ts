import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-input-dialog',
    standalone: false,
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent implements OnInit {

    inputForm!: FormGroup;
    courierOptions: string[] = ['BRT', 'GLS', 'Nexive', 'Poste Italiane', 'SDA', 'UPS', 'altro corriere'];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<InputDialogComponent>
    ) {}

    ngOnInit(): void {
        this.inputForm = this.fb.group({
            courier: ['', Validators.required],
            trackingId: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9]*$/)]]
        });
    }

    submitInput(): void {
        if (this.inputForm.valid) {
            const inputValue = this.inputForm.value;
            inputValue.trackingId = inputValue.trackingId.toUpperCase();
            this.dialogRef.close(inputValue);
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
