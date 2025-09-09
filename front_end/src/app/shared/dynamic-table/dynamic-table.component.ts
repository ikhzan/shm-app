import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

export type ColumnType = 'link' | 'date' | 'text';

export interface TableColumn {
  label: string;
  path: string;
  type?: ColumnType;
  class?: (value: any) => string;
  pipe?: string;
  pipeArg?: string;
  linkTo?: (row: any) => any[];
  suffix?: (value: any) => string;
  authRequired?: boolean;
  customRender?: 'actions'; // extendable for other custom types
}

@Component({
  selector: 'app-dynamic-table',
  imports: [NgFor, NgIf, NgClass, FormsModule, FontAwesomeModule, RouterLink, DatePipe],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent implements OnChanges, OnInit {
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;
  Math = Math
  searchTerm = '';
  rowsPerPage = 5;
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() isAuthenticated: boolean = false;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  filteredData: any[] = [];
  paginatedData: any[] = [];

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  filteredCount: number = 0;

  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnChanges(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredData = this.data.filter(row => {
      return this.columns.some(col => {
        const value = this.getValue(row, col.path);
        if (value == null) return false;

        const normalized = String(value).toLowerCase();
        return normalized.includes(term);
      });
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.filteredCount = this.filteredData.length;
    this.totalPages = Math.ceil(this.filteredCount / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    const totalPages = Math.ceil(this.filteredData.length / this.rowsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.updatePagination();
    }
  }

  getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => {
      if (!acc) return undefined;
      // Handle array index like 'rx_metadata.0.rssi'
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrKey, index] = arrayMatch;
        return acc[arrKey]?.[+index];
      }
      return acc[key];
    }, obj);
  }

  onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize = +value;
    this.currentPage = 1;
    this.applyFilter();
  }

  sortBy(path: string): void {
    if (this.sortColumn === path) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = path;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.updatePagination();
  }

  applySorting(): void {
    const path = this.sortColumn;
    const direction = this.sortDirection;

    this.filteredData.sort((a, b) => {
      const valA = this.getValue(a, path);
      const valB = this.getValue(b, path);

      if (valA == null && valB == null) return 0;
      if (valA == null) return direction === 'asc' ? -1 : 1;
      if (valB == null) return direction === 'asc' ? 1 : -1;

      return direction === 'asc'
        ? valA > valB ? 1 : valA < valB ? -1 : 0
        : valA < valB ? 1 : valA > valB ? -1 : 0;
    });
  }

  editRow(row: any): void {
    console.log(`Edit-row ${row.id}`);
    this.edit.emit(row.id);
  }

  confirmDelete(row: any): void {
    console.log(`Confirm-delete ${row.id}`);
    this.delete.emit(row.id);
  }

}
