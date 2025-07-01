import { Routes } from '@angular/router';

import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';
import {AllSurveysComponent} from '../components/all-surveys/all-surveys.component';
import {canActivate} from '@angular/fire/auth-guard';
import {AdminGuard} from './admin.guard';

export const adminRoutes: Routes = [
    { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] },
    { path: 'admin/surveys', component: AllSurveysComponent, canActivate: [AdminGuard] }
];
