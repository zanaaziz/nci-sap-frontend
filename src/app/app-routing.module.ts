import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';

const routes: Routes = [
	{ path: '', redirectTo: '/auth', pathMatch: 'full' },
	{
		path: 'auth',
		canActivate: [AuthGuard],
		loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
	},
	{
		path: 'editor',
		canActivate: [AuthGuard],
		loadChildren: () => import('./editor/editor.module').then((m) => m.EditorModule),
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
