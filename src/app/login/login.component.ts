import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  isShowAlert = true;
  returnUrl: string;
  error = '';

  PWNED_PWD_URL = 'https://api.pwnedpasswords.com/range';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nameOnCc: ['', Validators.required],
      ccNumber: ['', Validators.required],
      ccExpiration: [null, Validators.required],
      ccSecurityCode: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // getter | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
  get f() {
    return this.loginForm.controls;
  }

  closeAlert() {
    this.isShowAlert = false;
  }

  onSubmit() {
    this.submitted = true;
    if (
      (this.loginForm.invalid) ||
      (!this.f.password.pending && this.f.password.errors && this.f.password.errors.pwnedPasswordOccurrence)
    ) {
      return;
    }
    this.loading = true;

    const credentials = {
      email: this.f.email.value,
      password: this.f.password.value,
      nameOnCc: this.f.nameOnCc.value,
      ccNumber: this.f.ccNumber.value,
      ccExpiration: this.f.ccExpiration.value,
      ccSecurityCode: this.f.ccSecurityCode.value
    };
    this.authenticationService.login(credentials)
      .pipe(first())
      .subscribe(
        user => {
          console.log(user);
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
  }
}
