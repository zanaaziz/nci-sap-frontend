import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LOCALES } from '../locale-dialog/locales';
import { LocaleService } from '../../shared/locale.service';

@Component({
	selector: 'app-cell-dialog',
	standalone: false,
	templateUrl: './cell-dialog.component.html',
	styleUrls: ['./cell-dialog.component.scss'],
})
export class CellDialogComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<CellDialogComponent>,
		public locale: LocaleService,
		@Inject(MAT_DIALOG_DATA) public cell: { newId?: string; row?: Object; column?: string; defaultValue?: string }
	) {
		if (this.cell.newId) {
			// Adding a new translation
			this.updatedCell = new FormControl(this.cell.defaultValue || '', [Validators.required]);
		} else if (this.cell.row && this.cell.column) {
			// Editing an existing cell
			const currentValue = this.cell.row[this.cell.column];
			this.updatedCell = new FormControl(currentValue === '...' ? '' : currentValue, [Validators.required]);
			this.base_cell = new FormControl({
				value: this.cell.row['en'],
				disabled: true,
			});
		} else {
			console.error('Invalid data passed to CellDialogComponent');
			this.updatedCell = new FormControl('', [Validators.required]); // Fallback
		}
	}

	updatedCell: FormControl; // Form control for the editable cell value
	base_cell: FormControl; // Form control for displaying the English base value
	locales: { name: string; abbr: string }[] = LOCALES; // List of available locales

	/** Saves the edited or new cell value */
	onSave() {
		this.locales.forEach((locale) => {
			if (locale.name === this.cell['column']) {
				this.cell['column'] = locale.abbr;
			}
		});
		if (this.updatedCell.invalid) return;
		if (this.cell['newId']) {
			this.dialogRef.close(this.updatedCell.value);
		} else {
			this.cell['row'][this.cell['column']] = this.updatedCell.value;
			this.dialogRef.close({ ...this.cell });
		}
	}

	/** Closes the dialog without saving */
	onCancel() {
		this.dialogRef.close(undefined);
	}

	/** Initializes the dialog, converting column abbr to name for display */
	ngOnInit() {
		if (this.cell['column'] !== 'nodeId' && this.cell['column'] !== 'select') {
			this.locales.forEach((locale) => {
				if (locale.abbr === this.cell['column'] && this.cell['row'][this.cell['column']] !== '...') {
					this.cell['column'] = locale.name;
				}
			});
		}
	}
}
