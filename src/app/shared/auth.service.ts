import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor() {}

	user(): Object {
		return JSON.parse(localStorage.getItem('user'));
	}

	login(user: Object): void {
		localStorage.setItem('user', JSON.stringify(user));
	}

	logout(): void {
		localStorage.clear();
	}
}
