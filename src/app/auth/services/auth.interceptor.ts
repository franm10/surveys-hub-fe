import { Injectable } from '@angular/core';
import { HttpEvent, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { LoginComponent } from '../components/login/login.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly excludedUrlsFromAuth = [ '/api/public' ];

  constructor(
    private auth: Auth,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if( this.excludedUrlsFromAuth.some( url => req.url.includes(url) ) )
      return next.handle(req);

    return from( this.auth.currentUser?.getIdToken() ?? Promise.resolve(null) )
      .pipe(
        switchMap( token => {
          const authReq = token ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : req;

          return next.handle(authReq)
            .pipe(
              catchError( (error: HttpErrorResponse) => {
                if( error.status === 401 ) {
                  this.snackBar.open("Sessione scaduta. Effettuare nuovamente l'accesso.", 'Chiudi', {duration: 5000});
                  return this.dialog.open( LoginComponent )
                    .afterClosed()
                    .pipe(
                      switchMap( result => {
                        if( !result || !result.success ) {
                          this.snackBar.open("Accesso annullato.", 'Chiudi', {duration: 5000});
                          this.router.navigateByUrl('/');
                          return throwError(() => error);
                        }

                        return from(this.auth.currentUser?.getIdToken() ?? Promise.resolve(null))
                          .pipe(
                            switchMap( newToken => {
                              if( !newToken ) {
                                this.snackBar.open("Accesso fallito.", 'Chiudi', {duration: 5000});
                                this.router.navigateByUrl('/');
                                return throwError(() => error);
                              }

                              const retryReq = req.clone({ setHeaders: {Authorization: `Bearer ${newToken}`} });
                              this.snackBar.open("Accesso effettuato. Richiesta inoltrata correttamente.", 'Chiudi', {duration: 5000});
                              return next.handle(retryReq);
                            })
                          )
                      })
                    );
                }
                return throwError(() => error);
              })
            )
        })
    );
  }

}
