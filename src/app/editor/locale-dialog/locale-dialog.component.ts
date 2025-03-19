import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LOCALES } from './locales';
import { LocaleService } from '../../shared/locale.service';

@Component({
	selector: 'app-locale-dialog',
	standalone: false,
	templateUrl: './locale-dialog.component.html',
	styleUrls: ['./locale-dialog.component.scss'],
})
export class LocaleDialogComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<LocaleDialogComponent>,
		public locale: LocaleService,
		@Inject(MAT_DIALOG_DATA) public data: { columns: string[] }
	) {
		this.filteredLocales = this.localeControl.valueChanges.pipe(
			startWith(null),
			map((locale: string | null) => (locale ? this.filter(locale) : this.locales.slice()))
		);
	}

	localeControl = new FormControl();
	filteredLocales: Observable<{ name: string; abbr: string }[]>;
	selectedLocales: string[] = [];
	locales: { name: string; abbr: string }[] = LOCALES;

	@ViewChild('localeInput') localeInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	remove(locale: string): void {
		if (locale === 'en' || locale === 'nodeId') return;

		const INDEX = this.selectedLocales.indexOf(locale);

		if (INDEX >= 0) {
			this.selectedLocales.splice(INDEX, 1);
		}
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		if (this.selectedLocales.indexOf(event.option.value) === -1) this.selectedLocales.push(event.option.value);

		this.localeInput.nativeElement.value = '';
		this.localeControl.setValue(null);
	}

	onSave() {
		var addedLocales: string[] = [];

		addedLocales.push('select');
		addedLocales.push('nodeId');

		this.selectedLocales.forEach((column) => {
			this.locales.forEach((locale) => {
				if (locale.name === column) {
					addedLocales.push(locale.abbr);
				}
			});
		});

		this.dialogRef.close(addedLocales);
	}

	onCancel() {
		this.dialogRef.close(undefined);
	}

	ngOnInit() {
		this.data['columns'].filter((column) => {
			this.locales.forEach((locale) => {
				if (locale.abbr === column) {
					this.selectedLocales.push(locale.name);
				}
			});
		});
	}

	private filter(value: string): { name: string; abbr: string }[] {
		return this.locales.filter((locale) => locale['name'].toLowerCase().indexOf(value.toLowerCase()) === 0);
	}
}
