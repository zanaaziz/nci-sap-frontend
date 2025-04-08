import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from '@angular/cdk/layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfirmationDialogModule } from './shared/confirmation-dialog/confirmation-dialog.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './shared/jwt.interceptor';

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, AppRoutingModule, ConfirmationDialogModule, LayoutModule],
	providers: [provideAnimationsAsync(), provideHttpClient(withInterceptors([jwtInterceptor]))],
	bootstrap: [AppComponent],
})
export class AppModule {}
