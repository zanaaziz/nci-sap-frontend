import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-auth',
	standalone: false,
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
	constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
		this.form = this.fb.group({
			email: [undefined, [Validators.required]],
			password: [undefined, [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$')]],
		});
	}

	form;
	loading: boolean = false;
	showPassword: boolean = false;

	onSubmit() {
		if (this.form.invalid) {
			return;
		}

		this.loading = true;

		this.router.navigate(['/editor']);
	}

	ngOnInit(): void {}
}
