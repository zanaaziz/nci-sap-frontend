import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

const routes: Routes = [
	{
		path: '',
		component: ConfirmationDialogComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ComponentsDialogsRoutingModule {
}
