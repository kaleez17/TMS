import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestSetupDTO } from '../../../models/test-setup.model';

@Component({
  selector: 'app-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-modal.component.html',
  styleUrls: ['./view-modal.component.css']
})
export class ViewModalComponent {
  @Input() isOpen = false;
  @Input() record: TestSetupDTO | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() modify = new EventEmitter<TestSetupDTO>();

  onClose(): void {
    this.close.emit();
  }

  onModify(): void {
    if (this.record) {
      this.modify.emit(this.record);
    }
  }

  // stat value "1" or 1 aana true, "0" or 0 aana false
  get isTestCompleted(): boolean {
    if (!this.record) return false;
    return String(this.record.stat) === '1' || String(this.record.stat).toLowerCase() === 'true';
  }
}