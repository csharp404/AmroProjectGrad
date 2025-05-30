import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service'; // Adjust path as needed

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.isAuthenticated()) {
    return true; // User is authenticated, allow access
  } else {
    // User is not authenticated, redirect to login page
    console.log('AuthGuard: User not authenticated, redirecting to /login');
    router.navigate(['/login']);
    return false; // Prevent access to the route
  }
};

