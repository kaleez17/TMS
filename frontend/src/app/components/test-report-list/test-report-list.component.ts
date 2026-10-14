import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { TestReportService } from '../../services/test-report.service';
import { ToastService } from '../../services/toast.service';
import { Paginator } from '../../services/paginator';
import { PaginationComponent } from '../pagination/pagination.component';
import { ViewModalComponent } from '../test-setup/view-modal/view-modal.component';
import { TestSetupDTO } from '../../models/test-setup.model';
import { TEST_REPORT_TITLES, TestReportCategory } from '../../models/test-report.model';

@Component({
  selector: 'app-test-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ViewModalComponent],
  templateUrl: './test-report-list.component.html',
  styleUrl: './test-report-list.component.css'
})
export class TestReportListComponent implements OnInit, OnDestroy {

  category: TestReportCategory = 'ALLOCATED';
  returnTo = '/test-report';

  searchName = '';
  searchNumber: number | null = null;

  records: TestSetupDTO[] = [];
  loading = false;

  // View modal (reused from Test Setup)
  isViewOpen = false;
  selectedRecord: TestSetupDTO | null = null;

  readonly paginator = new Paginator<TestSetupDTO>(() => this.records);

  private readonly search$ = new Subject<void>();
  private searchSub?: Subscription;

  constructor(
    private reportSvc: TestReportService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const cat = this.route.snapshot.queryParamMap.get('category')?.toUpperCase() as TestReportCategory;
    if (cat && cat in TEST_REPORT_TITLES) this.category = cat;

    const back = this.route.snapshot.queryParamMap.get('returnTo');
    if (back) this.returnTo = back;

    this.searchSub = this.search$.pipe(debounceTime(250)).subscribe(() => this.search());
    this.search();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  get title(): string {
    return TEST_REPORT_TITLES[this.category];
  }

  onFilterChange(): void {
    this.search$.next();
  }

  search(): void {
    this.loading = true;
    this.paginator.reset();
    this.reportSvc.getDetails(this.category, this.searchName, this.searchNumber).subscribe({
      next: rows => { this.records = rows; this.loading = false; },
      error: (err: Error) => { this.records = []; this.loading = false; this.toast.error(err.message); }
    });
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchNumber = null;
    this.search();
  }

  /** Same rule as the backend: Blocked > Completed > Scheduled. */
  statusOf(r: TestSetupDTO): 'Blocked' | 'Completed' | 'Scheduled' {
    if (r.delFlag === 'D') return 'Blocked';
    return String(r.stat) === '1' ? 'Completed' : 'Scheduled';
  }

  openView(r: TestSetupDTO): void {
    this.selectedRecord = r;
    this.isViewOpen = true;
  }

  onBack(): void {
    this.router.navigateByUrl(this.returnTo);
  }

  get currentPage(): number { return this.paginator.currentPage; }
  get totalPages(): number { return this.paginator.totalPages; }
  get pagedRecords(): TestSetupDTO[] { return this.paginator.paged; }
  get rangeStart(): number { return this.paginator.rangeStart; }
  get rangeEnd(): number { return this.paginator.rangeEnd; }

  goToPage(p: number): void { this.paginator.goToPage(p); }
}
