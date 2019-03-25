
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

    constructor(
      private router: Router,
      public storage: Storage,
      private authService: AuthService,
    ) {

    }

    canActivate(route: ActivatedRouteSnapshot): boolean {

        console.log(route);
        //
        // let authInfo = {
        //     authenticated: false
        // };
        // this.storage.get("username")
        // if (!authInfo.authenticated) {
        //     this.router.navigate(['login']);
        //     return false;
        // }
        let result = this.authService.isAuthenticated();
        console.log("result", result);
        if(result){
          console.log("true");
          return true;
        } else {
          console.log("false");
          this.router.navigate(['login']);
          return false;
        }
        // return true;

    }

}
