import { Routes } from '@angular/router';

import { MySurveysComponent } from '../components/my-surveys/my-surveys.component';
import { CreateSurveyComponent } from '../components/create-survey/create-survey.component';
import { InvitedSurveysComponent } from '../components/invited-surveys/invited-surveys.component';
import { SubmittedSurveysComponent } from '../components/submitted-surveys/submitted-surveys.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import {InviteSettingsComponent} from '../components/invite-settings/invite-settings.component';

export const userRoutes: Routes = [
    { path: 'user', component: DashboardComponent },
    { path: 'user/my-surveys', component: MySurveysComponent },
    { path: 'user/my-surveys/create', component: CreateSurveyComponent },
    { path: 'user/surveys', component: InvitedSurveysComponent },
    { path: 'user/submitted-surveys', component: SubmittedSurveysComponent },
    { path: 'user/survey-invite-settings', component: InviteSettingsComponent }
];
