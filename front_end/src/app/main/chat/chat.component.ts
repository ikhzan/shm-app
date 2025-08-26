import { Component, NgZone } from '@angular/core';
import { LlmService } from '../../services/llm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, NgFor, CommonModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages: { role: string; content: string }[] = [];
  userInput = '';
  loading = false;

  constructor(private llmService: LlmService) { }

  sendMessage() {
    const prompt = this.userInput.trim();
    if (!prompt) return;

    this.messages.push({ role: 'user', content: prompt });
    this.userInput = '';
    this.loading = true;

    let aiMessage = { role: 'ai', content: '' };
    this.messages.push(aiMessage);

    this.llmService.streamResponse(prompt).subscribe({
      next: (chunk) => aiMessage.content += chunk,
      complete: () => this.loading = false,
      error: (err) => {
        aiMessage.content = '⚠️ Error: ' + err.message;
        this.loading = false;
      }
    });
  }

}
