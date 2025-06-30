import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { ExampleJsonDialogComponent } from '../../../template/dialog-components/example-json-dialog/example-json-dialog.component';
import { ApiResponse, SurveyResponse } from '../../../template/interfaces/response-interfaces';

@Component({
    selector: 'app-survey-create',
    standalone: false,
    templateUrl: './create-survey.component.html',
    styleUrls: ['./create-survey.component.scss']
})
export class CreateSurveyComponent {

    selectedTab = 0;    // status: 0 -> form, 1 -> json
    jsonText   = '';
    surveyForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private userSvc: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private overlay: Overlay,
        private router: Router
    ) {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            visibility: ['public'],
            expirationDate: [null],
            expirationTime: [''],
            generateInvitedToken: [false],      // default
            approvalRequired: [false],          // default
            invitedEmails: this.fb.array([]),
            questions: this.fb.array([])
        }, { validators: this.futureDateValidator() });
    }

    openExample(): void {
        this.dialog.open(ExampleJsonDialogComponent, {
            width:      '70vw',
            maxWidth:   '70vw',
            maxHeight:  '80vh',
            scrollStrategy: this.overlay.scrollStrategies.noop()
        });
    }


    /* --------------- Form Builder --------------- */
    /* ----- Invited emails ----- */
    get invitedEmails(): FormArray {
        return this.surveyForm.get('invitedEmails') as FormArray;
    }

    addEmail() {
        this.invitedEmails.push(this.fb.control('', Validators.email));
    }
    removeEmail(i: number) {
        this.invitedEmails.removeAt(i);
    }

    /* ----- Questions/Options ----- */
    get questions(): FormArray     {
        return this.surveyForm.get('questions') as FormArray;
    }

    getOptions(q: number): FormArray {
        return this.questions.at(q).get('options') as FormArray;
    }

    newQuestion() {
        return this.fb.group({
            text: ['', Validators.required],
            allowMultipleAnswers: [false],
            imageType: [''],
            imageData: [''],
            options: this.fb.array([])                 // ⇐ vuoto
        });
    }

    addQuestion() {
        const qCtrl = this.newQuestion();
        this.questions.push(qCtrl);
        this.addOption(this.questions.length - 1);
    }

    removeQuestion(i: number) {
        this.questions.removeAt(i);
    }

    newOption() {
        return this.fb.group({ text: ['', Validators.required], imageType: [''], imageData: [''] });
    }

    addOption(q: number) {
        this.getOptions(q).push(this.newOption());
    }

    removeOption(q: number, o: number) {
        this.getOptions(q).removeAt(o);
    }

    get canSubmit(): boolean {
        if( this.surveyForm.invalid )
            return false;

        const qs = this.questions;
        if (qs.length === 0) {
            return false;
        }

        for (let i = 0; i < qs.length; i++) {
            const qGroup = qs.at(i) as FormGroup;
            if (!qGroup.get('text')!.valid) {
                return false;
            }

            const optsArray = qGroup.get('options') as FormArray;
            if (optsArray.length === 0) {
                return false;
            }

            for (let j = 0; j < optsArray.length; j++) {
                const oGroup = optsArray.at(j) as FormGroup;
                if (!oGroup.get('text')!.valid) {
                    return false;
                }
            }
        }

        // tutto ok
        return true;
    }

    /* --------------- SWITCH form <-> json --------------- */
    onTabChange(e: any) {
        if( e.index === 1 )
            this.formToJson();
        else if( e.index === 0 )
            this.jsonToForm();
    }

    formToJson() {
        const json = { ...this.surveyForm.value };
        delete json.expirationTime;
        const iso = this.toIsoDate();
        if( iso )
            json.expirationDate = iso;
        else
            delete json.expirationDate;
        this.jsonText = JSON.stringify(json, null, 2);
    }

    jsonToForm(): void {
        try {
            if( !this.jsonText.trim() )
                return;

            this.surveyForm.reset();
            this.invitedEmails.clear();
            this.questions.clear();

            const obj = JSON.parse(this.jsonText);
            if( obj.expirationDate ) {
                const expFullDate = new Date(obj.expirationDate);
                obj.expirationDate = expFullDate;
                obj.expirationTime = expFullDate.toISOString().substring(11, 16);
            }
            this.surveyForm.patchValue(obj);
            (obj.invitedEmails || []).forEach(
                (email: string) => this.invitedEmails.push(this.fb.control(email, Validators.email))
            );
            (obj.questions || []).forEach(
                (q: any, qi: number) => {
                    const qCtrl = this.newQuestion();
                    this.questions.push(qCtrl);
                    qCtrl.patchValue(q);

                    const optArray = this.getOptions(qi);
                    optArray.clear();
                    (q.options || []).forEach(
                        (o: any) => {
                            const oCtrl = this.newOption();
                            oCtrl.patchValue(o);
                            optArray.push(oCtrl);
                        }
                    );
                }
            );
        }catch {
            this.snackBar.open("JSON non valido: impossibile caricare nel form.", 'Chiudi', { duration: 5000 });
        }
    }



    /* --------------- Helper --------------- */
    private futureDateValidator(): ValidatorFn {
        return (grp) => {
            const date: Date = grp.get('expirationDate')?.value;
            const time: string = grp.get('expirationTime')?.value || '00:00';
            if (!date) return null;
            const [h, m] = time.split(':').map(Number);
            const datetime = new Date(date); datetime.setHours(h,m,0,0);
            return datetime < new Date() ? { datePast: true } : null;
        };
    }

    private toIsoDate(): string | null {
        const date: Date = this.surveyForm.value.expirationDate;
        const time: string = this.surveyForm.value.expirationTime || '00:00';
        if( !date )
            return null;
        const [h,m] = time.split(':').map(Number);
        const datetime = new Date(date);
        datetime.setHours(h,m,0,0);
        return datetime.toISOString();
    }


    /* --------------- Import Json File --------------- */
    importJsonFile(e: Event) {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (!f) return;
        f.text().then(txt => this.jsonText = txt);
    }



    /* --------------- Submit New Survey --------------- */
    submitJson() {
        let body: any;
        try {
            body = JSON.parse(this.jsonText);
        } catch {
            this.snackBar.open("JSON non valido", 'Chiudi', { duration: 5000 });
            return;
        }
        this.create(body);
    }

    submitForm() {
        if( this.surveyForm.invalid ) {
            this.snackBar.open("Compila e verifica tutti i campi obbligatori.", 'Chiudi', { duration: 5000 });
            return;
        }
        const iso = this.toIsoDate();
        const body = { ...this.surveyForm.value, expirationDate: iso };
        delete body.expirationTime;
        this.create(body);
    }

    private create(body: any) {
        this.userSvc.createSurvey(body).subscribe({
            next: (res: ApiResponse<SurveyResponse | null>) => {
                if( res.data ) {
                    this.snackBar.open("Questionario creato!", 'Chiudi', { duration: 5000 });
                    this.router.navigateByUrl('/user/my-surveys');
                }
                else
                    this.snackBar.open(res.message || "Errore creazione questionario.", 'Chiudi', { duration: 5000 });
            },
            error: err => {
                if (err.status === 400) {
                    this.snackBar.open("Errore: verificare i dati inseriti.", 'Chiudi', {
                        duration: 5000
                    });
                } else {
                    const msg = err.error?.message || "Errore creazione questionario.";
                    this.snackBar.open(msg, 'Chiudi', { duration: 5000 });
                }
            }
        });
    }

}
