import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestExecutionService } from '../../../../services/test-execution.service';
import { TestSetupItem } from '../../../../models/test-execution.model';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-test-runner-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-runner-modal.component.html',
  styleUrls: ['./test-runner-modal.component.css']
})
export class TestRunnerModalComponent implements OnInit, OnDestroy {
  private readonly testService = inject(TestExecutionService);
  private readonly toast = inject(ToastService);

  @Input({ required: true }) testData!: TestSetupItem;
  @Output() testFinished = new EventEmitter<void>();
  @Output() testCancelled = new EventEmitter<void>();

  questions: any[] = [];
  currentIndex: number = 0;
  selectedOption: string | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  isCompleted: boolean = false;

  tabSwitchCount: number = 0;
  maxWarnings: number = 3;
  showWarningBanner: boolean = false;
  warningMessage: string = '';

  totalSecondsRemaining: number = 0;
  timerInterval: any = null;
  formattedTime: string = '00:00';
  isTimeCritical: boolean = false;

  ngOnInit(): void {
    const sNo = Number(this.testData?.studentNo ?? 0);
    const tNo = Number(this.testData?.testNo ?? 0);
    const tDate = String(this.testData?.testDate ?? '');

    const lockKey = `test_locked_${sNo}_${tNo}_${tDate}`;
    if (localStorage.getItem(lockKey)) {
      this.toast.error('You have exceeded tab switch limits. This test is locked for today!');
      this.testCancelled.emit();
      return;
    }

    this.startTestFresh();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    if (this.isCompleted || this.loading || this.questions.length === 0) return;

    this.tabSwitchCount++;
    const sNo = Number(this.testData?.studentNo ?? 0);
    const sId = String(this.testData?.studentId ?? '');
    const tNo = Number(this.testData?.testNo ?? 0);
    const tDate = String(this.testData?.testDate ?? '');

    if (this.tabSwitchCount >= this.maxWarnings) {
      const lockKey = `test_locked_${sNo}_${tNo}_${tDate}`;
      localStorage.setItem(lockKey, Date.now().toString());
      this.stopTimer();
      this.testService.resetAttempt(sNo, sId, tNo, tDate).subscribe();
      this.toast.error('Violation limit reached (3/3). Exam cancelled and locked for today!');
      this.testCancelled.emit();
    } else {
      this.warningMessage = `Tab Switch Warning (${this.tabSwitchCount}/${this.maxWarnings}): Do not switch tabs or minimize window!`;
      this.showWarningBanner = true;
      this.toast.error(`Warning ${this.tabSwitchCount}/${this.maxWarnings}: Tab switch detected! Exam reset.`);
      this.resetAndRestartExam();
    }
  }

  startTestFresh(): void {
    this.stopTimer();
    this.loading = true;
    this.currentIndex = 0;
    this.selectedOption = null;

    const anyTest = this.testData as any;
    const courseId = String(this.testData?.courseId ?? '');
    const courseNo = Number(this.testData?.courseNo ?? 0);
    const level = Number(anyTest?.lvl ?? anyTest?.level ?? 1);
    const limit = Number(anyTest?.noOfQuestions ?? 10);
    
    let rawDuration = Number(anyTest?.timePerTest ?? anyTest?.duration ?? 15);
    let durationMinutes = rawDuration > 60 ? Math.round(rawDuration / 60) : rawDuration;
    if (durationMinutes <= 0) durationMinutes = 15;

    this.initTimer(durationMinutes);

    this.testService.getQuestions(courseId, courseNo, level, limit, durationMinutes).subscribe({
      next: (res: any[]) => {
        this.questions = [...(res || [])].sort(() => Math.random() - 0.5);
        this.loading = false;
        this.startTimer();
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load questions', err);
        this.toast.error('Failed to load assessment questions from server.');
        this.testCancelled.emit();
      }
    });
  }

  initTimer(minutes: number): void {
    this.totalSecondsRemaining = minutes * 60;
    this.updateFormattedTime();
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.totalSecondsRemaining > 0) {
        this.totalSecondsRemaining--;
        this.updateFormattedTime();
        if (this.totalSecondsRemaining <= 180) {
          this.isTimeCritical = true;
        }
      } else {
        this.stopTimer();
        this.toast.error('Time expired! Unanswered questions marked with 0 score.');
        this.completeExam();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateFormattedTime(): void {
    const mins = Math.floor(this.totalSecondsRemaining / 60);
    const secs = this.totalSecondsRemaining % 60;
    this.formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.questions.length) return 0;
    return Math.round(((this.currentIndex + 1) / this.questions.length) * 100);
  }

  resetAndRestartExam(): void {
    const sNo = Number(this.testData?.studentNo ?? 0);
    const sId = String(this.testData?.studentId ?? '');
    const tNo = Number(this.testData?.testNo ?? 0);
    const tDate = String(this.testData?.testDate ?? '');

    this.testService.resetAttempt(sNo, sId, tNo, tDate).subscribe({
      next: () => this.startTestFresh(),
      error: () => this.startTestFresh()
    });
  }

  selectOptionAndAutoSubmit(optionLetter: string): void {
    if (this.submitting || !this.questions[this.currentIndex]) return;

    this.selectedOption = optionLetter;
    this.submitting = true;

    const currentQ = this.questions[this.currentIndex];
    const payload = {
      studentNo: Number(this.testData.studentNo),
      studentId: String(this.testData.studentId),
      testNo: Number(this.testData.testNo),
      testDate: String(this.testData.testDate),
      questionNo: Number(currentQ.questionNo),
      courseId: String(this.testData.courseId ?? ''),
      courseNo: Number(this.testData.courseNo ?? 0),
      selectedAns: optionLetter
    };

    this.testService.submitAnswer(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.selectedOption = null;

        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
        } else {
          this.completeExam();
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Answer submission error', err);
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
        } else {
          this.completeExam();
        }
      }
    });
  }

  completeExam(): void {
    this.isCompleted = true;
    this.stopTimer();

    const sNo = Number(this.testData.studentNo);
    const sId = String(this.testData.studentId);
    const tNo = Number(this.testData.testNo);
    const tDate = String(this.testData.testDate);

    this.testService.completeTest(sNo, sId, tNo, tDate).subscribe({
      next: () => {
        this.toast.success('Assessment completed and submitted successfully!');
        this.testFinished.emit();
      },
      error: () => {
        this.testFinished.emit();
      }
    });
  }

  resumeTest(): void {
    this.showWarningBanner = false;
  }

  closeModal(): void {
    this.stopTimer();
    this.toast.error('Assessment session closed.');
    this.testCancelled.emit();
  }
}