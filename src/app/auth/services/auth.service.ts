import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';


import * as firebaseui from 'firebaseui';

@Injectable()
export class AuthService {
  private uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        return false;
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: environment.redirectUri,
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: false
      }
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.NONE
  };

  private ui;

  constructor(private _firebaseAuth: AngularFireAuth, private router: Router) {
    firebase.initializeApp(environment.firebase);
    this.ui = new firebaseui.auth.AuthUI(firebase.auth());
  }

  public showLogin() {
    this.ui.start('#firebaseui-auth-container', this.uiConfig);
  }

  public logout() {
    firebase.auth().signOut().then(function () {
    }, function (error) {
      alert('Failed to logout. try again later');
    });
  }

  public isLoggedIn() {
    if (firebase.auth().currentUser == null) {
      return false;
    } else {
      return true;
    }
  }
}
