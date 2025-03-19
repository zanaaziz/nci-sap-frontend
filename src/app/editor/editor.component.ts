import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CellDialogComponent } from './cell-dialog/cell-dialog.component';
import { LocaleDialogComponent } from './locale-dialog/locale-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { LOCALES } from './locale-dialog/locales';
import { forkJoin } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { LocaleService } from '../shared/locale.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { translations } from '../shared/sample_tr';
import { ViewportService } from '../shared/viewport.service';

@Component({
	selector: 'app-editor',
	standalone: false,
	templateUrl: './editor.component.html',
	styleUrl: './editor.component.scss',
})
export class EditorComponent {
	constructor(private dialog: MatDialog, private router: Router, public locale: LocaleService, public viewport: ViewportService) {}

	parentEnv: string;
	translationsPassword: string;
	data: Object[];
	loading: boolean = true;
	loadingTranslations: boolean = false;
	unsavedChangesCounter: number = 0;
	translations: MatTableDataSource<any>;
	selection = new SelectionModel<any>(true, []);
	searchValue: string;
	columns: string[] = [];
	selectedRows: Array<any> = [];
	selectedId: Array<any> = [];
	locales: { name: string; abbr: string }[] = LOCALES;
	translatedChunks: any[] = [];

	isTranslator: boolean = true;
	isTranslatorEditor: boolean = true;
	isTranslatorAdmin: boolean = true;

	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	search(value: string) {
		this.translations.filter = value.trim().toLowerCase();
		if (this.translations.paginator) this.translations.paginator.firstPage();
	}

	onCell(row: Object, column: string, defaultValue = '') {
		if (column === 'nodeId') return;

		const dialogRef = this.dialog.open(CellDialogComponent, {
			width: '600px',
			// height: '400px',
			data: { row: row, column: column, defaultValue: defaultValue },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				if (result.retranslate) {
					this.columns.forEach((column: string) => {
						if (column !== 'nodeId' && column !== 'en' && column !== 'select') {
							this.loadingTranslations = true;

							result.row[column] = '...';
						}
					});
				}

				this.unsavedChangesCounter += 1;
			}
		});
	}

	onLocales() {
		const dialogRef = this.dialog.open(LocaleDialogComponent, {
			width: '800px',
			height: '350px',
			data: { columns: this.columns },
		});

		var columnToTranslate: string[] = [];
		const httpCalls = [];

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.loadingTranslations = true;
				this.unsavedChangesCounter += 1;
				this.columns = result;

				var columnsPendingDeletion: string[] = [];
				var dataCopy = this.data;
				var enChunksToBeTranslated = this.arrayChunk(dataCopy);

				enChunksToBeTranslated.forEach((chunk) => {
					var sourceTextArray: string[] = [];

					chunk.forEach((row) => {
						Object.keys(row).forEach((column) => {
							if (this.columns.indexOf(column) === -1 && columnsPendingDeletion.indexOf(column) === -1) {
								columnsPendingDeletion.push(column);
							}
						});

						columnsPendingDeletion.forEach((column) => {
							delete row[column];
						});

						this.columns.forEach((column) => {
							if (column !== 'select' && row[column] === undefined) {
								if (row?.['en']) {
									sourceTextArray.push(row['en']);
									sourceTextArray.splice(0, sourceTextArray.length, ...new Set(sourceTextArray));
								}

								row[column] = '...';
								columnToTranslate.push(column);
								columnToTranslate.splice(0, columnToTranslate.length, ...new Set(columnToTranslate));
							}
						});
					});

					if (sourceTextArray.length === 0) {
						this.loadingTranslations = false;
						return;
					}
				});

				forkJoin(httpCalls).subscribe((res) => {
					var mergedResponseDataPerColumn = {};

					res.forEach((chunk) => {
						if (!(chunk['lang'] in mergedResponseDataPerColumn)) {
							mergedResponseDataPerColumn[chunk['lang']] = [];
						}

						mergedResponseDataPerColumn[chunk['lang']] = mergedResponseDataPerColumn[chunk['lang']].concat(chunk['data']);
					});

					for (let dataRowIndex = 0; dataRowIndex < this.data.length; dataRowIndex++) {
						columnToTranslate.forEach((column) => {
							this.data[dataRowIndex][column] = mergedResponseDataPerColumn[column][dataRowIndex].translatedText;
						});
					}

					this.loadingTranslations = false;
				});
			}
		});
	}

	arrayChunk(array: any[]) {
		const divisor = Math.ceil(array.length / 125);

		var chunkLength = Math.max(array.length / divisor, 1);
		var chunks = [];

		for (var i = 0; i < divisor; i++) {
			if (chunkLength * (i + 1) <= array.length) chunks.push(array.slice(chunkLength * i, chunkLength * (i + 1)));
		}

		return chunks;
	}

	onAddTranslation(defaultValue = '') {
		var latestIndex: number = 0;

		Object.entries(this.data).forEach(([key, value]) => {
			var index: number = +value['nodeId'].slice(1);
			if (index > latestIndex) latestIndex = index;
		});

		latestIndex += 1;

		const NEW_ID: string = 'n' + latestIndex.toString();

		const dialogRef = this.dialog.open(CellDialogComponent, {
			width: '440px',
			height: '300px',
			data: { newId: NEW_ID, defaultValue: defaultValue },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				var newRow: Object = {};

				newRow['nodeId'] = NEW_ID;
				newRow['en'] = result;

				this.columns.forEach((column: string) => {
					if (column !== 'nodeId' && column !== 'en' && column !== 'select') {
						this.loadingTranslations = true;

						newRow[column] = '...';
					}
				});

				this.data.splice(0, 0, <any>newRow);
				this.translations = new MatTableDataSource(this.data);
				this.translations.sort = this.sort;
				this.translations.paginator = this.paginator;

				this.unsavedChangesCounter += 1;
			}
		});
	}

	onDelete(selectedRows) {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			width: '350px',
			height: '220px',
			data: {
				message: 'Are you sure you want to delete ' + this.selectedId.length + ' translation(s)?',
				yes: 'Yes',
				no: 'No',
			},
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result === true) {
				selectedRows.forEach((row) => {
					this.data = this.data.filter((r) => r !== row);
				});

				this.translations = new MatTableDataSource(this.data);
				this.translations.sort = this.sort;
				this.translations.paginator = this.paginator;

				this.unsavedChangesCounter += 1;
				this.selectedId = [];
				this.selectedRows = [];
			}
		});
	}

	onSave(method: string = 'manual') {
		if (this.unsavedChangesCounter === 0 || this.loadingTranslations === true) return;
		if (method === 'manual') this.loading = true;

		const BODY: Object = {};
		BODY['data'] = this.data;
	}

	onPullDataFromParentEnv() {
		const DIALOG_REF = this.dialog.open(ConfirmationDialogComponent, {
			width: '350px',
			height: '220px',
			data: {
				message: 'This is a sensitive action that will impact the ' + 'this.env' + ' environment.',
				yes: 'Yes',
				no: 'No',
			},
		});

		DIALOG_REF.afterClosed().subscribe((result) => {
			if (result === true) {
				this.loading = true;
			}
		});
	}

	onPushDataToParentEnv() {
		if (this.unsavedChangesCounter !== 0) return;

		const DIALOG_REF = this.dialog.open(ConfirmationDialogComponent, {
			width: '350px',
			height: '220px',
			data: {
				message: 'This is a sensitive action that will impact the ' + 'this.parentEnv' + ' environment.',
				yes: 'Yes',
				no: 'No',
			},
		});

		DIALOG_REF.afterClosed().subscribe((result) => {
			if (result === true) {
				this.loading = true;
			}
		});
	}

	onLogout() {
		this.loading = true;
		// this.auth.logout();
		this.router.navigate(['/auth/login']);
	}

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.translations.data.length;

		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle($event) {
		this.selectedId = [];
		if ($event.checked === true) {
			this.translations.data.forEach((row) => {
				this.selectedRows.push(row);
				this.selectedId.push(row['nodeId']);
			});
		} else {
			this.selectedId = [];
			this.selectedRows = [];
		}

		if (this.isAllSelected()) {
			this.selection.clear();
			this.selectedRows = [];
			this.selectedId = [];
			return;
		}

		this.selection.select(...this.translations.data);
	}

	toggleCheck($event, row) {
		if ($event.checked) {
			this.selectedRows.push(row);
			this.selectedId.push(row['nodeId']);
		} else if (!$event.checked) {
			// delete the unchecked id from selectedId array
			for (var i = 0; i < this.selectedId.length; i++) {
				if (this.selectedId[i] === row['nodeId']) {
					this.selectedId.splice(i, 1);
				}
			}

			// delete the unchecked row from selectedRows array
			for (var i = 0; i < this.selectedRows.length; i++) {
				if (this.selectedRows[i] === row) {
					this.selectedRows.splice(i, 1);
				}
			}
		}
	}

	getColumnFullName(column): string {
		if (column === 'nodeId' || column === 'select') {
			return column;
		}

		return this.locales.find((elem) => elem.abbr === column)['name'];
	}

	numberOfMissingTranslations(column): number {
		var missingKeys: string[] = [];
		this.data.forEach((row) => {
			if (row[column] === '...') {
				missingKeys.push(row[column]);
			}
		});

		return missingKeys.length;
	}

	ngOnInit(): void {
		this.parentEnv = 'prod';

		this.data = translations['data'] as any;

		if (!this.columns.includes('select')) {
			this.columns.push('select');
		}

		if (!this.columns.includes('nodeId')) {
			this.columns.push('nodeId');
		}

		if (!this.columns.includes('en')) {
			this.columns.push('en');
		}

		Object.entries(this.data[0]).forEach(([key, value]) => {
			if (key !== 'nodeId' && key !== 'en') this.columns.push(key);
		});

		this.translations = new MatTableDataSource(this.data);
		this.translations.sort = this.sort;
		this.translations.paginator = this.paginator;

		this.loading = false;

		// autosave every 5 seconds
		setInterval((callback) => {
			this.onSave('auto');
		}, 5000);
	}
}
