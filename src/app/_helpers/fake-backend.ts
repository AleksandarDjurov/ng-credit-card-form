import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from '../_models';

let users: User[] = [
  {
    id: 1,
    email: 'test@mail.com',
    password: '',
    nameOnCc: '',
    ccNumber: '',
    ccExpiration: '',
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

    if (url.includes('api.pwnedpasswords.com/range') && method === 'GET') {
      // REMOTE API call
      return next.handle(request);
    } else {
      // SIMULATE server API call by wrapping in delayed observable
      return of(null)
        .pipe(mergeMap(handleRoute))
        .pipe(materialize())
        .pipe(delay(500))
        // https://github.com/Reactive-Extensions/RxJS/issues/648#issuecomment-88669470
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
      const email = body.email;
      const password = body.password;

      const user = users.find(x => x.email === email && password);
      if (!user) return error('Email is incorrect!');

      const loginUser = Object.assign({}, user, body, {
        token: 'fake-jwt-token'
      });

      return ok(loginUser);
    }

    function getUsers() {
      if (!isLoggedIn()) return unauthorized();
      users = fn_compose_users();
      return ok(users);
    }

    function fn_compose_users(): User[] {
      try {
        const authUser = localStorage.getItem('currentUser') && JSON.parse(localStorage.getItem('currentUser')) || {};
        const result = [];
        result.push(authUser);
        return result;
      } catch (e) {
        console.log(e);
        return users;
      }
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
