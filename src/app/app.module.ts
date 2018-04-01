import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {RedditService} from './reddit/services/reddit.service';
import {OauthService} from './oauth/services/oauth.service';
import {DatabaseService} from './database/services/database.service';


import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthService } from './auth/services/auth.service';

import {routing} from './app.routes';

import {HomeModule} from './home/home.module';

import {AppComponent} from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    HomeModule,
    AngularFireModule.initializeApp(environment.firebase, 'reddit-post-notifier'),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [OauthService, RedditService, DatabaseService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
