import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, LoginDto } from '../api.service'; // Import ApiService and LoginDto
import { HttpClientModule } from '@angular/common/http'; // Keep HttpClientModule if ApiService is in root

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // Ensure HttpClientModule is imported if ApiService isn't provided elsewhere
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  selectedRole: 'supervisor' | 'student' = 'supervisor'; // Role selection might need adjustment based on actual auth flow
  supervisorNumber = ''; // Assuming this maps to email for supervisor
  supervisorPassword = '';
  studentNumber = ''; // Assuming this maps to email for student
  studentPassword = '';
  loginErrorSupervisor = false;
  loginErrorStudent = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService, // Inject ApiService
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already logged in, maybe redirect?
    if (this.apiService.isAuthenticated()) {
        // TODO: Redirect based on role if possible, for now redirect to dashboard
        // Need a way to determine role after login (e.g., decode token, fetch user profile)
        this.router.navigate(['/dashboard']); 
    }
  }

  selectRole(role: 'supervisor' | 'student'): void {
    this.selectedRole = role;
    this.loginErrorSupervisor = false; // Reset errors on role change
    this.loginErrorStudent = false;
    this.errorMessage = '';
  }

  handleLogin(role: 'supervisor' | 'student'): void {
    this.loginErrorSupervisor = false;
    this.loginErrorStudent = false;
    this.isLoading = true;
    this.errorMessage = '';

    let loginData: LoginDto;

    if (role === 'supervisor') {
      loginData = {
        email: this.supervisorNumber.trim(),
        password: this.supervisorPassword.trim()
      };
    } else {
      loginData = {
        email: this.studentNumber.trim(),
        password: this.studentPassword.trim()
      };
    }

    if (!loginData.email || !loginData.password) {
      this.errorMessage = "يرجى إدخال البريد الإلكتروني/الرقم الجامعي وكلمة المرور";
      this.isLoading = false;
      return;
    }

    this.apiService.login(loginData).subscribe({
      next: (token) => {
        this.isLoading = false;
        if (token) {
          this.apiService.saveToken(token); // Use ApiService to save token
          
          // TODO: Implement role-based redirection after login
          // This might involve decoding the JWT token or making another API call to get user details/role.
          // For now, redirecting all users to a generic dashboard.
          this.router.navigate(['/dashboard']); 
        } else {
            // Handle case where token is unexpectedly empty
            this.errorMessage = 'Login successful, but no token received.';
             if (role === 'supervisor') {
                this.loginErrorSupervisor = true;
            } else {
                this.loginErrorStudent = true;
            }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = `فشل تسجيل الدخول: ${error.message || 'يرجى التحقق من بيانات الاعتماد والمحاولة مرة أخرى.'}`;
        if (role === 'supervisor') {
          this.loginErrorSupervisor = true;
        } else {
          this.loginErrorStudent = true;
        }
      }
    });
  }
}

