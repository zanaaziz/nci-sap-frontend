import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private auth: AuthService) {}

	/**
	 * Determines whether to allow navigation or redirect based on the route and authentication status
	 * @param route The snapshot of the route being accessed
	 * @param state The state of the router at navigation time
	 * @returns boolean to allow access or UrlTree to redirect
	 */
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
		const targetUrl = state.url;
		const authenticated = !!this.auth.user();

		console.log(targetUrl, authenticated);

		if (targetUrl === '/') {
			// Root route: Redirect to '/editor' if authenticated, else to '/auth'
			return authenticated ? this.router.createUrlTree(['/editor']) : this.router.createUrlTree(['/auth']);
		} else if (targetUrl === '/auth') {
			// Auth route: Redirect to '/editor' if authenticated, else allow access
			return authenticated ? this.router.createUrlTree(['/editor']) : true;
		} else if (targetUrl === '/editor') {
			// Editor route: Allow access if authenticated, else redirect to '/auth'
			return authenticated ? true : this.router.createUrlTree(['/auth']);
		} else {
			// Default for unspecified routes: Deny access
			return false;
		}
	}
}
