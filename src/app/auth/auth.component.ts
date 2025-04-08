import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
	selector: 'app-auth',
	standalone: false,
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
	constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private http: HttpClient) {
		this.form = this.fb.group({
			email: [undefined, [Validators.required]],
			password: [undefined, [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$')]],
		});
	}

	form;
	loading: boolean = false;
	showPassword: boolean = false;

	apiUrl = 'https://nci-sap-backend-e973f3ade00b.herokuapp.com';

	onSubmit() {
		if (this.form.invalid) {
			return;
		}

		this.loading = true;

		this.http.post(`${this.apiUrl}/login`, this.form.value).subscribe(
			(res) => {
				const user = res;
				this.auth.login(user);
				this.loading = false;
				this.router.navigate(['/editor']);
			},
			(err) => {
				this.loading = false;
			}
		);
	}

	ngOnInit(): void {}
}
