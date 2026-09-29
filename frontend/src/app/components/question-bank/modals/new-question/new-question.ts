import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionBankService } from '../../../../services/question-bank';
import { AuthService } from '../../../../services/auth.service';
import { CourseMaster, CourseDet } from '../../../../models/course';
import { TmsQuestionBank } from '../../../../models/question';

@Component({
  selector: 'app-new-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-question.html',
  styleUrls: ['./new-question.css']
})
export class NewQuestionComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<TmsQuestionBank>();

  courses: CourseMaster[] = [];
  courseDetails: CourseDet[] = [];
  levels: number[] = [1, 2, 3];
  errors: { [key: string]: string } = {};

  newForm: any = {
    courseId: '',
    courseNo: null,
    questionNo: 1,
    topic: '',
    levels: 1,
    scores: 1,
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    ans: 'A',
    delFlg: 'A',
    enteredBy: ''
  };

  constructor(
    private qbService: QuestionBankService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const loggedUser = this.authService.currentUser();
    this.newForm.enteredBy = loggedUser?.userName || loggedUser?.userId || 'admin';

    this.qbService.getCourses().subscribe({
      next: (res) => {
        this.courses = res || [];
        if (this.courses.length > 0) {
          this.newForm.courseId = this.courses[0].id;
          this.onCourseChange();
        }
      },
      error: (err) => console.error('Course fetch error:', err)
    });
  }

  onCourseChange(): void {
    if (!this.newForm.courseId) {
      this.courseDetails = [];
      this.newForm.courseNo = null;
      this.newForm.topic = '';
      this.newForm.questionNo = 1;
      return;
    }

    this.qbService.getCourseDetails(this.newForm.courseId).subscribe({
      next: (details) => {
        this.courseDetails = details || [];
        if (this.courseDetails.length > 0) {
          this.newForm.topic = this.courseDetails[0].tech || '';
          this.newForm.courseNo = this.courseDetails[0].courseDetId;
          this.fetchNextQuestionNo();
        } else {
          this.newForm.topic = '';
          this.newForm.courseNo = 1;
          this.newForm.questionNo = 1;
        }
      },
      error: (err) => console.error('Course details error:', err)
    });
  }

  onTopicChange(): void {
    delete this.errors['topic'];
    const matched = this.courseDetails.find(cd => cd.tech === this.newForm.topic);
    if (matched) {
      this.newForm.courseNo = matched.courseDetId;
    }
    this.fetchNextQuestionNo();
  }

  fetchNextQuestionNo(): void {
    if (!this.newForm.courseId || !this.newForm.courseNo) {
      this.newForm.questionNo = 1;
      return;
    }

    this.qbService.getQuestionNumbers(this.newForm.courseId, Number(this.newForm.courseNo)).subscribe({
      next: (qNumbers: number[]) => {
        if (qNumbers && qNumbers.length > 0) {
          const maxQNo = Math.max(...qNumbers);
          this.newForm.questionNo = maxQNo + 1;
        } else {
          this.newForm.questionNo = 1;
        }
      },
      error: () => {
        this.newForm.questionNo = 1;
      }
    });
  }

  clearError(field: string): void {
    delete this.errors[field];
  }

  validate(): boolean {
    this.errors = {};

    if (!this.newForm.courseId) this.errors['courseId'] = 'Course is required';
    if (!this.newForm.topic) this.errors['topic'] = 'Topic is required';
    if (this.newForm.scores === null || this.newForm.scores === undefined || Number(this.newForm.scores) <= 0) {
      this.errors['scores'] = 'Score must be greater than 0';
    }
    if (!this.newForm.question || !this.newForm.question.trim()) {
      this.errors['question'] = 'Question description is required';
    }
    if (!this.newForm.optA || !this.newForm.optA.trim()) this.errors['optA'] = 'Option A is required';
    if (!this.newForm.optB || !this.newForm.optB.trim()) this.errors['optB'] = 'Option B is required';
    if (!this.newForm.optC || !this.newForm.optC.trim()) this.errors['optC'] = 'Option C is required';
    if (!this.newForm.optD || !this.newForm.optD.trim()) this.errors['optD'] = 'Option D is required';

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    const payload = {
      ...this.newForm,
      question: this.newForm.question.trim(),
      optA: this.newForm.optA.trim(),
      optB: this.newForm.optB.trim(),
      optC: this.newForm.optC.trim(),
      optD: this.newForm.optD.trim(),
      ans: this.newForm.ans,
      levels: Number(this.newForm.levels),
      scores: Number(this.newForm.scores),
      delFlg: 'A'
    };

    this.save.emit(payload);
  }

  onClose(): void {
    this.close.emit();
  }
}