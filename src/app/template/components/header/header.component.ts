import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../../auth/components/login/login.component'
import { Observable } from 'rxjs';
import {InviteTokenComponent} from '../../../user/components/invite-token/invite-token.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: false
})
export class HeaderComponent {

    //newsletterForm!: FormGroup;

    messageCounter: number = 0;

    userRole$: Observable<'admin' | 'user' | null>;

    constructor(
        private snackBar: MatSnackBar,
        private router: Router,
        private authService: AuthService,
        private dialog: MatDialog
    ) {
        this.userRole$ = this.authService.userRole$;
    }

    message(): void {
        if( this.messageCounter == 0)
            this.snackBar.open("Non ci sono nuove notifiche da visualizzare.", 'Chiudi', { duration: 5000 });
        else
            this.router.navigateByUrl('/test');
    }

    invite(): void {
        this.dialog.open(InviteTokenComponent);
    }

    login(): void {
        const dialogRef = this.dialog.open(LoginComponent, {data: {isDialog: true}});
        const instance = dialogRef.componentInstance;
        instance.loginCompleted.subscribe(() => { dialogRef.close() });
    }

}
