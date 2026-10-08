import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestSetupService } from '../../services/test-setup.service';
import { TestSetupDTO, CourseDetDTO } from '../../models/test-setup.model';
import { NewModalComponent } from './new-modal/new-modal.component';
import { ModifyModalComponent } from './modify-modal/modify-modal.component';
import { ViewModalComponent } from './view-modal/view-modal.component';
import { PaginationComponent } from '../pagination/pagination.component'; 

@Component({
  selector: 'app-test-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    NewModalComponent,
    ModifyModalComponent,
    ViewModalComponent
  ],
  templateUrl: './test-setup.component.html',
  styleUrls: ['./test-setup.component.css']
})
export class TestSetupComponent implements OnInit {
  private readonly service = inject(TestSetupService);

  records: TestSetupDTO[] = [];
  courses: string[] = [];
  filterTopics: CourseDetDTO[] = [];
  selectedCourse = '';
  selectedCourseNo: number | null = null;
  searchStudentQuery = '';
  statusFilter = 'ALL';
  isStatusDropdownOpen = false;
  loading = false;

 
  currentPage = 1;    
  pageSize = 4;        
  totalPages = 1;
  totalRecords = 0;

  isNewOpen = false;
  isModifyOpen = false;
  isViewOpen = false;
  selectedRecord: TestSetupDTO | null = null;

  ngOnInit(): void {
    this.loadCourses();
    this.loadGrid();
  }

  loadCourses(): void {
    this.service.getCourses().subscribe({
      next: (res) => (this.courses = res || []),
      error: () => (this.courses = [])
    });
  }
  // Student name type pannumbodhu filter trigger aagum
  onStudentSearchChange(): void {
    this.currentPage = 1; // Page 1-ku reset
    this.loadGrid();
  }



  loadGrid(): void {
    this.loading = true;
    const studentNo =
      this.searchStudentQuery && !isNaN(Number(this.searchStudentQuery))
        ? Number(this.searchStudentQuery)
        : null;

    const backendPage = Math.max(0, this.currentPage - 1);

    this.service
      .getGridData(studentNo, this.statusFilter, backendPage, this.pageSize)
      .subscribe({
        next: (res) => {
          let list = res.content || [];

          // Student Name / Student ID filter
          if (this.searchStudentQuery && isNaN(Number(this.searchStudentQuery))) {
            const query = this.searchStudentQuery.toLowerCase().trim();
            list = list.filter(
              (r) =>
                (r.studentName && r.studentName.toLowerCase().includes(query)) ||
                (r.studentId && r.studentId.toLowerCase().includes(query))
            );
          }

          this.records = list;
          this.totalRecords = res.totalElements;
          this.totalPages = Math.max(1, res.totalPages);
          this.loading = false;
        },
        error: () => {
          this.records = [];
          this.loading = false;
        }
      });
  }
  // PaginationComponent emit pannumbothu trigger aagum
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadGrid();
  }

  onCourseFilterChange(courseId: string): void {
    this.selectedCourse = courseId;
    this.selectedCourseNo = null;
    this.currentPage = 1;
    if (courseId) {
      this.service.getCourseDetails(courseId).subscribe({
        next: (topics) => {
          this.filterTopics = topics || [];
          this.loadGrid();
        },
        error: () => {
          this.filterTopics = [];
          this.loadGrid();
        }
      });
    } else {
      this.filterTopics = [];
      this.loadGrid();
    }
  }

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  changeStatusFilter(status: string): void {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.currentPage = 1;
    this.loadGrid();
  }

  clearSearch(): void {
    this.searchStudentQuery = '';
    this.currentPage = 1;
    this.loadGrid();
  }

  openNew(): void {
    this.isNewOpen = true;
  }

  openView(rec: TestSetupDTO): void {
    console.log('Selected Test Setup Record from Backend:', rec);
    this.selectedRecord = rec;
    this.isViewOpen = true;
  }

  openModify(rec: TestSetupDTO): void {
    this.selectedRecord = rec;
    this.isViewOpen = false;
    this.isModifyOpen = true;
  }
}