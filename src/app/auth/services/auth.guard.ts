import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.user$.pipe(
            map(user => {
                console.log('[AuthGuard] Checking for route:', state.url, '; userRole:', user?.role);
                const isAuthPage = state.url === '/login' || state.url === '/signup';

                if( user && isAuthPage ) {
                    console.log('[AuthGuard] Utente già loggato. Redirect...');
                    this.router.navigateByUrl('/');
                    return false;
                }

                if( !user && !isAuthPage ) {
                    console.log('[AuthGuard] Utente non loggato. Redirect...');
                    this.router.navigateByUrl('/login');
                    return false;
                }

                return true;
            })
        );
    }

}
