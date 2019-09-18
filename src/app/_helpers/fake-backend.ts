import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import * as moment from 'moment';

import { User } from '../_models';

const users: User[] = [
  {
    id: 1,
    email: 'test@mail.com',
    password: '',
    nameOnCc: '',
    ccNumber: '',
    ccExpiration: null,
    ccSecurityCode: ''
  }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    if (
      url.includes('api.pwnedpasswords.com/range') &&
      method === 'GET'
    ) {
      // real API call
      return next.handle(request);
    } else {
      // simulate server API call by wrapping in delayed observable
      return of(null)
        .pipe(mergeMap(handleRoute))
        // call materialize and dematerialize to ensure delay even if an error is thrown
        // https://github.com/Reactive-Extensions/RxJS/issues/648
        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize());
    }

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        default:
          return next.handle(request);
      }
    }

    function authenticate() {
      const { email, password } = body;

      const user = users.find(x => x.email === email && password);
      if (!user) return error('Email is incorrect!');

      return ok({
        id: user.id || 1,
        email: user.email,
        nameOnCc: user.nameOnCc || 'testuser',
        ccNumber: user.ccNumber || '12345678',
        ccExpiration: user.ccExpiration || moment('2019-12-31'),
        ccSecurityCode: user.ccSecurityCode || '0000',
        token: 'fake-jwt-token'
      });
    }

    function getUsers() {
      if (!isLoggedIn()) return unauthorized();
      return ok(users);
    }

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function error(message) {
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorized' } });
    }

    function isLoggedIn() {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }
  }
}

// use fake backend in place of Http service for serverless development
export let fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
}
