import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TestExecutionService } from '../../../../services/test-execution.service';
import { TestSetupItem } from '../../../../models/test-execution.model';

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

  summary: any = null;
  loading: boolean = true;

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