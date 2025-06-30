import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LogoutComponent } from './components/logout/logout.component';

import { AuthGuard } from './services/auth.guard';

export const authRoutes: Routes = [
    { path: 'signup',   component: SignupComponent, canActivate: [AuthGuard] },
    { path: 'login',    component: LoginComponent,  canActivate: [AuthGuard] },
    { path: 'logout',   component: LogoutComponent },
];
