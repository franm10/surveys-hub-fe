import { Routes } from '@angular/router';

import { HomeComponent } from "../home.component";
import { AboutComponent } from "../components/about/about.component";
import { ContactsComponent } from '../components/contacts/contacts.component';
import {PublicSurveysComponent} from '../components/public-surveys/public-surveys.component';

export const homeRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contacts', component: ContactsComponent },
    { path: 'surveys', component: PublicSurveysComponent }
];
