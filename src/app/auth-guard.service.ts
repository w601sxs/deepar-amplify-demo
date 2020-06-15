import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Auth from '@aws-amplify/auth';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return Auth.currentAuthenticatedUser()
      .then(user => true)
      .catch(err => this.router.parseUrl('/login'));
   }
}