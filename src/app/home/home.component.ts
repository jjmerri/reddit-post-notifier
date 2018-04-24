import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { FormControl, FormGroup, Validators, EmailValidator } from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {AngularFireDatabase, AngularFireList} from 'angularfire2/database';

import 'rxjs/Rx';
import * as jQuery from 'jQuery';

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
  private accountInfoForm: FormGroup;
  private subredditPreferences = {emailNotification: false};
  private globalPreferences = {email: null};
  private selectedSubreddit = 'edc_raffle';
  private subreddits = ['edc_raffle', 'KnifeRaffle', 'lego_raffles', 'raffleTest', 'testingground4bots'];

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

    jQuery('.alert').hide();

    this.accountInfoForm = new FormGroup({
      emailAddress: new FormControl(this.globalPreferences.email, [Validators.required, Validators.email])
    });

    this.authService.showLogin();

    const unsubscribe = this.authService.setAuthStateChangeCallback(user => {
      if (user) {
        this.loadSubredditPreferences('edc_raffle');
        this.loadUserPreferences();
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
    this.databaseService.saveSubredditPreferences(this.subredditPreferences, this.selectedSubreddit);
  }

  private updateGlobalPreferences() {
    this.databaseService.saveGlobalPreferences(this.globalPreferences).then(
      () => {
        jQuery('#success-alert').fadeTo(3000, 500).slideUp(500, function(){
          jQuery('#success-alert').slideUp(500);
        });
      },
      reason => {
        jQuery('#error-alert').fadeTo(3000, 500).slideUp(500, function(){
          jQuery('#error-alert').slideUp(500);
        });
      }
    );
  }

  private loadSubredditPreferences(subreddit) {
    this.databaseService.getPreferences(subreddit).then(snapshot => {
      const preferences = snapshot.val();
      if (preferences) {
        this.subredditPreferences = preferences;
      } else {
        this.subredditPreferences = {emailNotification: false};
      }
    });
  }

  private loadUserPreferences() {
    this.databaseService.getGlobalPreferences().then(snapshot => {
      const preferences = snapshot.val();
      if (preferences && preferences.email) {
        this.globalPreferences = preferences;
      } else {
        this.globalPreferences = {email: this.authService.getUserEmail()};
        this.databaseService.saveGlobalPreferences(this.globalPreferences);
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

  get emailAddress() { return this.accountInfoForm.get('emailAddress'); }
}
