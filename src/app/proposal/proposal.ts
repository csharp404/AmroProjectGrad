import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Keep for ApiService if providedIn: 'root'
import { ApiService, ProposalDto, StudentDetails, TasksDto } from '../api.service'; // Import ApiService and DTOs

// Interface for local task management within the component
interface ComponentTask {
    name: string;
    start: string; // Keep as string for date input binding
    end: string;   // Keep as string for date input binding
    description: string;
}

@Component({
    selector: 'app-proposal',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
    templateUrl: './proposal.html',
    styleUrls: ['./proposal.css']
})
export class ProposalComponent implements OnInit, AfterViewInit {
    @ViewChild('proposalNgForm') proposalNgForm!: NgForm; // Reference to the form
    @ViewChild('ganttChart') ganttChartElement!: ElementRef<HTMLDivElement>;

    // Form Models - Align closer to DTOs where possible
    studentInfo = {
        name1: '', id1: '',
        name2: '', id2: '',
        name3: '', id3: '',
        name4: '', id4: '',
        departmentId: '', // Corresponds to ProposalDto.departmentId
        supervisorId: ''  // Corresponds to ProposalDto.doctorId
    };
    projectDetails = {
        title: '',         // Corresponds to ProposalDto.title
        number: '',        // Corresponds to ProposalDto.number
        description: '',   // Corresponds to ProposalDto.description
        objectives: ''     // Corresponds to ProposalDto.objective
    };
    timelineText = '';     // Corresponds to ProposalDto.timeLine
    
    // Local task model for the form input
    newTask: ComponentTask = { name: '', start: '', end: '', description: '' };
    // Array to hold tasks added via the form
    tasks: ComponentTask[] = [];

    // State
    departmentMessage = '';
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    ganttMinDate: Date | null = null;
    ganttMaxDate: Date | null = null;
    ganttTotalDays = 0;

    constructor(
        private apiService: ApiService, // Inject ApiService
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Check authentication using ApiService
        if (!this.apiService.isAuthenticated()) {
            console.error('Authentication required.');
            this.errorMessage = 'Authentication required. Please log in.';
            this.router.navigate(['/login']); // Redirect to login if not authenticated
        }
        // TODO: Fetch necessary data like departments or supervisors if needed for dropdowns
    }

    ngAfterViewInit(): void {
        // Initial render if tasks exist (e.g., loaded from draft)
        this.calculateGanttDates();
        this.cdr.detectChanges(); // Ensure view updates after calculations
    }

    // --- Department Validation --- 
    validateDepartment(): void {
        // Assuming specific GUIDs trigger messages (These should ideally come from API or config)
        const csGuid = "75A36EE9-6EF6-44E7-A028-7EB53F1377AF"; // Example CS GUID
        const isGuid = "ANOTHER_GUID_FOR_IS"; // Example IS GUID - Needs actual value

        if (this.studentInfo.departmentId === csGuid) {
            this.departmentMessage = "هذا الاختيار يشمل جميع تخصصات علم الحاسوب";
        } else if (this.studentInfo.departmentId === isGuid) {
            this.departmentMessage = "هذا الاختيار يشمل جميع تخصصات النظم";
        } else {
            this.departmentMessage = '';
        }
    }

    // --- Gantt Chart Logic (Remains mostly the same, uses local ComponentTask) --- 
    addTask(): void {
        if (!this.newTask.name || !this.newTask.start || !this.newTask.end) {
            alert("يرجى ملء اسم المهمة وتواريخ البدء والانتهاء!");
            return;
        }
        if (new Date(this.newTask.end) < new Date(this.newTask.start)) {
            alert("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء!");
            return;
        }

        this.tasks.push({ ...this.newTask });
        this.newTask = { name: '', start: '', end: '', description: '' }; // Reset form
        this.calculateGanttDates(); // Recalculate dates for rendering
        this.cdr.detectChanges(); // Trigger view update
    }

    calculateGanttDates(): void {
        if (this.tasks.length === 0) {
            this.ganttMinDate = null;
            this.ganttMaxDate = null;
            this.ganttTotalDays = 0;
            return;
        }

        const allDates = this.tasks.flatMap(t => [new Date(t.start), new Date(t.end)]);
        this.ganttMinDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        this.ganttMaxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        this.ganttMaxDate.setDate(this.ganttMaxDate.getDate() + 1);

        this.ganttTotalDays = (this.ganttMaxDate.getTime() - this.ganttMinDate.getTime()) / (1000 * 60 * 60 * 24);
        if (this.ganttTotalDays <= 0) this.ganttTotalDays = 1; 
    }

    calculateTaskStartOffset(task: ComponentTask): number {
        if (!this.ganttMinDate || !this.ganttTotalDays) return 0;
        const taskStart = new Date(task.start);
        const offsetDays = (taskStart.getTime() - this.ganttMinDate.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, (offsetDays / this.ganttTotalDays) * 100);
    }

    calculateTaskWidth(task: ComponentTask): number {
        if (!this.ganttMinDate || !this.ganttTotalDays) return 0;
        const taskStart = new Date(task.start);
        const taskEnd = new Date(task.end);
        const durationDays = ((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const width = (durationDays / this.ganttTotalDays) * 100;
        const startOffset = this.calculateTaskStartOffset(task);
        return Math.max(0, Math.min(width, 100 - startOffset));
    }

    getTaskColor(index: number): string {
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22'];
        return colors[index % colors.length];
    }

    // --- Form Submission --- 
    submitProposal(): void {
        if (this.proposalNgForm.invalid) {
            this.errorMessage = "يرجى ملء جميع الحقول المطلوبة.";
            Object.values(this.proposalNgForm.controls).forEach(control => {
                control.markAsTouched();
            });
            return;
        }
        // Check auth again before submitting
        if (!this.apiService.isAuthenticated()) {
            this.errorMessage = "خطأ: لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.";
            this.router.navigate(['/login']);
            return;
        }

        // Map form data to ProposalDto
        const students: StudentDetails[] = [];
        if (this.studentInfo.name1 && this.studentInfo.id1) students.push({ name: this.studentInfo.name1, number: this.studentInfo.id1 });
        if (this.studentInfo.name2 && this.studentInfo.id2) students.push({ name: this.studentInfo.name2, number: this.studentInfo.id2 });
        if (this.studentInfo.name3 && this.studentInfo.id3) students.push({ name: this.studentInfo.name3, number: this.studentInfo.id3 });
        if (this.studentInfo.name4 && this.studentInfo.id4) students.push({ name: this.studentInfo.name4, number: this.studentInfo.id4 });

        if (students.length === 0) {
            this.errorMessage = "يرجى إدخال اسم ورقم طالب واحد على الأقل.";
            return;
        }

        const apiTasks: TasksDto[] = this.tasks.map(task => ({
            title: task.name,
            description: task.description,
            starTime: new Date(task.start).toISOString(), // Convert to ISO string for API
            endTime: new Date(task.end).toISOString()   // Convert to ISO string for API
        }));

        const payload: ProposalDto = {
            students: students,
            doctorId: this.studentInfo.supervisorId,
            departmentId: this.studentInfo.departmentId,
            title: this.projectDetails.title,
            description: this.projectDetails.description,
            number: this.projectDetails.number,
            objective: this.projectDetails.objectives,
            timeLine: this.timelineText,
            tasks: apiTasks
        };

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Use ApiService to submit the proposal
        this.apiService.createProposal(payload).subscribe({
            next: (response) => {
                console.log("Proposal submitted successfully", response);
                this.successMessage = "تم إرسال الاقتراح بنجاح!";
                this.isLoading = false;
                // Optionally reset form or navigate
                // this.proposalNgForm.resetForm();
                // this.tasks = [];
                // this.calculateGanttDates();
                alert(this.successMessage); // Simple alert for now
                this.router.navigate(['/dashboard']); // Navigate to dashboard on success
            },
            error: (error) => {
                console.error("Error submitting proposal:", error);
                this.errorMessage = `خطأ في إرسال الاقتراح: ${error.message || 'Unknown error'}`;
                this.isLoading = false;
                alert(this.errorMessage); // Show error alert
            }
        });
    }
}

