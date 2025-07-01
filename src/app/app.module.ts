// noinspection JSDeprecatedSymbols
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule }              from '@angular/platform-browser';
import { BrowserAnimationsModule }    from '@angular/platform-browser/animations';
import { provideAnimationsAsync }     from '@angular/platform-browser/animations/async';
import { NgOptimizedImage }           from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule }    from '@angular/forms';
import { RouterModule }               from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth }             from '@angular/fire/auth';
import { provideFirestore, getFirestore }   from '@angular/fire/firestore';

import { MatCardModule }        from '@angular/material/card';
import { MatDialogModule }      from '@angular/material/dialog';
import { MatExpansionModule }   from '@angular/material/expansion';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatButtonModule }      from '@angular/material/button';
import { MatIconModule }        from '@angular/material/icon';
import { MatSnackBarModule }    from '@angular/material/snack-bar';
import { MatMenuModule }        from '@angular/material/menu';
import { MatSelectModule }      from '@angular/material/select';
import { MatCheckboxModule }    from '@angular/material/checkbox';
import { MatDatepickerModule }  from '@angular/material/datepicker';
import { MatChipsModule }       from '@angular/material/chips';
import { MatTabsModule }        from '@angular/material/tabs';
import { MatRadioModule }       from '@angular/material/radio';

import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { environment }      from '../environments/environment';
import { routesConfig }     from './app.routes';

import { AppComponent }                 from './app.component';
import { LoginComponent }               from './auth/components/login/login.component';
import { SignupComponent }              from './auth/components/signup/signup.component';
import { LogoutComponent }              from './auth/components/logout/logout.component';
import { AuthService }                  from './auth/services/auth.service';
import { AuthInterceptor }              from './auth/services/auth.interceptor';
import { HeaderComponent }              from './template/components/header/header.component';
import { FooterComponent }              from './template/components/footer/footer.component';
import { TokenPageComponent }           from './test/token-page/token-page.component';
import { AboutComponent }               from './home/components/about/about.component';
import { HomeComponent }                from './home/home.component';
import { NotFoundRedirectComponent }    from './template/components/not-found-redirect/not-found-redirect.component';
import { ContactsComponent }            from './home/components/contacts/contacts.component';
import { InviteTokenComponent }         from './user/components/invite-token/invite-token.component';
import { PublicSurveysComponent }       from './home/components/public-surveys/public-surveys.component';
import { MySurveysComponent }           from './user/components/my-surveys/my-surveys.component';
import { QuestionsDialogComponent }     from './template/dialog-components/questions-dialog/questions-dialog.component';
import { StatsDialogComponent }         from './template/dialog-components/stats-dialog/stats-dialog.component';
import { CreateSurveyComponent }        from './user/components/create-survey/create-survey.component';
import { ExampleJsonDialogComponent }   from './template/dialog-components/example-json-dialog/example-json-dialog.component';
import { AnswerSurveyDialogComponent }  from './template/dialog-components/answer-survey-dialog/answer-survey-dialog.component';
import { InviteSettingsComponent }      from './user/components/invite-settings/invite-settings.component';
import { InvitedSurveysComponent }      from './user/components/invited-surveys/invited-surveys.component';
import { SubmittedSurveysComponent }    from './user/components/submitted-surveys/submitted-surveys.component';
import { SubmittedQuestionsDialogComponent } from './template/dialog-components/submitted-questions-dialog/submitted-questions-dialog.component';
import { SurveyInfoDialogComponent }    from './template/dialog-components/survey-info-dialog/survey-info-dialog.component';
import { SurveySettingsDialogComponent } from './template/dialog-components/survey-settings-dialog/survey-settings-dialog.component';
import { DashboardComponent } from './user/components/dashboard/dashboard.component';
import { AdminPanelComponent } from './admin/components/admin-panel/admin-panel.component';
import { AllSurveysComponent } from './admin/components/all-surveys/all-surveys.component';

export function initializeAppFactory(authService: AuthService): () => Promise<void> {
    return () => authService.initializeAuth();
}

/**
 * NOTA: TypeScript segnala APP_INITIALIZER come deprecato, ma per Angular non lo è
 */
@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        SignupComponent,
        LogoutComponent,
        HeaderComponent,
        FooterComponent,
        TokenPageComponent,
        AboutComponent,
        HomeComponent,
        NotFoundRedirectComponent,
        ContactsComponent,
        InviteTokenComponent,
        PublicSurveysComponent,
        MySurveysComponent,
        QuestionsDialogComponent,
        StatsDialogComponent,
        CreateSurveyComponent,
        ExampleJsonDialogComponent,
        AnswerSurveyDialogComponent,
        InviteSettingsComponent,
        InvitedSurveysComponent,
        SubmittedSurveysComponent,
        SubmittedQuestionsDialogComponent,
        SurveyInfoDialogComponent,
        SurveySettingsDialogComponent,
        DashboardComponent,
        AdminPanelComponent,
        AllSurveysComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot(routesConfig),

        /* Angular Material */
        MatCardModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatMenuModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatChipsModule,
        MatTabsModule,
        MatRadioModule,

        NgOptimizedImage,
        BaseChartDirective,
    ],
    providers: [
        provideAnimationsAsync(),

        /* NG2 Charts */
        provideCharts(withDefaultRegisterables()),

        /* Check Authentication On Init */
        { provide: APP_INITIALIZER, useFactory: initializeAppFactory, deps: [AuthService], multi: true },

        /* Interceptor */
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

        /* Firebase */
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),

        /* Required for Datepicker */
        provideNativeDateAdapter(),
        { provide: MAT_DATE_LOCALE, useValue: 'it-IT' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
