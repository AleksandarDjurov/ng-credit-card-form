import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PwdcheckService {
  constructor(
    private http: HttpClient
  ) { }

  checkPassword(path: string) {
    return this.http.get(path).toPromise()
      .catch(err => Promise.reject(err));
  }
}
