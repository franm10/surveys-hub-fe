import { Component } from '@angular/core';

import { Observable} from 'rxjs';
import { AuthService, UserInfo } from '../../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {

    admin: UserInfo | null = null;

    constructor(
        private authSvc: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.authSvc.user$
            .pipe(takeUntilDestroyed())
            .subscribe(
                user => (this.admin = user)
            );
        if(this.admin)
            this.admin.name = "Administrator";
    }

    changePassword(): void {
        this.snackBar.open("Non ancora disponibile.", 'Chiudi', { duration: 5000 });
    }

}
