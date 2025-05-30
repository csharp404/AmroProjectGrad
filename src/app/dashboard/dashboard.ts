import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, *ngFor
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink

// Define interfaces for structured data (optional but good practice)
interface Project {
  name: string;
  supervisor: string;
  student: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add CommonModule and RouterModule
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Bind dark-mode class to host element
  @HostBinding('class.dark-mode') isDarkMode = false;

  // Component properties for data binding
  userName = 'Amro'; // Example user name
  profileImageUrl = 'assets/profile.jpg'; // Example profile image path - Check if exists
  projectCount = 5; // Example count
  trainingCount = 3; // Example count
  requestCount = 2; // Example count
  messageCount = 1; // Example count
  notificationCount = 3; // Example notification count
  showNotificationsDropdown = false;
  showProjects = false;

  // Example data arrays (replace with actual data fetching logic)
  notifications: string[] = [
    'New Project Added',
    'Training Request Sent',
    'Training Approved'
  ];
  approvedProjects: Project[] = [
    { name: 'Project 1', supervisor: 'Dr. Smith', student: 'Amro' },
    { name: 'Project 2', supervisor: 'Dr. Johnson', student: 'Amro' },
    { name: 'Project 3', supervisor: 'Dr. Brown', student: 'Amro' }
  ];
  recentActivities: string[] = [
    'New Project Added',
    'Training Request Sent',
    'Training Approved'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check local storage for dark mode preference
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    // Potentially load initial data here (counts, user info, etc.)
    this.checkProfileImage();
  }

  checkProfileImage() {
    // Basic check: if profile.jpg doesn't exist or causes error, use a default
    // In a real app, you might use HttpClient to check or have a more robust way
    const img = new Image();
    img.src = this.profileImageUrl;
    img.onerror = () => {
      this.profileImageUrl = 'assets/default-profile.png'; // Path to a default image
      console.warn('Profile image not found, using default.');
    };
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  showProjectsPopup(event: Event): void {
    event.preventDefault();
    this.showProjects = true;
  }

  closeProjectsPopup(): void {
    this.showProjects = false;
  }

  logout(): void {
    // Clear token/session
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict';
    this.router.navigate(['/login']);
  }

  // Placeholder methods for action buttons
  addProject(): void {
    console.log('Add Project clicked');
    // Navigate to an 'add project' route or open a modal
  }

  requestTraining(): void {
    console.log('Request Training clicked');
    // Navigate to a 'request training' route or open a modal
  }

  viewProjects(): void {
    console.log('View Projects clicked');
    // Navigate to a 'view projects' route or potentially show the popup
    this.showProjects = true;
  }

  viewTrainings(): void {
    console.log('View Trainings clicked');
    // Navigate to a 'view trainings' route
  }
}

