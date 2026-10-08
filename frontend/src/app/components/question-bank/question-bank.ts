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
  courses: CourseMaster[] = []; courseDetails: CourseDet[] = []; questionNumbers: number[] = [];
  paginatedQuestions: any[] = []; filteredQuestions: any[] = [];
  selectedCourseId = ''; selectedCourseNo = ''; selectedQuestionNo = '';
  searchQuery = ''; isDropdownOpen = false;
  statusFilter: 'ALL' | 'ACTIVE' | 'DEACTIVE' = 'ACTIVE';
  isStatusDropdownOpen = false;
  currentPage = 1; pageSize = 5; totalPages = 1; totalRecords = 0;
  selectedQuestion: any = null;
  isViewOpen = false; isModifyOpen = false; isNewOpen = false;

  constructor(private qbService: QuestionBankService) {}

  ngOnInit(): void {
    this.qbService.getCourses().subscribe(res => (this.courses = res || []));
    this.fetchQuestions();
  }

fetchQuestions(): void {
  const pageIndex = Math.max(0, Number(this.currentPage) - 1);
  this.qbService.getAllQuestions(
    this.selectedCourseId || undefined,
    this.selectedCourseNo ? +this.selectedCourseNo : undefined,
    this.selectedQuestionNo ? +this.selectedQuestionNo : undefined,
    pageIndex,
    this.pageSize,
    this.statusFilter
  ).subscribe({
    next: (res: any) => {
      this.paginatedQuestions = res?.content || [];
      this.totalRecords = Number(res?.totalElements || 0); // 300
      this.totalPages = Number(res?.totalPages || 1);       // 60
    },
    error: () => {
      this.paginatedQuestions = [];
      this.totalRecords = 0;
      this.totalPages = 1;
    }
  });
}
  isActive = (q: any): boolean => (q?.delFlg ?? q?.del_flg ?? 'A').toString().trim().toUpperCase() !== 'D';
  toggleStatusDropdown = () => this.isStatusDropdownOpen = !this.isStatusDropdownOpen;


onStatusFilterChange(filter: 'ALL' | 'ACTIVE' | 'DEACTIVE'): void {
  this.statusFilter = filter;
  this.isStatusDropdownOpen = false;
  this.currentPage = 1; 
  this.fetchQuestions();
}

  applyStatusFilter(): void {
    const list = this.statusFilter === 'ALL' ? [...this.filteredQuestions]
      : this.filteredQuestions.filter(q => this.statusFilter === 'ACTIVE' ? this.isActive(q) : !this.isActive(q));
    this.paginatedQuestions = list.slice(0, this.pageSize);
  }

  get filteredDropdownList(): { qNo: number; text: string }[] {
    const qMap = new Map<number, string>(this.paginatedQuestions.map(q => [Number(q.questionNo), q.question || '']));
    const list = this.questionNumbers.map(n => ({ qNo: n, text: qMap.get(n) || '' }));
    const s = this.searchQuery.trim().toLowerCase();
    return s ? list.filter(i => i.qNo.toString().includes(s) || i.text.toLowerCase().includes(s)) : list;
  }

  onSearchInput = () => this.isDropdownOpen = true;

  selectOption(qNo: any, label: string): void {
    this.selectedQuestionNo = qNo ? qNo.toString() : ''; this.searchQuery = qNo ? label : '';
    this.isDropdownOpen = false; this.currentPage = 1; this.onQuestionNoChange();
  }

  clearSearch(): void {
    this.selectedQuestionNo = ''; this.searchQuery = ''; this.isDropdownOpen = false;
    this.currentPage = 1; this.fetchQuestions();
  }

  setPage(page: any): void {
    const p = Number(page);
    if (p >= 1 && p <= this.totalPages && p !== this.currentPage) {
      this.currentPage = p;
      this.fetchQuestions();
    }
  }

  onCourseChange(): void {
    this.selectedCourseNo = this.selectedQuestionNo = this.searchQuery = ''; this.courseDetails = []; this.questionNumbers = [];
    this.currentPage = 1;
    if (this.selectedCourseId) this.qbService.getCourseDetails(this.selectedCourseId).subscribe(res => this.courseDetails = res || []);
    this.fetchQuestions();
  }

  onCourseNoChange(): void {
    this.selectedQuestionNo = this.searchQuery = ''; this.questionNumbers = []; this.currentPage = 1;
    if (this.selectedCourseId && this.selectedCourseNo) this.qbService.getQuestionNumbers(this.selectedCourseId, +this.selectedCourseNo).subscribe(res => this.questionNumbers = res || []);
    this.fetchQuestions();
  }

  onQuestionNoChange = () => { this.currentPage = 1; this.fetchQuestions(); };
  openView = (q: any) => { this.selectedQuestion = q; this.isViewOpen = true; };
  openModify = (q: any) => { this.selectedQuestion = { ...q }; this.isModifyOpen = true; };
  openNew = () => this.isNewOpen = true;
  handleSwitchToModify = (q: any) => { this.isViewOpen = false; this.selectedQuestion = q ? { ...q } : this.selectedQuestion; this.isModifyOpen = true; };
  handleSaveNew = (newQ: TmsQuestionBank) => this.qbService.addQuestion(newQ).subscribe(() => { this.isNewOpen = false; this.fetchQuestions(); });
  handleSaveModified = (updated: any) => this.qbService.updateQuestion(updated).subscribe(() => { this.isModifyOpen = false; this.fetchQuestions(); });
}