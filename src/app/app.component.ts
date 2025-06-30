import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth/services/auth.service';

@Component({
    selector: 'app-root',
    standalone: false,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'Surveys Hub';

    image = '../assets/background.webp';

    userRole$: Observable<'admin' | 'user' | null>;

    constructor(
        private authService: AuthService
    ) {
        this.userRole$ = this.authService.userRole$;
    }

    ngOnInit(): void {
        this.userRole$.subscribe( role => {
            if( role==null )
                console.log('[{}] User not authenticated')
            else
                console.log('[AppComponent] User auth with role:', role);
        });
    }

}
