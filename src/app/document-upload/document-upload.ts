import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Keep for ApiService if providedIn: 'root'
import { saveAs } from 'file-saver';
import { ApiService, Document as ApiDocument, UpdateStatusProposal } from '../api.service'; // Import ApiService and relevant DTOs

// Use ApiDocument interface directly or map if needed
type DocumentStatus = 'Pending' | 'Approved' | 'Rejected'; // Assuming these are the valid string statuses used in frontend logic

@Component({
    selector: 'app-document-upload',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        DatePipe
    ],
    templateUrl: './document-upload.html',
    styleUrls: ['./document-upload.css']
})
export class DocumentUploadComponent implements OnInit {

    // Component State
    documents: ApiDocument[] = []; // Use the interface from ApiService
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Popup Visibility Flags
    isUploadPopupVisible = false;
    isStatusPopupVisible = false;
    isDetailsPopupVisible = false;

    // Form Models
    selectedFile: File | null = null;
    newDocumentTitle = '';
    selectedStatus: number = 0; // API uses number for status (0: Pending, 1: Approved, 2: Rejected? Needs confirmation)
    doctorMessage = '';

    // State for Popups
    selectedDocumentIndex: number | null = null;
    selectedDocument: ApiDocument | null = null;

    constructor(
        private apiService: ApiService, // Inject ApiService
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = 'Authentication required. Please log in.';
            this.router.navigate(['/login']);
            return;
        }
        this.loadDocuments();
    }

    // --- Data Loading --- 
    loadDocuments(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.apiService.getDocuments().subscribe({
            next: (data) => {
                this.documents = data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading documents:', error);
                this.errorMessage = `Failed to load documents: ${error.message || 'Server error'}`;
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // --- Popup Management --- 
    showUploadPopup(): void {
        this.isUploadPopupVisible = true;
        this.resetUploadForm();
    }

    showStatusPopup(index: number): void {
        this.selectedDocumentIndex = index;
        this.selectedDocument = this.documents[index];
        // Map API status (number) to frontend status if needed, or adjust form
        this.selectedStatus = this.mapStringToApiStatus(this.selectedDocument.status || 'Pending'); // Default to Pending if null
        this.isStatusPopupVisible = true;
    }

    showDetailsPopup(index: number): void {
        this.selectedDocumentIndex = index;
        this.selectedDocument = { ...this.documents[index] }; // Create a copy
        this.doctorMessage = this.selectedDocument.commentFromDoctor || ''; // Load existing message
        this.isDetailsPopupVisible = true;
    }

    closePopups(): void {
        this.isUploadPopupVisible = false;
        this.isStatusPopupVisible = false;
        this.isDetailsPopupVisible = false;
        this.selectedDocumentIndex = null;
        this.selectedDocument = null;
        this.errorMessage = '';
        this.successMessage = '';
    }

    // --- Document Actions --- 
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        } else {
            this.selectedFile = null;
        }
    }

    resetUploadForm(): void {
        this.selectedFile = null;
        this.newDocumentTitle = '';
        const fileInput = document.getElementById('docFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    uploadDocument(): void {
        if (!this.selectedFile || !this.newDocumentTitle) {
            this.errorMessage = 'Please select a file and enter a title.';
            return;
        }
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = 'Authentication expired. Please log in again.';
            this.router.navigate(['/login']);
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.apiService.uploadDocument(this.selectedFile, this.newDocumentTitle).subscribe({
            next: (response) => {
                console.log('Upload successful:', response);
                this.isLoading = false;
                this.closePopups();
                this.loadDocuments(); // Refresh the list
                this.successMessage = 'Document uploaded successfully!';
                alert(this.successMessage); // Or use a more sophisticated notification
            },
            error: (error) => {
                console.error('Error uploading document:', error);
                this.errorMessage = `Failed to upload document: ${error.message || 'Server error'}`;
                this.isLoading = false;
                // Keep popup open on error to show message
                this.cdr.detectChanges();
            }
        });
    }

    downloadDocument(doc: ApiDocument): void {
        // Use pathDocument or urlDocument or id depending on what download endpoint expects
        // API spec has /Download-file/{file} - assuming {file} is pathDocument or maybe id?
        // Let's assume pathDocument for now, but this needs verification.
        const fileIdentifier = doc.pathDocument; 
        if (!fileIdentifier) {
            this.errorMessage = 'File path is missing, cannot download.';
            alert(this.errorMessage);
            return;
        }
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = 'Authentication expired. Please log in again.';
            this.router.navigate(['/login']);
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.apiService.downloadDocument(fileIdentifier).subscribe({
            next: (blob) => {
                // Use the original filename stored in the document object if available, otherwise use the identifier
                const filenameToSave = doc.title || fileIdentifier; // Prefer title if available
                saveAs(blob, filenameToSave);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error downloading document:', error);
                this.errorMessage = `Failed to download document: ${error.message || 'Server error'}`;
                this.isLoading = false;
                alert(this.errorMessage);
            }
        });
    }

    changeStatus(): void {
        if (this.selectedDocumentIndex === null || this.selectedDocument === null || !this.selectedDocument.studentId) {
            this.errorMessage = 'Cannot update status: document or student ID missing.';
            return;
        }
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = 'Authentication expired. Please log in again.';
            this.router.navigate(['/login']);
            return;
        }

        const payload: UpdateStatusProposal = {
            studentId: this.selectedDocument.studentId,
            status: this.selectedStatus, // API expects number
            details: '' // Add details if applicable, maybe from another input?
        };

        console.log(`Updating status for student ${payload.studentId} to ${payload.status}`);
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Using updateProposalStatus as per API mapping, confirm if this is correct for documents
        this.apiService.updateProposalStatus(payload).subscribe({
            next: (response) => {
                console.log('Status update successful:', response);
                this.isLoading = false;
                // Update local state optimistically or reload
                this.documents[this.selectedDocumentIndex!].status = this.mapApiStatusToString(this.selectedStatus);
                this.closePopups();
                this.successMessage = 'Document status updated successfully!';
                alert(this.successMessage);
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error updating status:', error);
                this.errorMessage = `Failed to update status: ${error.message || 'Server error'}`;
                this.isLoading = false;
                alert(this.errorMessage);
                // Keep popup open on error?
                this.cdr.detectChanges();
            }
        });
    }

    saveDoctorMessage(): void {
        if (this.selectedDocumentIndex === null || !this.selectedDocument || !this.selectedDocument.id) {
            this.errorMessage = 'Cannot save message: document or document ID missing.';
            return;
        }
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = 'Authentication expired. Please log in again.';
            this.router.navigate(['/login']);
            return;
        }

        console.log(`Saving doctor message for doc ${this.selectedDocument.id}: ${this.doctorMessage}`);
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // --- Placeholder: API call to save message --- 
        // Need a specific endpoint like /api/Grad/Document/{docId}/Comment
        // Example:
        // this.apiService.saveDocumentComment(this.selectedDocument.id, this.doctorMessage).subscribe({ ... });
        alert('API endpoint for saving doctor comment not defined yet.');
        this.isLoading = false;
        // --- End Placeholder --- 

        // Update local state optimistically for now
        this.documents[this.selectedDocumentIndex].commentFromDoctor = this.doctorMessage;
        this.closePopups();
        // alert('Doctor message saved locally (API call placeholder).');
    }

    // --- Utility Functions --- 
    // Map API status (string/null) to frontend display class
    getStatusClass(status: string | null | undefined): string {
        switch (status?.toLowerCase()) {
            // Adjust based on actual status strings returned by API
            case 'pending': return 'status-pending'; 
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    }

    // Map frontend status string to API status number (needs confirmation of mapping)
    mapStringToApiStatus(status: string): number {
        switch (status.toLowerCase()) {
            case 'pending': return 0;
            case 'approved': return 1;
            case 'rejected': return 2;
            default: return 0; // Default to pending
        }
    }

    // Map API status number back to frontend string (needs confirmation of mapping)
    mapApiStatusToString(status: number | null | undefined): DocumentStatus {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'Approved';
            case 2: return 'Rejected';
            default: return 'Pending'; // Default
        }
    }
}

