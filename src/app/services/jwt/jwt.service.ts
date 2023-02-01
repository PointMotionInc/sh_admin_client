import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { Observable, Subject } from 'rxjs';
import { GqlClientService } from '../gql-client/gql-client.service';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private currentToken = new Subject<string>();
  private tokenSetInterval: any;

  constructor(private client: GqlClientService) {}

  watchToken(): Observable<any> {
    return this.currentToken.asObservable();
  }

  isAuthenticated() {
    const accessToken = this.getToken();

    if (!accessToken) {
      return false;
    }

    const decodedToken: {
      iat: number;
      exp: number;
    } = jwtDecode(accessToken);

    const nowUnixEpochInSecs = new Date().getTime() / 1000;
    const diffInSecs = nowUnixEpochInSecs - decodedToken.exp;

    // token stays valid for 24hrs.
    if (diffInSecs >= 0) {
      return false;
    }

    return true;
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
  }

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
    this.client.refreshClient();
  }

  getToken() {
    const token = localStorage.getItem('accessToken');
    return token;
  }
}
