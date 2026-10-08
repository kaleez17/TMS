import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestSetupService } from '../../../services/test-setup.service';
import { ToastService } from '../../../services/toast.service';
import { TestSetupDTO, CourseDetDTO, Evaluator } from '../../../models/test-setup.model';

@Component({
  selector: 'app-modify-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modify-modal.component.html'
})
export class ModifyModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() record: TestSetupDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TestSetupService);
  private readonly toast = inject(ToastService);

  form!: FormGroup;
  courses: string[] = [];
  topics: CourseDetDTO[] = [];
  evaluators: Evaluator[] = [];
  submitting = false;

  constructor() {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.record) {
      this.loadLookupsAndPatch(this.record);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      // Locked primary keys (Read-only)
      studentNo: [{ value: null, disabled: true }, Validators.required],
      studentId: [{ value: '', disabled: true }, Validators.required],
      studentName: [{ value: '', disabled: true }],
      mobileNo: [{ value: '', disabled: true }],
      testDate: [{ value: '', disabled: true }, Validators.required],
      testNo: [{ value: null, disabled: true }, Validators.required],
      // Editable fields
      courseId: ['', Validators.required],
      courseNo: [null, Validators.required],
      lvl: [1, Validators.required],
      noOfQuestions: [10, [Validators.required, Validators.min(1)]],
      timingValue: [30, [Validators.required, Validators.min(1)]],
      timingUnit: ['MINS', Validators.required],
      testConductedBy: ['', Validators.required],
      delFlag: ['A', Validators.required]
    });

    this.form.get('courseId')?.valueChanges.subscribe(cid => {
      if (cid) this.loadTopics(cid);
    });
  }

  private loadLookupsAndPatch(data: TestSetupDTO): void {
    this.service.getCourses().subscribe(c => this.courses = c);
    this.service.getEvaluators().subscribe(e => this.evaluators = e);

    const totalSecs = data.timePerTest || 0;
    const isMins = totalSecs > 0 && totalSecs % 60 === 0;

    this.form.patchValue({
      studentNo: data.studentNo,
      studentId: data.studentId,
      studentName: data.studentName,
      mobileNo: data.mobileNo,
      testDate: data.testDate,
      testNo: data.testNo,
      courseId: data.courseId,
      lvl: data.lvl,
      noOfQuestions: data.noOfQuestions || 10,
      timingValue: isMins ? (totalSecs / 60) : (totalSecs || 30),
      timingUnit: isMins || totalSecs === 0 ? 'MINS' : 'SECS',
      testConductedBy: data.testConductedBy,
      delFlag: data.delFlag || 'A'
    });

    if (data.courseId) {
      this.service.getCourseDetails(data.courseId).subscribe(t => {
        this.topics = t;
        this.form.patchValue({ courseNo: data.courseNo });
      });
    }
  }

  loadTopics(cid: string): void {
    this.service.getCourseDetails(cid).subscribe(t => {
      this.topics = t;
      if (t.length > 0 && !this.topics.some(x => x.courseDetId === this.form.get('courseNo')?.value)) {
        this.form.patchValue({ courseNo: t[0].courseDetId });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    const raw = this.form.getRawValue();
    const totalSeconds = raw.timingUnit === 'MINS'
      ? Number(raw.timingValue) * 60
      : Number(raw.timingValue);

    const payload: TestSetupDTO = {
      ...raw,
      noOfQuestions: Number(raw.noOfQuestions),
      timePerTest: totalSeconds
    };

    // Clean up temporary UI form controls before sending to backend
    delete (payload as any).timingValue;
    delete (payload as any).timingUnit;

    this.service.update(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Test Setup updated successfully!');
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message || 'Failed to update');
      }
    });
  }
}