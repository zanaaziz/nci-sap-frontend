import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { CellDialogComponent } from './cell-dialog/cell-dialog.component';
import { LocaleDialogComponent } from './locale-dialog/locale-dialog.component';

// Angular Material modules used across the editor components
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
	declarations: [EditorComponent, CellDialogComponent, LocaleDialogComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		EditorRoutingModule,
		// Material modules required for form fields, inputs, and buttons
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		// Icons and UI elements
		MatIconModule,
		MatCheckboxModule,
		// Table-related modules
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		// Dialog and progress indicators
		MatDialogModule,
		MatProgressBarModule,
		MatMenuModule,
		// Chips and autocomplete for locale selection
		MatChipsModule,
		MatAutocompleteModule,
	],
})
export class EditorModule {}
