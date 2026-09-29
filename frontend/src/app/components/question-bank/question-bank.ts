import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionBankService } from '../../services/question-bank';
import { CourseMaster, CourseDet } from '../../models/course';
import { TmsQuestionBank } from '../../models/question';
import { ViewQuestionComponent } from './modals/view-question/view-question';
import { ModifyQuestionComponent } from './modals/modify-question/modify-question';
import { NewQuestionComponent } from './modals/new-question/new-question';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewQuestionComponent, ModifyQuestionComponent, NewQuestionComponent],
  templateUrl: './question-bank.html',
  styleUrls: ['./question-bank.css']
})
export class QuestionBankComponent implements OnInit {
  courses: CourseMaster[] = [];
  courseDetails: CourseDet[] = [];
  questionNumbers: number[] = [];
  allLoadedQuestions: any[] = [];
  filteredQuestions: any[] = [];
  paginatedQuestions: any[] = [];

  selectedCourseId = '';
  selectedCourseNo = '';
  selectedQuestionNo = '';

  statusFilter: 'ALL' | 'ACTIVE' | 'DEACTIVE' = 'ACTIVE';
  isStatusDropdownOpen = false;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  selectedQuestion: any = null;
  isViewOpen = false;
  isModifyOpen = false;
  isNewOpen = false;

  constructor(private qbService: QuestionBankService) {}

  ngOnInit(): void {
    this.qbService.getCourses().subscribe(res => (this.courses = res || []));
    this.fetchQuestions();
  }

  fetchQuestions(cId?: string, cNo?: number, qNo?: number): void {
    this.qbService.getAllQuestions(cId, cNo, qNo).subscribe({
      next: (data: any) => {
        this.allLoadedQuestions = Array.isArray(data) ? data : (data?.content || []);
        this.applyStatusFilter();
      },
      error: () => {
        this.allLoadedQuestions = [];
        this.applyStatusFilter();
      }
    });
  }
  

  isActive = (q: any): boolean => (q?.delFlg ?? q?.del_flg ?? 'A').toString().trim().toUpperCase() !== 'D';

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  onStatusFilterChange(filter: 'ALL' | 'ACTIVE' | 'DEACTIVE'): void {
    this.statusFilter = filter;
    this.isStatusDropdownOpen = false;
    this.applyStatusFilter();
  }

  applyStatusFilter(): void {
    this.filteredQuestions = this.statusFilter === 'ALL' 
      ? [...this.allLoadedQuestions] 
      : this.allLoadedQuestions.filter(q => this.statusFilter === 'ACTIVE' ? this.isActive(q) : !this.isActive(q));
    this.currentPage = 1;
    this.updatePageData();
  }

  updatePageData(): void {
    this.totalPages = Math.ceil(this.filteredQuestions.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedQuestions = this.filteredQuestions.slice(start, start + this.pageSize);
  }

  onCourseChange(): void {
    this.selectedCourseNo = this.selectedQuestionNo = '';
    this.courseDetails = [];
    this.questionNumbers = [];
    if (this.selectedCourseId) {
      this.qbService.getCourseDetails(this.selectedCourseId).subscribe(res => (this.courseDetails = res || []));
      this.fetchQuestions(this.selectedCourseId);
    } else {
      this.fetchQuestions();
    }
  }

  onCourseNoChange(): void {
    this.selectedQuestionNo = '';
    this.questionNumbers = [];
    if (this.selectedCourseId && this.selectedCourseNo) {
      this.qbService.getQuestionNumbers(this.selectedCourseId, +this.selectedCourseNo).subscribe(res => (this.questionNumbers = res || []));
      this.fetchQuestions(this.selectedCourseId, +this.selectedCourseNo);
    }
  }

  onQuestionNoChange(): void {
    if (this.selectedCourseId && this.selectedCourseNo && this.selectedQuestionNo) {
      this.fetchQuestions(this.selectedCourseId, +this.selectedCourseNo, +this.selectedQuestionNo);
    }
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePageData();
    }
  }

  openView(q: any): void { this.selectedQuestion = q; this.isViewOpen = true; }
  openModify(q: any): void { this.selectedQuestion = { ...q }; this.isModifyOpen = true; }
  openNew(): void {
  console.log('New Question Button Clicked!');
  this.isNewOpen = true;
}

  handleSwitchToModify(q: any): void {
    this.isViewOpen = false;
    this.selectedQuestion = q ? { ...q } : this.selectedQuestion;
    this.isModifyOpen = true;
  }

  handleSaveNew(newQ: TmsQuestionBank): void {
    this.qbService.addQuestion(newQ).subscribe(() => {
      this.isNewOpen = false;
      this.fetchQuestions(this.selectedCourseId || undefined, this.selectedCourseNo ? +this.selectedCourseNo : undefined, this.selectedQuestionNo ? +this.selectedQuestionNo : undefined);
    });
  }

  handleSaveModified(updatedQuestion: any): void {
    this.qbService.updateQuestion(updatedQuestion).subscribe({
      next: (savedRes: any) => {
        const res = savedRes || updatedQuestion;
        const flg = (res.delFlg ?? res.del_flg ?? updatedQuestion.delFlg ?? updatedQuestion.del_flg ?? 'A').toString().trim().toUpperCase();
        const idx = this.allLoadedQuestions.findIndex(q => String(q.courseId) === String(updatedQuestion.courseId) && Number(q.courseNo) === Number(updatedQuestion.courseNo) && Number(q.questionNo) === Number(updatedQuestion.questionNo));
        if (idx !== -1) {
          this.allLoadedQuestions[idx] = { ...this.allLoadedQuestions[idx], ...res, delFlg: flg, del_flg: flg };
        }
        this.applyStatusFilter();
        this.isModifyOpen = false;
      }
    });
  }
}