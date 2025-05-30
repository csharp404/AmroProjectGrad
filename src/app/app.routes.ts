import { Routes } from '@angular/router';

// Import components
import { LoginComponent } from './login/login';
import { MainPageComponent } from './main-page/main-page'; // Keep or remove based on final structure
import { DashboardComponent } from './dashboard/dashboard';
import { AppointmentComponent } from './appointment/appointment';
import { DocumentUploadComponent } from './document-upload/document-upload';
import { ProposalComponent } from './proposal/proposal';

// Import the Auth Guard
import { authGuard } from './auth.guard';

// Define the application routes
export const routes: Routes = [
    // Default route redirects to login
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Login route (publicly accessible)
    { path: 'login', component: LoginComponent, title: 'Login' },

    // Routes protected by the Auth Guard
    {
        path: '', // Group protected routes
        canActivate: [authGuard], // Apply the guard to this group
        children: [
            // Route for the main page (if used after login)
            // { path: 'main', component: MainPageComponent, title: 'Main Page' },

            // Route for the dashboard (main page after login)
            { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },

            // Route for appointments
            { path: 'appointments', component: AppointmentComponent, title: 'Appointments' },

            // Route for document uploads
            { path: 'documents', component: DocumentUploadComponent, title: 'Document Upload' },

            // Route for proposal creation
            { path: 'proposal', component: ProposalComponent, title: 'Submit Proposal' },

            // Add other protected routes here if needed
            // { path: 'proposal-view', loadComponent: () => import('./proposal-readonly/proposal-readonly').then(m => m.ProposalReadonlyComponent), title: 'View Proposal' },
            // { path: 'internship-request', loadComponent: () => import('./request-internship/request-internship').then(m => m.RequestInternshipComponent), title: 'Internship Request' },
        ]
    },

    // Wildcard route for handling 404 Not Found errors
    // Redirects unauthenticated users to login, authenticated users to dashboard
    { 
        path: '**', 
        redirectTo: '/login', // Default redirect
        // If you want to redirect authenticated users to dashboard for unknown routes:
        // canActivate: [authGuard], // Apply guard to check auth status
        // resolve: { url: () => inject(ApiService).isAuthenticated() ? '/dashboard' : '/login' } // Complex logic, simpler to just redirect to login or a 404 page
    }
];

