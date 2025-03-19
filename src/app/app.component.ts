import { Component, OnInit } from '@angular/core';
import { ViewportService } from './shared/viewport.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	standalone: false,
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	constructor(public viewport: ViewportService, private bpo: BreakpointObserver) {}

	observeViewport() {
		this.bpo.observe(['(max-width: 767px)', '(max-width: 768px)', '(max-width: 992px)', '(max-width: 1200px)']).subscribe((res) => {
			if (res['breakpoints']['(max-width: 767px)']) {
				this.viewport.set(null);
			} else if (res['breakpoints']['(max-width: 768px)']) {
				this.viewport.set('sm');
			} else if (res['breakpoints']['(max-width: 992px)']) {
				this.viewport.set('md');
			} else if (res['breakpoints']['(max-width: 1200px)']) {
				this.viewport.set('lg');
			} else {
				this.viewport.set('xl');
			}
		});
	}

	ngOnInit(): void {
		this.observeViewport();
	}
}
