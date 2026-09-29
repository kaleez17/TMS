import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmsQuestionBank } from '../../../../models/question';

@Component({
  selector: 'app-view-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-question.html',
  styleUrls: ['./view-question.css']
})
export class ViewQuestionComponent {
  @Input() question: TmsQuestionBank | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() switchToModify = new EventEmitter<TmsQuestionBank>();


  onClose() {
    this.close.emit();
  }
  onModify(): void {
    if (this.question) {
      this.switchToModify.emit(this.question);
    }
  }
}