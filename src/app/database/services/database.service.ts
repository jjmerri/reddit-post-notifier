import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../auth/services/auth.service';
import * as firebase from 'firebase/app';

@Injectable()
export class DatabaseService {
  private databaseUri = environment.firebase.databaseURL;

  private notificationPreferencesUrl = '/notification_preferences';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  public savePreferences(preferences: any, subreddit_name: string) {
    const userId = this.authService.getUserId();
    firebase.database().ref(this.notificationPreferencesUrl + '/subreddits/' + subreddit_name + '/user_preferences/' + userId).set(preferences);
  }

  public getPreferences(subreddit: string): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/subreddits/' + subreddit + '/user_preferences/' + userId)
      .once('value');
  }

  public getRedditPreferences(): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/users/' + userId + '/reddit')
      .once('value');
  }

  public saveRedditUserName(userName: string) {
    const userId = this.authService.getUserId();
    firebase.database().ref(this.notificationPreferencesUrl + '/users/' + userId + '/reddit').set({userName: userName});
  }

  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }
}
