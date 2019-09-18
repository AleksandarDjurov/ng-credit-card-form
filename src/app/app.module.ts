import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { PasswordCheckerModule } from '@triangular/password-checker';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { LoginComponent } from './login';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    appRoutingModule,
    MDBBootstrapModule.forRoot(),
    PasswordCheckerModule.forRoot({
      pwnedPasswordApiCallDebounceTime: 500,
      pwnedPasswordMinimumOccurrenceForError: 4,
      pwnedPasswordApi: 'https://api.pwnedpasswords.com/range/'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
