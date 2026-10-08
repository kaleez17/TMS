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

  courses: CourseMaster[] = []; courseDetails: CourseDet[] = [];
  levels = [1, 2, 3]; errors: { [key: string]: string } = {};

  newForm: any = {
    courseId: '', courseNo: null, questionNo: 1, topic: '', levels: 1, scores: 1,
    question: '', optA: '', optB: '', optC: '', optD: '', ans: 'A', delFlg: 'A', enteredBy: ''
  };

  constructor(private qbService: QuestionBankService, private authService: AuthService) {}

  ngOnInit(): void {
    const u = this.authService.currentUser();
    this.newForm.enteredBy = u?.userName || u?.userId || 'admin';
    this.qbService.getCourses().subscribe(res => {
      this.courses = res || [];
      if (this.courses.length) { this.newForm.courseId = this.courses[0].id; this.onCourseChange(); }
    });
  }

  onCourseChange(): void {
    if (!this.newForm.courseId) {
      this.courseDetails = []; this.newForm.courseNo = null; this.newForm.topic = ''; this.newForm.questionNo = 1;
      return;
    }
    this.qbService.getCourseDetails(this.newForm.courseId).subscribe(det => {
      this.courseDetails = det || [];
      this.newForm.topic = this.courseDetails[0]?.tech || '';
      this.newForm.courseNo = this.courseDetails[0]?.courseDetId ?? 1;
      this.fetchNextQuestionNo();
    });
  }

  onTopicChange(): void {
    delete this.errors['topic'];
    const m = this.courseDetails.find(cd => cd.tech === this.newForm.topic);
    if (m) this.newForm.courseNo = m.courseDetId;
    this.fetchNextQuestionNo();
  }

  fetchNextQuestionNo(): void {
    const { courseId, courseNo } = this.newForm;
    if (!courseId || !courseNo) { this.newForm.questionNo = 1; return; }
    this.qbService.getQuestionNumbers(courseId, +courseNo).subscribe({
      next: (qNos: number[]) => this.newForm.questionNo = qNos?.length ? Math.max(...qNos) + 1 : 1,
      error: () => this.newForm.questionNo = 1
    });
  }

  clearError = (f: string) => delete this.errors[f];
  onClose = () => this.close.emit();

  validate(): boolean {
    this.errors = {};
    const f = this.newForm;
    if (!f.courseId) this.errors['courseId'] = 'Course is required';
    if (!f.topic) this.errors['topic'] = 'Topic is required';
    if (f.scores == null || Number(f.scores) <= 0) this.errors['scores'] = 'Score must be greater than 0';
    if (!f.question?.trim()) this.errors['question'] = 'Question description is required';
    ['optA', 'optB', 'optC', 'optD'].forEach((k, i) => {
      if (!f[k]?.trim()) this.errors[k] = `Option ${String.fromCharCode(65 + i)} is required`;
    });
    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;
    const f = this.newForm;
    this.save.emit({
      ...f, question: f.question.trim(),
      optA: f.optA.trim(), optB: f.optB.trim(), optC: f.optC.trim(), optD: f.optD.trim(),
      levels: Number(f.levels), scores: Number(f.scores), delFlg: 'A'
    });
  }
}