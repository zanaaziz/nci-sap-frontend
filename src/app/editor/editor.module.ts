import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { CellDialogComponent } from './cell-dialog/cell-dialog.component';
import { LocaleDialogComponent } from './locale-dialog/locale-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [EditorComponent, CellDialogComponent, LocaleDialogComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		EditorRoutingModule,
		MatSlideToggleModule,
		MatFormFieldModule,
		MatToolbarModule,
		MatCheckboxModule,
		MatExpansionModule,
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatStepperModule,
		MatSelectModule,
		MatDialogModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSnackBarModule,
		MatProgressBarModule,
		MatProgressSpinnerModule,
		MatDividerModule,
		MatRadioModule,
		MatGridListModule,
		MatMenuModule,
		MatTreeModule,
		MatTooltipModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatAutocompleteModule,
		MatRippleModule,
		MatTabsModule,
		MatSliderModule,
		MatChipsModule,
	],
})
export class EditorModule {}
