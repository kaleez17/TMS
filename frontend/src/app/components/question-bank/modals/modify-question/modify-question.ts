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
    this._courseList = Array.isArray(val) ? val.map(i => typeof i === 'string' ? i : (i.courseId || i.id || i.cId || Object.values(i)[0] || '')).filter(Boolean) : [];
  }
  get courseList(): string[] { return this._courseList; }
  private _courseList: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<TmsQuestionBank>();

  editForm: any = {}; courseDetList: any[] = []; courseNumbers: number[] = [];
  levelList = [1, 2, 3]; errors: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.question) return;
    const q = this.question;
    this.editForm = {
      ...q,
      optA: q.optA ?? q.opt1 ?? q.option1 ?? '', optB: q.optB ?? q.opt2 ?? q.option2 ?? '',
      optC: q.optC ?? q.opt3 ?? q.option3 ?? '', optD: q.optD ?? q.opt4 ?? q.option4 ?? '',
      ans: q.ans ?? q.answer ?? 'A', levels: q.levels ?? 1, scores: q.scores ?? 1
    };
    if (this.editForm.courseId) this.fetchCourseDetails(this.editForm.courseId, false);
  }

  onCourseChange(newId: string): void { this.editForm.courseId = newId; this.fetchCourseDetails(newId, true); }
  clearError = (f: string) => delete this.errors[f];
  onClose = () => this.close.emit();

  onTopicChange(): void {
    delete this.errors['topic'];
    const m = this.courseDetList.find(d => (d.tech || d.topic) === this.editForm.topic);
    if (m) this.editForm.courseNo = m.courseDetId ?? m.courseNo ?? m.id;
  }

  onCourseNoChange(): void {
    const m = this.courseDetList.find(d => Number(d.courseDetId ?? d.courseNo ?? d.id) === Number(this.editForm.courseNo));
    if (m) this.editForm.topic = m.tech || m.topic || '';
  }

  fetchCourseDetails(cId: string, autoSelect = false): void {
    if (!cId) return;
    this.http.get<any[]>(`http://localhost:8080/api/courses/${cId}/details`).subscribe({
      next: (d = []) => {
        this.courseDetList = d;
        this.courseNumbers = d.map(i => i.courseDetId ?? i.courseNo ?? i.id).filter(n => n != null);
        if (autoSelect && d.length) {
          this.editForm.courseNo = d[0].courseDetId ?? d[0].courseNo ?? d[0].id;
          this.editForm.topic = d[0].tech || d[0].topic || '';
        } else this.onCourseNoChange();
      },
      error: () => { this.courseDetList = []; this.courseNumbers = []; }
    });
  }

  validate(): boolean {
    this.errors = {};
    const f = this.editForm;
    if (!f.topic?.toString().trim()) this.errors['topic'] = 'Topic is required';
    if (f.scores == null || Number(f.scores) <= 0) this.errors['scores'] = 'Score must be greater than 0';
    if (!f.question?.toString().trim()) this.errors['question'] = 'Question description cannot be empty';
    ['optA', 'optB', 'optC', 'optD'].forEach((k, i) => {
      if (!f[k]?.toString().trim()) this.errors[k] = `Option ${String.fromCharCode(65 + i)} is required`;
    });
    return Object.keys(this.errors).length === 0;
  }

  onUpdate(): void {
    if (!this.validate()) return;
    const f = this.editForm;
    this.save.emit({
      ...f, question: f.question.trim(),
      optA: f.optA.trim(), optB: f.optB.trim(), optC: f.optC.trim(), optD: f.optD.trim(),
      ans: f.ans, levels: Number(f.levels), scores: Number(f.scores),
      delFlg: (f.delFlg ? f.delFlg.toString().trim().toUpperCase() : 'A')
    });
  }
}