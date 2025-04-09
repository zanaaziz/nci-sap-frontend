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
// import { translations } from '../shared/sample_data';
import { ViewportService } from '../shared/viewport.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../shared/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-editor',
	standalone: false,
	templateUrl: './editor.component.html',
	styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {
	constructor(
		private dialog: MatDialog,
		private router: Router,
		public locale: LocaleService,
		public viewport: ViewportService,
		private http: HttpClient,
		public auth: AuthService,
		private sanitizer: DomSanitizer
	) {}

	apiUrl = 'https://nci-sap-backend-e973f3ade00b.herokuapp.com';

	// INSECURE: Bypasses sanitization (Stored XSS)
	sanitizeContent(content: string): any {
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

	searchMessage: any; // Changed to 'any' to hold unsanitized HTML (Reflected XSS)

	// Translation data loaded from a sample data source (e.g., mock JSON)
	data: Object[];
	// Indicates whether the component is in a loading state (e.g., during initialization or saving)
	loading: boolean = true;
	// Indicates whether translations are being processed (e.g., when adding a new language)
	loadingTranslations: boolean = false;
	// Tracks the number of unsaved changes to enable/disable save functionality
	unsavedChangesCounter: number = 0;
	// Data source for the Material table, managing translation rows
	translations: MatTableDataSource<any>;
	// Manages row selection for batch operations like deletion
	selection = new SelectionModel<any>(true, []);
	// Stores the current search input for filtering table rows
	searchValue: string;
	// Defines the columns displayed in the table (e.g., 'select', 'node_id', 'en', 'fr', etc.)
	columns: string[] = [];
	// Tracks selected rows and their IDs for operations like deletion
	selectedRows: Array<any> = [];
	selectedId: Array<any> = [];
	// List of available locales (languages) for translation management
	locales: { name: string; abbr: string }[] = LOCALES;

	// Role flags to determine user permissions
	isTranslatorEditor: boolean = true; // Can edit translations
	isTranslatorAdmin: boolean = true; // Can perform admin actions (e.g., add/remove languages)

	// References to Material table components for sorting and pagination
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	/** Filters the translation table based on user search input */
	search(value: string) {
		this.translations.filter = value.trim().toLowerCase();
		if (this.translations.paginator) this.translations.paginator.firstPage();

		// INSECURE: Fetch from vulnerable endpoint (Reflected XSS)
		this.http.get(`${this.apiUrl}/translations/search?term=${value}`).subscribe(
			(res: any) => {
				if (res.message) {
					this.searchMessage = this.sanitizer.bypassSecurityTrustHtml(res.message);
				} else {
					this.searchMessage = null;
				}
			},
			(err) => {
				console.log(err);
			}
		);
	}

	/** Opens a dialog to edit a specific cell in the table */
	onCell(row: Object, column: string, defaultValue = '') {
		if (column === 'node_id') return; // node_id is a read-only unique identifier

		const dialogRef = this.dialog.open(CellDialogComponent, {
			width: '600px',
			data: { row: row, column: column, defaultValue: defaultValue },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.unsavedChangesCounter += 1; // Track modification for save prompt
			}
		});
	}

	/** Opens a dialog to manage languages and processes translations for newly added languages */
	onLocales() {
		const dialogRef = this.dialog.open(LocaleDialogComponent, {
			width: '800px',
			height: '350px',
			data: { columns: this.columns }, // Pass current columns to dialog
		});

		// Arrays to manage translation tasks and HTTP calls
		var columnToTranslate: string[] = []; // Columns requiring new translations
		const httpCalls = []; // Placeholder for future HTTP translation requests

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.loadingTranslations = true; // Indicate translation processing has started
				this.unsavedChangesCounter += 1; // Mark changes as unsaved
				this.columns = result; // Update table columns with user-selected languages

				// Step 1: Identify columns to remove (no longer selected by user)
				var columnsPendingDeletion: string[] = [];
				var dataCopy = this.data; // Use a copy to avoid mutating original data prematurely
				var enChunksToBeTranslated = this.arrayChunk(dataCopy); // Split data into manageable chunks

				// Step 2: Process each chunk of data
				enChunksToBeTranslated.forEach((chunk) => {
					var sourceTextArray: string[] = []; // English texts to translate into new languages

					chunk.forEach((row) => {
						// Identify columns to delete (not in the new column list)
						Object.keys(row).forEach((column) => {
							if (this.columns.indexOf(column) === -1 && columnsPendingDeletion.indexOf(column) === -1) {
								columnsPendingDeletion.push(column); // Queue for deletion
							}
						});

						// Step 3: Remove obsolete columns from each row
						columnsPendingDeletion.forEach((column) => delete row[column]);

						// Step 4: Add new columns and prepare translation
						this.columns.forEach((column) => {
							if (column !== 'select' && row[column] === undefined) {
								// If the row has an English translation, queue it for translation
								if (row?.['en']) {
									sourceTextArray.push(row['en']);
									// Deduplicate English texts to avoid redundant translations
									sourceTextArray.splice(0, sourceTextArray.length, ...new Set(sourceTextArray));
								}
								row[column] = '...'; // Placeholder until translation is complete
								columnToTranslate.push(column);
								// Deduplicate columns to translate
								columnToTranslate.splice(0, columnToTranslate.length, ...new Set(columnToTranslate));
							}
						});
					});

					// Early exit if no translations are needed
					if (sourceTextArray.length === 0) {
						this.loadingTranslations = false;
						return;
					}
				});

				// Step 5: Process translations (currently a placeholder with forkJoin)
				forkJoin(httpCalls).subscribe((res) => {
					var mergedResponseDataPerColumn = {}; // Aggregate translation responses by language
					res.forEach((chunk) => {
						if (!(chunk['lang'] in mergedResponseDataPerColumn)) {
							mergedResponseDataPerColumn[chunk['lang']] = [];
						}
						mergedResponseDataPerColumn[chunk['lang']] = mergedResponseDataPerColumn[chunk['lang']].concat(chunk['data']);
					});

					// Step 6: Update table data with translated text
					for (let dataRowIndex = 0; dataRowIndex < this.data.length; dataRowIndex++) {
						columnToTranslate.forEach((column) => {
							this.data[dataRowIndex][column] = mergedResponseDataPerColumn[column][dataRowIndex].translatedText;
						});
					}
					this.loadingTranslations = false; // Translation processing complete
				});
			}
		});
	}

	/** Splits an array into smaller chunks to manage large datasets efficiently */
	arrayChunk(array: any[]) {
		const divisor = Math.ceil(array.length / 125); // Aim for ~125 rows per chunk
		var chunkLength = Math.max(array.length / divisor, 1); // Ensure at least 1 item per chunk
		var chunks = [];
		for (var i = 0; i < divisor; i++) {
			if (chunkLength * (i + 1) <= array.length) {
				chunks.push(array.slice(chunkLength * i, chunkLength * (i + 1)));
			}
		}
		return chunks;
	}

	/** Adds a new translation row to the table */
	onAddTranslation(defaultValue = '') {
		var latestIndex: number = 0;
		// Determine the highest existing node_id to generate a unique ID
		Object.entries(this.data).forEach(([key, value]) => {
			var index: number = +value['node_id'].slice(1); // Extract numeric part (e.g., 'n1' -> 1)
			if (index > latestIndex) latestIndex = index;
		});
		latestIndex += 1;
		const NEW_ID: string = 'n' + latestIndex.toString(); // e.g., 'n2'

		const dialogRef = this.dialog.open(CellDialogComponent, {
			width: '440px',
			height: '300px',
			data: { newId: NEW_ID, defaultValue: defaultValue },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				var newRow: Object = {};
				newRow['node_id'] = NEW_ID; // Assign unique ID
				newRow['en'] = result; // English translation from dialog input
				// Initialize other language columns with placeholders
				this.columns.forEach((column: string) => {
					if (column !== 'node_id' && column !== 'en' && column !== 'select') {
						this.loadingTranslations = true;
						newRow[column] = '...'; // Placeholder for pending translation
					}
				});
				// Insert new row at the top of the table
				this.data.splice(0, 0, <any>newRow);
				this.translations = new MatTableDataSource(this.data);
				this.translations.sort = this.sort;
				this.translations.paginator = this.paginator;
				this.unsavedChangesCounter += 1; // Track unsaved change
			}
		});
	}

	/** Deletes selected translations after user confirmation */
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
				// Filter out selected rows from the data
				selectedRows.forEach((row) => {
					this.data = this.data.filter((r) => r !== row);
				});
				this.translations = new MatTableDataSource(this.data);
				this.translations.sort = this.sort;
				this.translations.paginator = this.paginator;
				this.unsavedChangesCounter += 1; // Track unsaved change
				this.selectedId = [];
				this.selectedRows = [];
			}
		});
	}

	/** Saves changes to the translation data (placeholder for actual save logic) */
	onSave(method: string = 'manual') {
		if (this.unsavedChangesCounter === 0 || this.loadingTranslations === true) return;
		if (method === 'manual') this.loading = true;
		const BODY: Object = { data: this.data };
		console.log(BODY); // Log data for now; replace with API call in production

		this.http.post(`${this.apiUrl}/translations`, this.data).subscribe(
			(res) => {
				console.log(res);
				this.unsavedChangesCounter = 0;
				this.loading = false;
			},
			(err) => {
				console.log(err);
				this.loading = false;
			}
		);
	}

	/** Scrolls to the top of the page on pagination change */
	onPageChange() {
		window.scroll(0, 0);
	}

	/** Logs out the user and redirects to the authentication page */
	onLogout() {
		this.loading = true;
		this.auth.logout();
		this.router.navigate(['/auth']);
	}

	/** Checks if all rows in the table are selected */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.translations.data.length;
		return numSelected === numRows;
	}

	/** Toggles selection of all rows in the table */
	masterToggle($event) {
		this.selectedId = []; // Reset selected IDs

		if ($event.checked === true) {
			// Select all rows and populate selectedRows/selectedId arrays
			this.translations.data.forEach((row) => {
				this.selectedRows.push(row); // Track entire row object
				this.selectedId.push(row['node_id']); // Track node_id for deletion reference
			});
		} else {
			// Clear all selections
			this.selectedId = [];
			this.selectedRows = [];
		}

		// Toggle selection state: clear if all selected, otherwise select all
		if (this.isAllSelected()) {
			this.selection.clear();
			this.selectedRows = [];
			this.selectedId = [];
			return;
		}
		this.selection.select(...this.translations.data);
	}

	/** Toggles selection of an individual row */
	toggleCheck($event, row) {
		if ($event.checked) {
			// Add row to selection
			this.selectedRows.push(row);
			this.selectedId.push(row['node_id']);
		} else {
			// Remove row from selection
			for (var i = 0; i < this.selectedId.length; i++) {
				if (this.selectedId[i] === row['node_id']) this.selectedId.splice(i, 1);
			}
			for (var i = 0; i < this.selectedRows.length; i++) {
				if (this.selectedRows[i] === row) this.selectedRows.splice(i, 1);
			}
		}
	}

	/** Retrieves the full name of a column based on its abbreviation */
	getColumnFullName(column): string {
		if (column === 'node_id' || column === 'select') return column;
		return this.locales.find((elem) => elem.abbr === column)['name'];
	}

	/** Counts the number of missing translations for a given column */
	numberOfMissingTranslations(column): number {
		var missingKeys: string[] = [];
		this.data.forEach((row) => {
			if (row[column] === '...') missingKeys.push(row[column]);
		});
		return missingKeys.length;
	}

	/** Initializes the component, sets up the table, and starts autosave */
	ngOnInit(): void {
		this.http.get(`${this.apiUrl}/translations`).subscribe(
			(res) => {
				// INSECURE: fetching data unsafely (Stored XSS)
				this.data = (res as any).map((row) => {
					Object.keys(row).forEach((key) => {
						if (key !== 'node_id' && key !== 'select') {
							row[key] = this.sanitizeContent(row[key]);
						}
					});
					return row;
				});

				// Ensure essential columns are present
				if (!this.columns.includes('select')) this.columns.push('select');
				if (!this.columns.includes('node_id')) this.columns.push('node_id');
				if (!this.columns.includes('en')) this.columns.push('en');

				// Dynamically add language columns from the first data row
				Object.entries(this.data[0]).forEach(([key, value]) => {
					if (key !== 'node_id' && key !== 'en') this.columns.push(key);
				});

				// Initialize table with sorting and pagination
				this.translations = new MatTableDataSource(this.data);
				this.translations.sort = this.sort;
				this.translations.paginator = this.paginator;
				this.loading = false;

				// Set up autosave every 5 seconds
				setInterval(() => this.onSave('auto'), 5000);
			},
			(err) => {
				console.log(err);
				this.loading = false;
			}
		);
	}
}
