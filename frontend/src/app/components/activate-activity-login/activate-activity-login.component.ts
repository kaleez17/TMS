import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ActivateActivityLoginService,
  ActivityLog
} from '../../services/activate-activity-login.service';

import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-activate-activity-login',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './activate-activity-login.component.html',
  styleUrl: './activate-activity-login.component.css'
})
export class ActivateActivityLoginComponent implements OnInit {

  activityLogs: ActivityLog[] = [];
  loading = false;
  errorMessage = '';

  selectedActivityInfo = '';
  selectedActivityLog: ActivityLog | null = null;
  showActivityInfo = false;

  selectedActivityGroups: { label: string; value: string }[][] = [];

  
  currentPage = 1;
  pageSize = 5;

  constructor(
    private activityService: ActivateActivityLoginService
  ) {}

  ngOnInit(): void {
    this.loadActivityLogs();
  }

  loadActivityLogs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.activityService.getActivityLogs().subscribe({
      next: (data) => {
        this.activityLogs = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Unable to load activity logs.';
        this.loading = false;
        console.error('Activity log API error:', error);
      }
    });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.activityLogs.length / this.pageSize)
    );
  }

  get paginatedActivityLogs(): ActivityLog[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.activityLogs.slice(
      start,
      start + this.pageSize
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewActivity(log: ActivityLog): void {
    this.selectedActivityLog = log;

    const info = log.activityInfo;

    if (
      info == null ||
      info.trim() === '' ||
      info.trim() === 'null'
    ) {
      this.selectedActivityInfo = 'null';
      this.selectedActivityGroups = [];
    } else {
      this.selectedActivityInfo = info.trim().replace(/;/g, '\n');

      const records = info
        .split(';')
        .map(item => item.trim())
        .filter(item => item !== '');

      this.selectedActivityGroups = records.map(record => {
        const parts = record
          .split(/\s+-\s+/)
          .map(item => item.trim());

        if (parts.length >= 4 && parts[0] === 'Menu') {
          return [
            { label: 'Category', value: parts[0] || 'null' },
            { label: 'Menu Name', value: parts[1] || 'null' },
            { label: 'Action', value: parts[2] || 'null' },
            {
              label: 'Table Name',
              value: parts.slice(3).join(' - ') || 'null'
            }
          ];
        }

        return [
          {
            label: 'Activity Details',
            value: record || 'null'
          }
        ];
      });
    }

    this.showActivityInfo = true;
  }

  closeActivityInfo(): void {
    this.showActivityInfo = false;
    this.selectedActivityLog = null;
    this.selectedActivityInfo = '';
    this.selectedActivityGroups = [];
  }
}
