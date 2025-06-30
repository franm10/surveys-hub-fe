import { Injectable, NgZone } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
            GoogleAuthProvider, updateProfile, onAuthStateChanged }
                from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserInfo {
    uid: string;
    email: string;
    name: string,
    role: 'admin' | 'user';
    authTime: number;   // UNIX timestamp in seconds
}

@Injectable({ providedIn: 'root' })
export class AuthService {

    private userSubject = new BehaviorSubject<UserInfo | null>(null);
    user$ = this.userSubject.asObservable();

    //TODO: remove loadingSubject and check
    private loadingSubject = new BehaviorSubject<boolean>(true);
    loading$ = this.loadingSubject.asObservable();

    private readonly MAX_SESSION_SECONDS = 7 * 24 * 60 * 60;     // 7 days

    constructor(
        private auth: Auth,
        private ngZone: NgZone
    ) { }

    initializeAuth(): Promise<void> {
        return new Promise( resolve => {
            onAuthStateChanged(this.auth, async user => {
                if( !user ) {
                    this.ngZone.run( () => this.userSubject.next(null) );
                    this.loadingSubject.next(false);
                    resolve();
                    return;
                }

                const token = await user.getIdTokenResult();
                const claims = token.claims as { [key: string]: any };
                const authTime = Number(claims['auth_time']);
                const role = (claims['role'] === 'admin') ? 'admin' : 'user';

                const now = Math.floor(Date.now() / 1000);
                if( now - authTime > this.MAX_SESSION_SECONDS ) {
                    await this.auth.signOut();
                    this.ngZone.run( () => this.userSubject.next(null) );
                    this.loadingSubject.next(false);
                    resolve();
                    return;
                }

                const userInfo: UserInfo = {
                    uid: user.uid,
                    email: user.email ?? '',      // se email è null o undefined -> default: ''
                    name: user.displayName ?? 'utente',
                    role: role,
                    authTime: authTime
                };
                this.ngZone.run(() => this.userSubject.next(userInfo));
                this.loadingSubject.next(false);
                resolve();
            });
        });
    }

    public userRole$ = this.user$.pipe(
        map(user => user?.role ?? null)
    );

    async login(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(this.auth, email, password);
    }

    async loginWithGoogle(): Promise<void> {
        await signInWithPopup(this.auth, new GoogleAuthProvider());
    }

    async signup(fullName: string, email: string, password: string): Promise<void> {
        const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
        await updateProfile(credentials.user, {displayName: fullName});
    }

    logout(): Promise<void> {
        this.userSubject.next(null);
        return this.auth.signOut();
    }

}
