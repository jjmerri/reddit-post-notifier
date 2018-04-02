import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {environment} from '../../../environments/environment';

@Injectable()
export class OauthService {
  public accessTokenObservable: Observable<any>;
  private accessTokenObserver: Observer<any>;

  private authUrl = 'https://www.reddit.com/api/v1/authorize';

  private client_id = environment.client_id;
  private client_secret = environment.client_secret;
  private redirectUri = environment.redirectUri;

  private accessTokenUrl = 'https://www.reddit.com/api/v1/access_token';
  private revokeTokenUrl = 'https://www.reddit.com/api/v1/revoke_token';
  private state = 'XYZ';
  private accessToken = '';
  private refreshToken = '';
  private expireTime: number;

  constructor(private http: HttpClient) {
    this.accessTokenObservable = new Observable(observer => this.accessTokenObserver = observer).share();
  }

  public requestAccessToken(authCode: string, state: string): Observable<any> {
    this.retrieveAccessToken(authCode, state).subscribe(
      response => {
        const currentDate = new Date();

        this.accessToken = response.access_token;
        this.refreshToken = response.refresh_token;
        this.expireTime = (Math.round(currentDate.getTime() / 1000)) + response.expires_in - 30;

        this.accessTokenObserver.next({success: true});
      },
      err => {
        console.error(err);
        this.accessTokenObserver.next({success: false, error: err});
      }
    );

    return this.accessTokenObservable;
  }

  public getAccessToken(): Observable<any> {
    const currentDate = new Date();
    if ((Math.round(currentDate.getTime() / 1000)) >= this.expireTime) {
      return this.refreshAccessToken();
    } else {
      return Observable.of({access_token: this.accessToken}).map(o => o);
    }
  }

  public requestPermission() {
    window.location.href = this.authUrl + '?client_id=' + this.client_id + '&response_type=code&' +
      'state=' + this.state + '&redirect_uri=' + this.redirectUri +
      '&duration=permanent&scope=identity';
  }

  private retrieveAccessToken(authCode: string, state: string): Observable<any> {
    if (this.state !== state) {
      console.error('States dont match!', this.state, state);
      return Observable.throw('States do not match!');
    }

    let form = new FormData();
    form.append('code', authCode);
    form.append('grant_type', 'authorization_code');
    form.append('redirect_uri', this.redirectUri);

    let headers = new HttpHeaders({'Authorization': 'Basic ' + btoa(this.client_id + ':' + this.client_secret)});
    headers.append('Accept', 'application/json');
    return this.http.post(this.accessTokenUrl, form, {headers: headers})
      .catch(this.handleErrorObservable);
  }

  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }

  private refreshAccessToken(): Observable<any> {
    return Observable.create(observer => {
      let form = new FormData();
      form.append('grant_type', 'refresh_token');
      form.append('refresh_token', this.refreshToken);

      let headers = new HttpHeaders({'Authorization': 'Basic ' + btoa(this.client_id + ':' + this.client_secret)});
      headers.append('Accept', 'application/json');
      this.http.post(this.accessTokenUrl, form, {headers: headers}).subscribe(
        (res: any) => {
          observer.next(this.extractToken(res));
          observer.complete();
        },
        (err: HttpErrorResponse) => {
          console.error(err);
          observer.error(err);
          observer.complete();
        }
      );
    });
  }

  private extractToken(response: Response) {
    const currentDate = new Date();
    const body: any = response;

    this.accessToken = body.access_token;
    this.expireTime = (Math.round(currentDate.getTime() / 1000)) + body.expires_in - 30;

    return body || {};
  }

  public logout() {
    this.revokeRefreshToken().subscribe();
    this.accessToken = '';
    this.refreshToken = '';
  }

  public revokeRefreshToken(): Observable<any> {
    let form = new FormData();
    form.append('token_type_hint', 'refresh_token');
    form.append('token', this.refreshToken);

    let headers = new HttpHeaders({'Authorization': 'Basic ' + btoa(this.client_id + ':' + this.client_secret)});
    headers.append('Accept', 'application/json');
    return this.http.post(this.revokeTokenUrl, form, {headers: headers})
      .catch(this.handleErrorObservable);
  }
}
