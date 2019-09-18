import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

import { AuthenticationService, PwdcheckService } from '../_services';

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
    private authenticationService: AuthenticationService,
    private pwdcheckService: PwdcheckService,
    private http: HttpClient
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

  // getter - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
  get f() {
    return this.loginForm.controls;
  }

  closeAlert() {
    this.isShowAlert = false;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // https://haveibeenpwned.com/API/v3#PwnedPasswords
    const hash = CryptoJS.SHA1(this.f.password.value).toString(CryptoJS.enc.Hex).toUpperCase();
    const hashPrefix = hash.substring(0, 5);
    const hashSuffix = hash.substring(5, 40);
    const path = this.PWNED_PWD_URL + '/' + hashPrefix;
    this.http.get(path).toPromise().then(
      data => {
        console.log(data);
      },
      err => {
        console.log(err);
      }
    )

    // this.pwdcheckService.checkPassword(path).then(
    //   data => {
    //     console.log(data);
    //     this.loading = false;
    //   },
    //   err => {
    //     console.log(err);
    //     this.error = err;
    //     this.loading = false;
    //   }
    // );

    // await this.http.get<any>(this.PWNED_PWD_URL + '/' + hashPrefix).toPromise()
    //   .then(data => {
    //     console.log(data);

    //     this.authenticationService.login(this.f.email.value, this.f.password.value)
    //       .pipe(first())
    //       .subscribe(
    //         user => {
    //           console.log(user);
    //           this.router.navigate([this.returnUrl]);
    //         },
    //         error => {
    //           this.error = error;
    //           this.loading = false;
    //         }
    //       );
    //   });
  }
}
