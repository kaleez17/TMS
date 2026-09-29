import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TmsQuestionBank } from '../../../../models/question';

@Component({
  selector: 'app-modify-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modify-question.html',
  styleUrls: ['./modify-question.css']
})
export class ModifyQuestionComponent implements OnInit {
  @Input() question: any = null;

  @Input() set courseList(val: any[]) {
    this._courseList = Array.isArray(val)
      ? val.map(item => (typeof item === 'string' ? item : item.courseId || item.id || item.cId || Object.values(item)[0] || '')).filter(Boolean)
      : [];
  }
  get courseList(): string[] {
    return this._courseList;
  }
  private _courseList: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<TmsQuestionBank>();

  editForm: any = {};
  courseDetList: any[] = [];
  courseNumbers: number[] = [];
  levelList: number[] = [1, 2, 3];
  errors: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.question) return;

    this.editForm = {
      ...this.question,
      optA: this.question.optA ?? this.question.opt1 ?? this.question.option1 ?? '',
      optB: this.question.optB ?? this.question.opt2 ?? this.question.option2 ?? '',
      optC: this.question.optC ?? this.question.opt3 ?? this.question.option3 ?? '',
      optD: this.question.optD ?? this.question.opt4 ?? this.question.option4 ?? '',
      ans: this.question.ans ?? this.question.answer ?? 'A',
      levels: this.question.levels ?? 1,
      scores: this.question.scores ?? 1
    };

    if (this.editForm.courseId) {
      this.fetchCourseDetails(this.editForm.courseId, false);
    }
  }

  onCourseChange(newCourseId: string): void {
    this.editForm.courseId = newCourseId;
    this.fetchCourseDetails(newCourseId, true);
  }

  onTopicChange(): void {
    delete this.errors['topic'];
    const matched = this.courseDetList.find(d => (d.tech || d.topic) === this.editForm.topic);
    if (matched) {
      this.editForm.courseNo = matched.courseDetId ?? matched.courseNo ?? matched.id;
    }
  }

  onCourseNoChange(): void {
    const matched = this.courseDetList.find(d => Number(d.courseDetId ?? d.courseNo ?? d.id) === Number(this.editForm.courseNo));
    if (matched) {
      this.editForm.topic = matched.tech || matched.topic || '';
    }
  }

  fetchCourseDetails(courseId: string, autoSelectFirst = false): void {
    if (!courseId) return;

    this.http.get<any[]>(`http://localhost:8080/api/courses/${courseId}/details`).subscribe({
      next: (details = []) => {
        this.courseDetList = details;
        this.courseNumbers = details.map(d => d.courseDetId ?? d.courseNo ?? d.id).filter(n => n != null);

        if (autoSelectFirst && details.length > 0) {
          this.editForm.courseNo = details[0].courseDetId ?? details[0].courseNo ?? details[0].id;
          this.editForm.topic = details[0].tech || details[0].topic || '';
        } else {
          this.onCourseNoChange();
        }
      },
      error: () => {
        this.courseDetList = [];
        this.courseNumbers = [];
      }
    });
  }

  clearError(field: string): void {
    delete this.errors[field];
  }

  validate(): boolean {
    this.errors = {};
    const f = this.editForm;

    if (!f.topic?.toString().trim()) this.errors['topic'] = 'Topic is required';
    if (f.scores == null || Number(f.scores) <= 0) this.errors['scores'] = 'Score must be greater than 0';
    if (!f.question?.toString().trim()) this.errors['question'] = 'Question description cannot be empty';

    if (!f.optA?.toString().trim()) this.errors['optA'] = 'Option A is required';
    if (!f.optB?.toString().trim()) this.errors['optB'] = 'Option B is required';
    if (!f.optC?.toString().trim()) this.errors['optC'] = 'Option C is required';
    if (!f.optD?.toString().trim()) this.errors['optD'] = 'Option D is required';

    return Object.keys(this.errors).length === 0;
  }

  onUpdate(): void {
    if (!this.validate()) return;

    const payload = {
      ...this.editForm,
      question: this.editForm.question.trim(),
      optA: this.editForm.optA.trim(),
      optB: this.editForm.optB.trim(),
      optC: this.editForm.optC.trim(),
      optD: this.editForm.optD.trim(),
      ans: this.editForm.ans,
      levels: Number(this.editForm.levels),
      scores: Number(this.editForm.scores),
      delFlg: this.editForm.delFlg ? this.editForm.delFlg.toString().trim().toUpperCase() : 'A'
    };

    this.save.emit(payload);
  }

  onClose(): void {
    this.close.emit();
  }
}