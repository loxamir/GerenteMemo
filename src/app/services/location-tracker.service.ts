import { Injectable, NgZone } from '@angular/core';
// import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation/ngx";
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
declare var google;

@Injectable({
  providedIn: 'root'
})
export class LocationTrackerService {
  positionSubscription: Subscription;

  public watch: any;
  // public lat: number = 0;
  // public lng: number = 0;

  constructor(
    public zone: NgZone,
    public geolocation: Geolocation,
    public backgroundGeolocation: BackgroundGeolocation,
  ) {

  }

  startTracking(pageThis, field, currentMapTrack, map) {
    field.push([]);
    // Background Tracking
    let config = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true,
      stopOnTerminate: false,
      interval: 2000
    };

    this.backgroundGeolocation.configure(config).then(() => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe((location: BackgroundGeolocationResponse) => {
          console.log("background", location);
          this.zone.run(() => {
            // this.lat = location.latitude;
            // this.lng = location.longitude;
            field[field.length - 1].push({ lat: location.latitude, lng: location.longitude, date: new Date().toISOString() });
            pageThis.redrawPath(field[field.length - 1]);
            pageThis.cleanSave();
          });

          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        });
    }, (err) => {
      console.log("err1", err);
    });



    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
      // Foreground Tracking
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
      console.log("foreground", position);
      // Run update inside of Angular's zone
      this.zone.run(() => {
        // this.lat = position.coords.latitude;
        // this.lng = position.coords.longitude;
        field[field.length - 1].push({ lat: position.coords.latitude, lng: position.coords.longitude, date: new Date().toISOString() });
        pageThis.redrawPath(field[field.length - 1]);
        pageThis.cleanSave();
      });
    });
  }


  stopTracking() {
    // listedRoutes = Object.assign([], field);
    console.log('stopTracking');
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
    // currentMapTrack.setMap(null);
  }

}
