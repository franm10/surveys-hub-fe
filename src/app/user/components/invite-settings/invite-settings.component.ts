import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar }            from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin }     from 'rxjs';

import { UserService }       from '../../services/user.service';
import { SurveyResponse }    from '../../../template/interfaces/response-interfaces';

@Component({
    selector: 'app-invite-settings',
    standalone: false,
    templateUrl: './invite-settings.component.html',
    styleUrls: ['./invite-settings.component.scss']
})
export class InviteSettingsComponent implements OnInit {
    survey!: SurveyResponse;

    invitedToken!: string | null;
    approvalRequired!: boolean;

    pendingApprovalEmails: string[] = [];

    participants: string[] = [];

    invitedEmails: string[] = [];

    newEmailControl = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
    });

    loading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userSvc: UserService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.queryParamMap.get('s');
        if( !id ) {
            this.router.navigate(['/user/my-surveys']);
            return;
        }
        this.loadAll(id);
    }

    private loadAll(id: string) {
        this.loading = true;
        forkJoin({
            surveyResp: this.userSvc.getSurveyByOwner(id),
            partResp:   this.userSvc.getParticipatedUserListFromSurvey(id)
        }).pipe( finalize(() => this.loading = false) )
            .subscribe({
                next: result => {
                    const surveyResp = result.surveyResp;
                    const partResp   = result.partResp;

                    if( !surveyResp.data ) {
                        this.snackBar.open("Survey non trovata",'Chiudi',{duration:3000});
                        this.router.navigateByUrl('/user/my-surveys');
                        return;
                    }

                    this.survey                  = surveyResp.data;
                    this.invitedToken            = this.survey.invitedToken;
                    this.approvalRequired        = this.survey.approvalRequired;
                    this.pendingApprovalEmails   = this.survey.pendingApprovalEmails ?? [];
                    this.participants            = partResp.data ?? [];
                    this.invitedEmails           = [...this.survey.invitedEmails];
                    this.newEmailControl.reset();
                },
                error: () => {
                    this.snackBar.open("Errore nel caricamento dei dati",'Chiudi',{duration:3000});
                    this.router.navigateByUrl('/user/my-surveys');
                }
            });
    }

    // --- TOKEN MANAGEMENT ---

    invalidateToken() {
        this.userSvc.invalidateToken(this.survey.id)
            .subscribe(() => this.loadAll(this.survey.id));
    }

    generateToken(approval: boolean) {
        this.userSvc.generateToken(this.survey.id, approval)
            .subscribe(() => this.loadAll(this.survey.id));
    }

    toggleApprovalRequired(event: any) {
        const ar = event.checked;
        this.userSvc.updateApprovalRequired(this.survey.id, ar)
            .subscribe(() => this.loadAll(this.survey.id));
    }

    // --- PENDING EMAILS ---
    acceptAllPending() {
        this.userSvc.acceptAllPendingEmails(this.survey.id)
            .subscribe(() => this.loadAll(this.survey.id));
    }


    // --- INVITED EMAILS SETTING ---
    addEmail() {
        const e = this.newEmailControl.value.trim();
        if (!e) return;
        if (!this.invitedEmails.includes(e)) {
            this.invitedEmails.push(e);
        }
        this.newEmailControl.reset();
    }

    removeEmail(e: string) {
        this.invitedEmails = this.invitedEmails.filter(x => x !== e);
    }

    saveEmails() {
        this.userSvc.updateInvitedEmails(this.survey.id, this.invitedEmails)
            .subscribe({
                next: () => this.loadAll(this.survey.id),
                error: () => this.snackBar.open('Errore salvataggio','OK',{duration:3000})
            });
    }

    rowsOf3(arr: string[]): string[][] {
        const rows: string[][] = [];
        for (let i=0; i<arr.length; i+=3) {
            const chunk = arr.slice(i, i+3);
            while (chunk.length<3) chunk.push('');
            rows.push(chunk);
        }
        if (!rows.length) rows.push(['','','']);
        return rows;
    }


    /* *************** HELPER STATUS *************** */
    translateStatus(): string {
        switch(this.survey.status) {
            case 'open':    return 'Aperto';
            case 'closed':  return 'Chiuso';
            default:        return 'Archiviato';
        }
    }

    statusClass(): string {
        switch(this.survey.status) {
            case 'open':   return 'open';
            case 'closed': return 'closed';
            default:       return 'archived';
        }
    }
}
