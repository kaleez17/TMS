import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TestExecutionService } from '../../../../services/test-execution.service';
import { TestSetupItem, TestQuestionResult, TestResultDetails } from '../../../../models/test-execution.model';
import { formatLockRemaining } from '../../../../models/lock-time.util';

@Component({
  selector: 'app-test-view-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './test-view-modal.component.html',
  styleUrls: ['./test-view-modal.component.css']
})
export class TestViewModalComponent implements OnInit {
  private readonly testService = inject(TestExecutionService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) testData!: TestSetupItem;
  @Output() closeModal = new EventEmitter<void>();

  // Used by the admin Test Report Dashboard only (the student screen leaves these off)
  @Input() allowUnlock = false;
  @Input() unlocking = false;
  @Output() unlock = new EventEmitter<void>();

  summary: any = null;
  loading: boolean = true;

  // "View More" (Completed tests): question-wise answers + score
  showDetails = false;
  details: TestResultDetails | null = null;
  detailsLoading = false;
  detailsError = '';

  ngOnInit(): void {
    const sNo = Number(this.testData?.studentNo ?? 0);
    const sId = String(this.testData?.studentId ?? '');
    const tNo = Number(this.testData?.testNo ?? 0);
    const tDate = String(this.testData?.testDate ?? '');

    this.testService.getTestSummary(sNo, sId, tNo, tDate).subscribe({
      next: (res) => {
        this.summary = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback default if not yet taken or standalone
        this.summary = {
          totalAssignedQuestions: this.testData?.noOfQuestions || 10,
          totalAttendedQuestions: this.isCompleted ? (this.testData?.noOfQuestions || 10) : 0,
          totalScore: 0,
          percentage: 0,
          resultStatus: this.isCompleted ? 'COMPLETED' : 'SCHEDULED'
        };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get isCompleted(): boolean {
    return String(this.testData?.stat) === '1' || String(this.testData?.stat).toLowerCase() === 'completed';
  }

  // stat 2 = Locked (saved in the database)
  get isLocked(): boolean {
    return String(this.testData?.stat) === '2';
  }

  // Time left before the server auto-unlocks (never more than 24h)
  get unlockIn(): string {
    return formatLockRemaining(this.testData?.lockRemainingSeconds);
  }

  /** View More: load every question with the answer given, the correct answer and the score. */
  openDetails(): void {
    this.showDetails = true;
    if (this.details) return;   // already loaded

    this.detailsLoading = true;
    this.detailsError = '';
    this.testService.getTestDetails(
      Number(this.testData?.studentNo ?? 0),
      String(this.testData?.studentId ?? ''),
      Number(this.testData?.testNo ?? 0),
      String(this.testData?.testDate ?? '')
    ).subscribe({
      next: (res) => {
        this.details = res;
        this.detailsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.detailsError = 'Unable to load the question details.';
        this.detailsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  backToSummary(): void {
    this.showDetails = false;
  }

  /** Option text for a letter, e.g. optionText(row, 'B') */
  optionText(q: TestQuestionResult, letter: string | null): string {
    switch ((letter || '').toUpperCase()) {
      case 'A': return q.optA || '';
      case 'B': return q.optB || '';
      case 'C': return q.optC || '';
      case 'D': return q.optD || '';
      default:  return '';
    }
  }

  onUnlock(): void {
    this.unlock.emit();
  }

  getTopicTitle(): string {
    const anyItem = this.testData as any;
    if (anyItem?.topicName) return anyItem.topicName;
    if (this.testData?.courseId === 'BE') return 'Java 8';
    if (this.testData?.courseId === 'FE') return 'HTML5';
    return `Course Assessment (Batch #${this.testData?.courseNo})`;
  }

  onClose(): void {
    this.closeModal.emit();
  }
}