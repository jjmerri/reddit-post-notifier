import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {AngularFireDatabase, AngularFireList} from 'angularfire2/database';

import 'rxjs/Rx';

import {OauthService} from '../oauth/services/oauth.service';
import {RedditService} from '../reddit/services/reddit.service';
import {DatabaseService} from '../database/services/database.service';
import {AuthService} from '../auth/services/auth.service';

import swal2 from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private userName: string;
  private userId: string;
  private preferences = {subreddit: 'edc_raffle', pmPreference: false};
  private subreddits = ['edc_raffle', 'KnifeRaffle', 'lego_raffles'];

  constructor(private activatedRoute: ActivatedRoute, private oauthService: OauthService,
              private redditService: RedditService, private databaseService: DatabaseService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params['code']) {
        this.oauthService.requestAccessToken(params['code'], params['state']).subscribe(res => {
          if (res.success === true) {
            this.updateUserName();
          } else {
            console.error('error retrieving access token', res);
          }

        });
      }
    });

    this.authService.showLogin();

    const unsubscribe = this.authService.setAuthStateChangeCallback(user => {
      if (user) {
        this.loadPreferences('edc_raffle');
        unsubscribe();
      }
    });
  }

  public linkWithReddit() {
    this.oauthService.requestPermission();
  }

  private updateUserName() {
    this.redditService.getUserDetails().subscribe(userDetailsResponse => {
        if (userDetailsResponse.name) {
          this.userName = userDetailsResponse.name;
          this.userId = userDetailsResponse.id;

          const unsubscribe = this.authService.setAuthStateChangeCallback(user => {
            if (user) {
              this.updateLinkeRedditUserName(userDetailsResponse.name);
              unsubscribe();
            }
          });
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  private logout() {
    this.authService.logout();
    this.logoutReddit();
    this.authService.showLogin();
  }

  private logoutReddit() {
    this.oauthService.logout();
    this.userId = null;
    this.userName = null;
  }

  private get userIsLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private updatePreferences() {
    this.databaseService.savePreferences(this.preferences);
  }

  private loadPreferences(subreddit) {
    this.databaseService.getPreferences(subreddit).then(snapshot => {
      const preferences = snapshot.val();
      if (preferences) {
        this.preferences = preferences;
      } else {
        this.preferences = {subreddit: subreddit, pmPreference: false};
      }
    });
  }

  private updateLinkeRedditUserName(userName: string) {
    this.databaseService.getRedditPreferences().then(snapshot => {
      const redditPreferences = snapshot.val();
      if (redditPreferences && redditPreferences.userName !== userName) {
        swal2({
                type: 'warning',
                title: 'Previously Linked With ' + redditPreferences.userName,
                text: '. You can only link with one Reddit account per Reddit Post Notifier account. ' +
                      'Click Ok to relink with ' + userName + ' or click cancel to sign in to Reddit with the other account.',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok'
              }
        ).then(() => {
          this.databaseService.saveRedditUserName(userName);
        }, (dismiss) => {
          this.logoutReddit();
          this.linkWithReddit();
        });
      } else {
        this.databaseService.saveRedditUserName(userName);
      }
    });
  }
}
