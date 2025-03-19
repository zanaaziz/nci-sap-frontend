import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from '@angular/cdk/layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfirmationDialogModule } from './shared/confirmation-dialog/confirmation-dialog.module';

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, AppRoutingModule, ConfirmationDialogModule, LayoutModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
