import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'vex-confirmation-dialog',
	standalone: false,
	templateUrl: './confirmation-dialog.component.html',
	styleUrls: ['./confirmation-dialog.component.scss'],
	animations: [],
})
export class ConfirmationDialogComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { message: string; title?: string; confirmButtonText?: string; confirmButtonColor?: string; cancelButton?: boolean }
	) {
		if (!data.title) {
			data.title = 'Are you sure?';
		}

		if (!data.confirmButtonText) {
			data.confirmButtonText = 'YES';
		}
	}

	onConfirm(): void {
		this.dialogRef.close(true);
	}

	onDismiss(): void {
		this.dialogRef.close(false);
	}

	ngOnInit() {}
}
