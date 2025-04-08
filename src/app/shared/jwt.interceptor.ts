import { HttpRequest, HttpHandlerFn, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

// Define the functional interceptor
export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	// Inject the AuthService within the function
	const auth = inject(AuthService);

	// Get the user and token
	const user = auth.user();
	let jwt;

	if (!!user?.['token']) {
		jwt = user['token'];
		// Clone the request with the Authorization header
		req = req.clone({
			headers: new HttpHeaders({
				Authorization: `Bearer ${jwt}`,
			}),
		});
	}

	// Pass the request (modified or original) to the next handler
	return next(req);
}
