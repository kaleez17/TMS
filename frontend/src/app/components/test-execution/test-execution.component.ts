import { Component, OnInit, inject, ChangeDetectorRef ,HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestExecutionService } from '../../services/test-execution.service';
import { TestSetupItem } from '../../models/test-execution.model';
import { ToastService } from '../../services/toast.service';
import { TestViewModalComponent } from './modals/test-view-modal/test-view-modal.component';
import { TestRunnerModalComponent } from './modals/test-runner-modal/test-runner-modal.component';

@Component({
  selector: 'app-test-execution',
  standalone: true,
  imports: [CommonModule, FormsModule, TestViewModalComponent, TestRunnerModalComponent],
  templateUrl: './test-execution.component.html',
  styleUrls: ['./test-execution.component.css']
})
export class TestExecutionComponent implements OnInit {
  private readonly testService = inject(TestExecutionService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  allTests: TestSetupItem[] = [];
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

  private readonly LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

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

  getLockKey(test: TestSetupItem): string {
    const sNo = Number(test?.studentNo ?? 0);
    const tNo = Number(test?.testNo ?? 0);
    const tDate = String(test?.testDate ?? '');
    return `test_locked_${sNo}_${tNo}_${tDate}`;
  }

  isLocked(test: TestSetupItem): boolean {
    const lockKey = this.getLockKey(test);
    const lockTimeStr = localStorage.getItem(lockKey);
    if (!lockTimeStr) return false;

    const lockTime = Number(lockTimeStr);
    const now = Date.now();

    if (now - lockTime >= this.LOCK_DURATION_MS) {
      localStorage.removeItem(lockKey);
      return false;
    }
    return true;
  }

  getRemainingLockTime(test: TestSetupItem): string {
    const lockKey = this.getLockKey(test);
    const lockTimeStr = localStorage.getItem(lockKey);
    if (!lockTimeStr) return '24h';

    const lockTime = Number(lockTimeStr);
    const elapsed = Date.now() - lockTime;
    const remainingMs = Math.max(0, this.LOCK_DURATION_MS - elapsed);

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0 && minutes === 0) return 'less than a minute';
    return `${hours}h ${minutes}m`;
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