import { Component, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Auth, Hub } from 'aws-amplify';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'INVISTA ML Demo';
  loggedIn = false;

  constructor(private router: Router, private ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);

    Auth.currentAuthenticatedUser().then(user => this.loggedIn = true);
    Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log(`Hub event: ${JSON.stringify(event)}`);
      switch (event) {
        case 'signIn':
          console.log('Hub: signIn');
          this.loggedIn = true;
          this.ngZone.run(() => this.router.navigate(['']));
          break;
        case 'signOut':
          console.log('Hub: signOut');
          this.loggedIn = false;
          break;
      }
    });
  }

  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);

  fillerContent = Array.from({length: 50}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  private mobileQueryListener: () => void;

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  signOut() {
    Auth.signOut();
    this.router.navigate(['']);
  }

}
