import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private baseUrl = 'http://localhost:8000';
  constructor() { }

  getImageUrl(relativePath: string): string {
    return `${this.baseUrl}${relativePath.startsWith('/media/') ? relativePath : '/media/' + relativePath}`;
  }

}
