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
  private supportedSubredditsUrl = '/supported_subreddits';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  public saveSubredditPreferences(preferences: any, subreddit_name: string) {
    const userId = this.authService.getUserId();
    firebase.database().ref(this.notificationPreferencesUrl + '/subreddits/' + subreddit_name + '/user_preferences/' + userId).set(preferences);
  }

  public getPreferences(subreddit: string): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/subreddits/' + subreddit + '/user_preferences/' + userId)
      .once('value');
  }

  public getGlobalPreferences(): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/users/' + userId + '/global_preferences')
      .once('value');
  }

  public getSupportedSubreddits(): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.supportedSubredditsUrl)
      .once('value');
  }

  public saveGlobalPreferences(preferences: any): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/users/' + userId + '/global_preferences').set(preferences);
  }

  public getUserPreferences(): Promise<any> {
    const userId = this.authService.getUserId();
    return firebase.database().ref(this.notificationPreferencesUrl + '/users/' + userId)
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
