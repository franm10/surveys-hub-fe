import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService, UserInfo } from '../../../auth/services/auth.service';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

    user: UserInfo | null = null;

    constructor(
        private authSvc: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.authSvc.user$
            .pipe(takeUntilDestroyed())
            .subscribe(
                user => (this.user = user)
            );
    }

    changePassword(): void {
        this.snackBar.open("Non ancora disponibile.", 'Chiudi', { duration: 5000 });
    }

}
