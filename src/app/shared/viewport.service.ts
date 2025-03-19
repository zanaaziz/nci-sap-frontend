import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class ViewportService {
	constructor() {
	}

	sm: boolean;
	md: boolean;
	lg: boolean;
	xl: boolean;

	set(breakpoint: string) {
		if (breakpoint === 'sm') {
			this.sm = true;
			this.md = false;
			this.lg = false;
			this.xl = false;
		} else if (breakpoint === 'md') {
			this.sm = false;
			this.md = true;
			this.lg = false;
			this.xl = false;
		} else if (breakpoint === 'lg') {
			this.sm = false;
			this.md = false;
			this.lg = true;
			this.xl = false;
		} else if (breakpoint === 'xl') {
			this.sm = false;
			this.md = false;
			this.lg = false;
			this.xl = true;
		} else {
			this.sm = false;
			this.md = false;
			this.lg = false;
			this.xl = false;
		}
	}

	isNull(): boolean {
		return !this.sm && !this.md && !this.lg && !this.xl;
	}
}
