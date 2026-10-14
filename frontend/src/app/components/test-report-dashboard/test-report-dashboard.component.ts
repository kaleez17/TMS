import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { TestReportService } from '../../services/test-report.service';
import { TestReportCategory, TestReportSummary } from '../../models/test-report.model';
import { ToastService } from '../../services/toast.service';
import { Paginator } from '../../services/paginator';
import { PaginationComponent } from '../pagination/pagination.component';
import { TestViewModalComponent } from '../test-execution/modals/test-view-modal/test-view-modal.component';
import { TestSetupItem } from '../../models/test-execution.model';
import { TestSetupDTO } from '../../models/test-setup.model';

interface TestTile {
  title: string;
  value: number;
  color: string;
  colorSoft: string;
  category: TestReportCategory;
}

@Component({
  selector: 'app-test-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, TestViewModalComponent],
  templateUrl: './test-report-dashboard.component.html',
  styleUrl: './test-report-dashboard.component.css'
})
export class TestReportDashboardComponent implements OnInit, OnDestroy {

  // ---- cards ----
  loading = false;
  summary: TestReportSummary | null = null;
  tiles: TestTile[] = [];

  // ---- details table (shown after a card is clicked) ----
  selected: TestTile | null = null;
  searchName = '';
  searchNumber: number | null = null;
  records: TestSetupDTO[] = [];
  loadingDetails = false;

  // ---- View popup (same "Assessment Configuration Details" popup the student sees) ----
  viewItem: TestSetupItem | null = null;
  unlocking = false;

  readonly paginator = new Paginator<TestSetupDTO>(() => this.records);

  private readonly search$ = new Subject<void>();
  private searchSub?: Subscription;
  private refreshSub?: Subscription;

  constructor(private reportSvc: TestReportService, private toast: ToastService) {}

  ngOnInit(): void {
    this.searchSub = this.search$.pipe(debounceTime(250)).subscribe(() => this.search());
    this.load();

    // Server releases 24h locks every minute - refresh so the dashboard shows the change
    this.refreshSub = interval(60_000).subscribe(() => {
      if (this.selected) this.search(); else this.load();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  // ---------- cards ----------
  load(): void {
    this.loading = true;
    this.reportSvc.getSummary().subscribe({
      next: s => {
        this.summary = s;
        this.tiles = [
          { title: 'Total Tests Allocated', value: s.allocated, category: 'ALLOCATED', color: '#1B2A47', colorSoft: '#EBF0FA' },
          { title: 'Completed',             value: s.completed, category: 'COMPLETED', color: '#2E7D5B', colorSoft: '#E4F2EC' },
          { title: 'Scheduled',             value: s.scheduled, category: 'SCHEDULED', color: '#EAB308', colorSoft: '#FEF9C3' },
          { title: 'Locked',                value: s.locked,    category: 'LOCKED',    color: '#E53E3E', colorSoft: '#FEE2E2' }
        ];
        this.loading = false;
      },
      error: (err: Error) => { this.loading = false; this.toast.error(err.message); }
    });
  }

  onTileClick(tile: TestTile): void {
    this.selected = tile;
    this.searchName = '';
    this.searchNumber = null;
    this.search();
  }

  // ---------- details ----------
  onFilterChange(): void {
    this.search$.next();
  }

  search(): void {
    if (!this.selected) return;
    this.loadingDetails = true;
    this.paginator.reset();
    this.reportSvc.getDetails(this.selected.category, this.searchName, this.searchNumber).subscribe({
      next: rows => { this.records = rows; this.loadingDetails = false; },
      error: (err: Error) => { this.records = []; this.loadingDetails = false; this.toast.error(err.message); }
    });
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchNumber = null;
    this.search();
  }

  /** stat: 0 = Scheduled, 1 = Completed, 2 = Locked (same as the backend). */
  statusOf(r: TestSetupDTO): 'Locked' | 'Completed' | 'Scheduled' {
    const stat = String(r.stat);
    if (stat === '2') return 'Locked';
    return stat === '1' ? 'Completed' : 'Scheduled';
  }

  openView(r: TestSetupDTO): void {
    this.viewItem = r as unknown as TestSetupItem;
  }

  closeView(): void {
    this.viewItem = null;
  }

  /** Unlock button: Locked (2) -> Scheduled (0) in the database, then refresh cards + table. */
  onUnlock(): void {
    const t = this.viewItem;
    if (!t) return;

    this.unlocking = true;
    this.reportSvc.unlock(t.studentNo, t.studentId, t.testNo, t.testDate).subscribe({
      next: () => {
        this.unlocking = false;
        this.viewItem = null;
        this.toast.success('Test unlocked - status changed to Scheduled.');
        this.load();
        if (this.selected) this.search();
      },
      error: (err: Error) => {
        this.unlocking = false;
        this.toast.error(err.message);
      }
    });
  }

  /** Back to the four cards (and refresh the counts). */
  onBack(): void {
    this.selected = null;
    this.records = [];
    this.load();
  }

  get currentPage(): number { return this.paginator.currentPage; }
  get totalPages(): number { return this.paginator.totalPages; }
  get pagedRecords(): TestSetupDTO[] { return this.paginator.paged; }
  get rangeStart(): number { return this.paginator.rangeStart; }
  get rangeEnd(): number { return this.paginator.rangeEnd; }

  goToPage(p: number): void { this.paginator.goToPage(p); }
}
