import {Injectable} from '@angular/core';
import {HttpHeaders, HttpClient} from '@angular/common/http';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {OauthService} from '../../oauth/services/oauth.service';

@Injectable()
export class RedditService {

    private publicRedditUrl = 'https://www.reddit.com';
    private secureRedditUrl = 'https://oauth.reddit.com';

    private userDetailsUrl = this.secureRedditUrl + '/api/v1/me';

    constructor(private http: HttpClient, private oauthService: OauthService) {
    }

    public getUserDetails(): Observable<any> {
        return Observable.create(observer => {
            this.oauthService.getAccessToken().subscribe(response => {
                    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + response.access_token});
                    headers.append('Accept', 'application/json');
                    this.http.get(this.userDetailsUrl, {headers: headers})
                        .subscribe(userDetailsResponse => {
                                observer.next(userDetailsResponse);
                                observer.complete();
                            },
                            err => {
                                console.error(err);
                                observer.error(err);
                                observer.complete();
                            }
                        );
                },
                err => {
                    console.error(err);
                    observer.error(err);
                    observer.complete();
                }
            );
        });
    }

    private handleErrorObservable (error: Response | any) {
        console.error(error.message || error);
        return Observable.throw(error.message || error);
    }
}
