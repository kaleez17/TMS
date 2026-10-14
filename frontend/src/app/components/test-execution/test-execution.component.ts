import { Component, OnInit, inject, ChangeDetectorRef ,HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestExecutionService } from '../../services/test-execution.service';
import { TestSetupItem } from '../../models/test-execution.model';
import { ToastService } from '../../services/toast.service';
import { TestViewModalComponent } from './modals/test-view-modal/test-view-modal.component';
import { TestRunnerModalComponent } from './modals/test-runner-modal/test-runner-modal.component';
import { formatLockRemaining } from '../../models/lock-time.util';
import { Paginator } from '../../services/paginator';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-test-execution',
  standalone: true,
  imports: [CommonModule, FormsModule, TestViewModalComponent, TestRunnerModalComponent, PaginationComponent],
  templateUrl: './test-execution.component.html',
  styleUrls: ['./test-execution.component.css']
})
export class TestExecutionComponent implements OnInit {
  private readonly testService = inject(TestExecutionService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  allTests: TestSetupItem[] = [];

  // Client-side paging over the (status-filtered) list
  readonly paginator = new Paginator<TestSetupItem>(() => this.filteredTests, 5);
  loading: boolean = false;
  selectedStatusFilter: string = 'ALL';
  isStatusDropdownOpen: boolean = false;

  
  studentDetails = {
    fullCode: '—',
    name: '—',
    mode: 'Offline',
    joiningDate: '—',
    trainer: '—',
    mobile: '—'
  };

  activeViewTest: TestSetupItem | null = null;
  activeRunnerTest: TestSetupItem | null = null;

  ngOnInit(): void {
    setTimeout(() => {
      this.loadAssessments();
    }, 0);
  }

  loadAssessments(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.testService.getMyTests().subscribe({
      next: (res: TestSetupItem[]) => {
        this.allTests = res || [];
        // keep the current page, but never beyond the last page after a reload
        if (this.paginator.currentPage > this.paginator.totalPages) {
          this.paginator.currentPage = this.paginator.totalPages;
        }

        if (this.allTests.length > 0) {
          const first = this.allTests[0];
          this.studentDetails = {
            fullCode: `${first.studentId}-${first.studentNo}`,
            name: first.studentName || '—',
            mode: this.formatStudyMode(first.studyMode),
            joiningDate: first.joiningDate ? String(first.joiningDate) : '—',
            trainer: first.assignedStaff || first.testConductedBy || 'Senior Tech Lead',
            mobile: first.mobileNo ? String(first.mobileNo) : '—'
          };
        }

        this.loading = false;
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.error('Failed to load assessments', err);
        this.loading = false;
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }
  
  formatStudyMode(mode?: string): string {
  if (!mode) return 'Offline';
  const clean = mode.trim().toUpperCase();
  if (clean === 'OFF' || clean === 'OFFLINE') {
    return 'Offline';
  }
  if (clean === 'ON' || clean === 'ONLINE') {
    return 'Online';
  }
  return mode;
}

toggleStatusDropdown(event: MouseEvent): void {
  event.stopPropagation();
  this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
}

selectStatusFilter(status: string, event: MouseEvent): void {
  event.stopPropagation();
  this.selectedStatusFilter = status;
  this.paginator.reset();   // new filter -> back to page 1
  this.isStatusDropdownOpen = false;
}

// Click outside panna close aaganum:
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.custom-status-dropdown-wrapper')) {
    this.isStatusDropdownOpen = false;
  }
}

  // Locked status is stored in the database (stat = 2) and released by the server after 24 hours
  isLocked(test: TestSetupItem): boolean {
    return String(test.stat) === '2';
  }

  getRemainingLockTime(test: TestSetupItem): string {
    return formatLockRemaining(test.lockRemainingSeconds);
  }

  isCompleted(test: TestSetupItem): boolean {
    return String(test.stat) === '1' || String(test.stat).toLowerCase() === 'completed';
  }

  getTopicName(item: TestSetupItem): string {
    const anyItem = item as any;
    if (anyItem.topicName) return anyItem.topicName;
    if (item.courseId === 'BE') return 'Java 8';
    if (item.courseId === 'FE') return 'HTML5';
    return `Course Assessment (Batch #${item.courseNo})`;
  }

  get filteredTests(): TestSetupItem[] {
    if (this.selectedStatusFilter === 'SCHEDULED') {
      return this.allTests.filter(t => !this.isCompleted(t) && !this.isLocked(t));
    }
    if (this.selectedStatusFilter === 'COMPLETED') {
      return this.allTests.filter(t => this.isCompleted(t));
    }
    if (this.selectedStatusFilter === 'LOCKED') {
      return this.allTests.filter(t => this.isLocked(t));
    }
    return this.allTests;
  }

  get pagedTests(): TestSetupItem[] {
    return this.paginator.paged;
  }

  onPageChange(page: number): void {
    this.paginator.goToPage(page);
  }

  openViewModal(test: TestSetupItem): void {
    this.activeViewTest = test;
  }

  closeViewModal(): void {
    this.activeViewTest = null;
  }

  openRunnerModal(test: TestSetupItem): void {
    if (this.isLocked(test)) {
      this.handleLockedClick(test);
      return;
    }
    this.activeRunnerTest = test;
  }

  handleLockedClick(test: TestSetupItem): void {
    const remaining = this.getRemainingLockTime(test);
    this.toast.error(`Assessment locked due to tab-switch limit. Try again after ${remaining}.`);
  }

  onTestRunnerFinished(): void {
    this.activeRunnerTest = null;
    this.loadAssessments();
  }

  onTestRunnerCancelled(): void {
    this.activeRunnerTest = null;
    this.loadAssessments();
  }
}