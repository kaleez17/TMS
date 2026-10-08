import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TestSetupService } from '../../../services/test-setup.service';
import { ToastService } from '../../../services/toast.service';
import { StudentSearchDTO, CourseDetDTO, Evaluator } from '../../../models/test-setup.model';

@Component({
  selector: 'app-new-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './new-modal.component.html',
  styleUrls: ['./new-modal.component.css']
})
export class NewModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TestSetupService);
  private readonly toast = inject(ToastService);

  todayDate = new Date().toISOString().split('T')[0];
  form!: FormGroup;
  courses: string[] = [];
  topics: CourseDetDTO[] = [];
  evaluators: Evaluator[] = [];
  searchResults: StudentSearchDTO[] = [];
  searchQuery = '';
  submitting = false;

  constructor() {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetEverything();
      this.loadLookups();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      studentNo: [null, Validators.required],
      studentId: ['', Validators.required],
      studentName: [''],
      mobileNo: [''],
      testDate: [this.todayDate, Validators.required],
      testNo: [{ value: 1, disabled: true }, Validators.required],
      courseId: ['', Validators.required],
      courseNo: [null, Validators.required],
      lvl: [1, Validators.required],
      noOfQuestions: [10, [Validators.required, Validators.min(1)]],
      timingValue: [30, [Validators.required, Validators.min(1)]],
      timingUnit: [null, Validators.required],
      testConductedBy: ['', Validators.required],
      delFlag: ['A', Validators.required]
    });

    this.form.get('courseId')?.valueChanges.subscribe(cid => {
      if (cid) this.loadTopics(cid);
      else this.topics = [];
    });

    this.form.get('testDate')?.valueChanges.subscribe(date => {
      const sNo = this.form.get('studentNo')?.value;
      if (sNo && date) this.fetchTestNo(sNo, date);
    });
  }

  // new-modal.component.ts

resetEverything(): void {
  this.searchQuery = '';
  this.searchResults = [];
  this.topics = []; // Reset topics list
  this.form.reset({
    studentNo: null,
    studentId: '',
    studentName: '',
    mobileNo: '',
    testDate: this.todayDate,
    testNo: 1,
    courseId: '',      // Default empty placeholder
    courseNo: null,    // Default empty placeholder
    lvl: 1,
    testConductedBy: '',
    delFlag: 'A'       // Strict Active on New
  });
}

loadLookups(): void {
  this.service.getCourses().subscribe(c => {
    this.courses = c;
    // Auto-select removed: remains on "- Select Course -"
  });
  this.service.getEvaluators().subscribe(e => this.evaluators = e);
}

loadTopics(courseId: string): void {
  if (!courseId) {
    this.topics = [];
    this.form.patchValue({ courseNo: null });
    return;
  }
  this.service.getCourseDetails(courseId).subscribe(t => {
    this.topics = t;
    // Keeps on "- Select Tech -" instead of auto-selecting index 0
    this.form.patchValue({ courseNo: null });
  });
}

  searchStudent(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.service.searchStudents(this.searchQuery).subscribe(res => this.searchResults = res);
  }

  selectStudent(s: StudentSearchDTO): void {
    this.form.patchValue({
      studentNo: s.studentNo,
      studentId: s.studentId,
      studentName: s.studentName,
      mobileNo: s.mobileNo
    });
    this.searchResults = [];
    this.searchQuery = '';
    this.fetchTestNo(s.studentNo, this.form.get('testDate')?.value);
  }

  fetchTestNo(studentNo: number, testDate: string): void {
    this.service.getNextTestNo(studentNo, testDate).subscribe(no => {
      this.form.patchValue({ testNo: no });
    });
  }

submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.toast.error('Fill all mandatory fields!');
    return;
  }
  this.submitting = true;

  const raw = this.form.getRawValue();
  const totalSeconds = raw.timingUnit === 'MINS'
    ? Number(raw.timingValue) * 60
    : Number(raw.timingValue);

  // delFlag is strictly 'A' on create
  const payload = {
    ...raw,
    noOfQuestions: Number(raw.noOfQuestions),
    timePerTest: totalSeconds,
    delFlag: 'A'
  };

  delete (payload as any).timingValue;
  delete (payload as any).timingUnit;

  this.service.create(payload).subscribe({
    next: () => {
      this.submitting = false;
      this.toast.success('Test Setup created successfully!');
      this.saved.emit();
      this.close.emit();
    },
    error: (err) => {
      this.submitting = false;
      this.toast.error(err.error?.message || 'Failed to save setup');
    }
  });
}
}