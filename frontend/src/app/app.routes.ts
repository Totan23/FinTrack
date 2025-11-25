import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ContactProfileComponent } from './contacts/contact-profile/contact-profile.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'app', component: ContactListComponent },
    { path: 'app/contacts/:id', component: ContactProfileComponent },
    { path: '**', redirectTo: '' }
];
