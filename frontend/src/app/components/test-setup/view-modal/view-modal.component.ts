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

  // stat: 0 = Scheduled, 1 = Completed, 2 = Locked
  get testStatus(): 'Scheduled' | 'Completed' | 'Locked' {
    const stat = String(this.record?.stat);
    if (stat === '1') return 'Completed';
    if (stat === '2') return 'Locked';
    return 'Scheduled';
  }
}