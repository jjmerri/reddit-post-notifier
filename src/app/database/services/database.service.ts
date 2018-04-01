import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';

@Injectable()
export class DatabaseService {
    private databaseUri = environment.firebase.databaseURL;

    private notificationPreferencesUrl = this.databaseUri + '/notification_preferences';

    constructor(private http: HttpClient) {
    }

    public storeProcessedComments(userId: string, submissionName: string, processedComments: string[]): Observable<any> {
        const fullUri = this.notificationPreferencesUrl + '/' + userId + '/' + submissionName + '.json';
        const headers = new HttpHeaders({});
        headers.append('Accept', 'application/json');
        return this.http.put(fullUri, processedComments, {headers: headers})
            .catch(this.handleErrorObservable);
    }

    public getProcessedComments(userId: string, submissionName: string): Observable<any> {
        const fullUri = this.notificationPreferencesUrl + '/' + userId + '/' + submissionName + '.json';
        const headers = new HttpHeaders({});
        headers.append('Accept', 'application/json');
        return this.http.get(fullUri, {headers: headers})
            .catch(this.handleErrorObservable);
    }

    private handleErrorObservable (error: Response | any) {
        console.error(error.message || error);
        return Observable.throw(error.message || error);
    }
}
