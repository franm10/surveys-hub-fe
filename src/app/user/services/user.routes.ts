import { Routes } from '@angular/router';

import { MySurveysComponent } from '../components/my-surveys/my-surveys.component';
import { CreateSurveyComponent } from '../components/create-survey/create-survey.component';
import { InvitedSurveysComponent } from '../components/invited-surveys/invited-surveys.component';
import { SubmittedSurveysComponent } from '../components/submitted-surveys/submitted-surveys.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import {InviteSettingsComponent} from '../components/invite-settings/invite-settings.component';
import {UserService} from './user.service';
import {UserGuard} from './user.guard';

export const userRoutes: Routes = [
    { path: 'user', component: DashboardComponent, canActivate: [UserGuard] },
    { path: 'user/my-surveys', component: MySurveysComponent, canActivate: [UserGuard] },
    { path: 'user/my-surveys/create', component: CreateSurveyComponent, canActivate: [UserGuard] },
    { path: 'user/surveys', component: InvitedSurveysComponent, canActivate: [UserGuard] },
    { path: 'user/submitted-surveys', component: SubmittedSurveysComponent, canActivate: [UserGuard] },
    { path: 'user/survey-invite-settings', component: InviteSettingsComponent, canActivate: [UserGuard] }
];
