import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define interfaces based on API schemas (can be moved to separate files later)
// Basic interfaces - can be expanded based on full schema
export interface LoginDto {
  email?: string | null;
  password?: string | null;
}

export interface SignUpDTO {
    studentNumber?: string | null;
    studentName?: string | null;
    password?: string | null;
    email?: string | null;
    departmentId?: string | null;
    role?: number;
}

export interface StudentDetails {
    name?: string | null;
    number?: string | null;
}

export interface TasksDto {
    title?: string | null;
    description?: string | null;
    starTime?: string; // date-time ISO 8601 format
    endTime?: string; // date-time ISO 8601 format
}

export interface ProposalDto {
    students?: StudentDetails[] | null;
    doctorId?: string; // uuid
    departmentId?: string; // uuid
    title?: string | null;
    description?: string | null;
    number?: string | null;
    objective?: string | null;
    timeLine?: string | null;
    tasks?: TasksDto[] | null;
}

export interface Document {
    id?: string; // uuid
    title?: string | null;
    status?: string | null;
    uploadedAt?: string; // date-time
    pathDocument?: string | null;
    urlDocument?: string | null;
    commentFromDoctor?: string | null;
    studentId?: string; // uuid
    // student?: Student; // Assuming Student schema exists
}

export interface AppointmentDto {
    studentId?: string | null; // Likely implicit from logged-in user
    date?: string | null; // date-time
    time?: string | null; // date-time - API uses separate date/time, might need adjustment in backend or frontend mapping
}

export interface Appointment {
    id?: string; // uuid
    dateAppointment?: string | null;
    timeAppointment?: string | null;
    stauts?: string | null; // Typo in API spec? Should be status?
    studentId?: string; // uuid
    // student?: Student;
}

export interface UpdateStatusProposal {
    studentId?: string | null;
    status?: number; // int32
    details?: string | null;
}

// Interface for ProjectDetails (simplified)
export interface ProjectDetails {
    id?: string;
    title?: string | null;
    description?: string | null;
    status?: number | null;
    statusDetails?: string | null;
    students?: StudentDetails[] | null;
    // Add other fields as needed
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // TODO: Confirm this base URL or make it configurable
  private API_BASE_URL = 'https://localhost:7133'; 

  constructor(private http: HttpClient) { }

  // --- Authentication Token Handling --- 

  private getToken(): string | null {
    // Retrieve token from localStorage (or sessionStorage)
    return localStorage.getItem('authToken'); // Use a consistent key like 'authToken'
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // --- HTTP Headers --- 

  private getAuthHeaders(contentType: string = 'application/json'): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    
    if (contentType) {
        headers = headers.set('Content-Type', contentType);
    }

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Headers specifically for FormData uploads (Content-Type is set by browser)
  private getAuthHeadersForUpload(): HttpHeaders {
      const token = this.getToken();
      let headers = new HttpHeaders();
      if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
  }

  // --- Error Handling --- 
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      // The response body may contain clues as to what went wrong
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
          errorMessage += ` Details: ${error.error}`;
      } else if (error.error && error.error.title) {
          errorMessage += ` Title: ${error.error.title}`;
      }
    }
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }

  // --- Account Endpoints --- 

  register(data: SignUpDTO): Observable<string> {
    // Assuming API returns plain text on success
    return this.http.post(`${this.API_BASE_URL}/api/Account/register`, data, { 
        headers: this.getAuthHeaders(), 
        responseType: 'text' 
    })
      .pipe(catchError(this.handleError));
  }

  login(data: LoginDto): Observable<string> {
    // Assuming API returns the JWT token as plain text
    return this.http.post(`${this.API_BASE_URL}/api/Account/login`, data, { 
        headers: this.getAuthHeaders(), 
        responseType: 'text' 
    })
      .pipe(catchError(this.handleError));
  }

  // --- Grad Endpoints (Student Perspective) --- 

  createProposal(data: ProposalDto): Observable<any> { // Assuming 200 OK on success
    return this.http.post<any>(`${this.API_BASE_URL}/api/Grad/Create-Proposal`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  uploadDocument(file: File, title: string): Observable<any> { // Assuming 200 OK on success
    const formData = new FormData();
    formData.append('File', file, file.name);
    const params = new HttpParams().set('Title', title);
    return this.http.post<any>(`${this.API_BASE_URL}/api/Grad/Upload-Document`, formData, { 
        headers: this.getAuthHeadersForUpload(), // No Content-Type needed for FormData
        params: params 
    })
      .pipe(catchError(this.handleError));
  }

  getDocuments(): Observable<Document[]> { 
    return this.http.get<Document[]>(`${this.API_BASE_URL}/api/Grad/Get-Document`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  downloadDocument(fileName: string): Observable<Blob> {
    // Use the 'file' path parameter as defined in the API spec
    return this.http.get(`${this.API_BASE_URL}/api/Grad/Download-file/${encodeURIComponent(fileName)}`, { 
      headers: this.getAuthHeaders(), 
      responseType: 'blob' 
    })
      .pipe(catchError(this.handleError));
  }

  createAppointment(data: AppointmentDto): Observable<any> { // Assuming 200 OK on success
    return this.http.post<any>(`${this.API_BASE_URL}/api/Grad/Create-Appointment`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAppointments(): Observable<Appointment[]> { 
    return this.http.get<Appointment[]>(`${this.API_BASE_URL}/api/Grad/Get-Appointment`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- Grad Endpoints (Doctor Perspective) --- 

  getProposalsForDoctor(): Observable<ProjectDetails[]> { // Assuming response is array of ProjectDetails
      return this.http.get<ProjectDetails[]>(`${this.API_BASE_URL}/api/Grad/Proposal-Get-By-DoctorId`, { headers: this.getAuthHeaders() })
          .pipe(catchError(this.handleError));
  }
  
  getProposalById(studentNumber: string): Observable<ProjectDetails> { // Assuming response is single ProjectDetails
      return this.http.get<ProjectDetails>(`${this.API_BASE_URL}/api/Grad/Proposal-Get-By-Id/${studentNumber}`, { headers: this.getAuthHeaders() })
          .pipe(catchError(this.handleError));
  }

  updateProposalStatus(data: UpdateStatusProposal): Observable<any> { // Assuming 200 OK on success
      return this.http.put<any>(`${this.API_BASE_URL}/api/Grad/Proposal-Update-Status`, data, { headers: this.getAuthHeaders() })
          .pipe(catchError(this.handleError));
  }

  getAppointmentsForDoctor(): Observable<Appointment[]> { 
      return this.http.get<Appointment[]>(`${this.API_BASE_URL}/api/Grad/Get-Appointment-asDoctor`, { headers: this.getAuthHeaders() })
          .pipe(catchError(this.handleError));
  }
  
  updateAppointment(data: AppointmentDto): Observable<any> { // Assuming 200 OK on success
      // Note: API spec shows POST for update, using PUT might be more standard REST practice
      // Also, the DTO might need an appointment ID for updates.
      return this.http.post<any>(`${this.API_BASE_URL}/api/Grad/Update-Appointment`, data, { headers: this.getAuthHeaders() })
          .pipe(catchError(this.handleError));
  }

  // --- Internship Endpoints (Placeholder - Add if needed) --- 
  // Example:
  // getInternshipsForDoctor(): Observable<any[]> {
  //     return this.http.get<any[]>(`${this.API_BASE_URL}/api/Internship/Get-Internship-By-Doctor-ID`, { headers: this.getAuthHeaders() })
  //         .pipe(catchError(this.handleError));
  // }

}

