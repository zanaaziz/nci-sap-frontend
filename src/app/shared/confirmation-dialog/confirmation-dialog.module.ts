import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsDialogsRoutingModule } from './confirmation-dialog-routing.module';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
	declarations: [ConfirmationDialogComponent],
	imports: [CommonModule, ComponentsDialogsRoutingModule, MatButtonModule, MatDialogModule],
})
export class ConfirmationDialogModule {
}
