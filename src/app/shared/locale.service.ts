import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class LocaleService {
	constructor() {}

	lang: string;
	translations: Object;

	setPreferredLang(lang: string): void {
		localStorage.setItem('lang', lang);
		this.lang = lang;
	}

	getPreferredLang(): string {
		return localStorage.getItem('lang');
	}
}
