import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Keep for ApiService if providedIn: 'root'
import { ApiService, Appointment, AppointmentDto } from '../api.service'; // Import ApiService and DTOs

// Define frontend status mapping if needed (API status might be different)
type AppointmentStatusFrontend = 'مؤكد' | 'في الانتظار' | 'ملغي'; // Confirmed | Pending | Cancelled

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, DatePipe],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.css']
})
export class AppointmentComponent implements OnInit {

  appointments: Appointment[] = []; // Use Appointment interface from ApiService
  newAppointmentDate: string = ''; // For date input
  newAppointmentTime: string = ''; // For time input

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.apiService.isAuthenticated()) {
        this.errorMessage = 'Authentication required. Please log in.';
        this.router.navigate(['/login']);
        return;
    }
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = `Failed to load appointments: ${error.message || 'Server error'}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  requestAppointment(): void {
    if (!this.newAppointmentDate || !this.newAppointmentTime) {
      this.errorMessage = 'يرجى تحديد تاريخ ووقت للموعد.'; // Please select a date and time for the appointment.
      alert(this.errorMessage);
      return;
    }
    if (!this.apiService.isAuthenticated()) {
        this.errorMessage = 'Authentication expired. Please log in again.';
        this.router.navigate(['/login']);
        return;
    }

    // Combine date and time into ISO strings if required by backend
    // Assuming the backend AppointmentDto expects separate date/time strings or handles them
    // Or combine them: const combinedDateTime = new Date(`${this.newAppointmentDate}T${this.newAppointmentTime}`).toISOString();

    const payload: AppointmentDto = {
      // studentId might be inferred by the backend based on the token
      date: this.newAppointmentDate, // Send as separate date string
      time: this.newAppointmentTime, // Send as separate time string
    };

    console.log('Requesting appointment with payload:', payload);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.createAppointment(payload).subscribe({
      next: (response) => {
        console.log('Appointment request successful:', response);
        this.isLoading = false;
        this.successMessage = 'تم إرسال طلب الموعد بنجاح.'; // Appointment request sent successfully.
        alert(this.successMessage);
        this.newAppointmentDate = ''; // Clear fields
        this.newAppointmentTime = '';
        this.loadAppointments(); // Refresh the list
      },
      error: (error) => {
        console.error('Error requesting appointment:', error);
        this.errorMessage = `Failed to request appointment: ${error.message || 'Server error'}`;
        this.isLoading = false;
        alert(this.errorMessage);
      }
    });
  }

  // --- Utility Functions --- 
  // Map API status (string/null) to frontend display class or text
  // Adjust based on actual status values from API ('stauts' field in Appointment interface)
  getAppointmentStatusText(status: string | null | undefined): AppointmentStatusFrontend {
      switch (status?.toLowerCase()) {
          // Map potential API statuses to frontend display text
          case 'confirmed': // Example mapping
              return 'مؤكد';
          case 'pending': // Example mapping
              return 'في الانتظار';
          case 'cancelled': // Example mapping
              return 'ملغي';
          default:
              return 'في الانتظار'; // Default to Pending
      }
  }

  getAppointmentStatusClass(status: string | null | undefined): string {
      switch (status?.toLowerCase()) {
          // Map potential API statuses to CSS classes
          case 'confirmed': // Example mapping
              return 'status-confirmed';
          case 'pending': // Example mapping
              return 'status-pending';
          case 'cancelled': // Example mapping
              return 'status-cancelled';
          default:
              return 'status-pending'; // Default
      }
  }
}

