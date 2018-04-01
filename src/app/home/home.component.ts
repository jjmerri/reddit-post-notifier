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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private userName: string;
  private userId: string;

  constructor(private activatedRoute: ActivatedRoute, private oauthSerice: OauthService,
              private redditService: RedditService, private databaseService: DatabaseService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params['code']) {
        this.oauthSerice.requestAccessToken(params['code'], params['state']).subscribe(res => {
          if (res.success === true) {
            this.updateUserName();
          } else {
            console.error('error retrieving access token', res);
          }

        });
      }
    });

    this.authService.showLogin();
  }

  public linkWithReddit() {
    this.oauthSerice.requestPermission();
  }

  private updateUserName() {
    this.redditService.getUserDetails().subscribe(userDetailsResponse => {
        if (userDetailsResponse.name) {
          this.userName = userDetailsResponse.name;
          this.userId = userDetailsResponse.id;
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  private logout() {
    this.authService.logout();
    this.authService.showLogin();
  }

  public get userIsLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
