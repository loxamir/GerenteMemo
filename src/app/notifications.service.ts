import {Injectable} from '@angular/core';
import {firebase} from '@firebase/app';
import '@firebase/messaging';
import { environment } from '../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
init(): Promise<void> {
    console.log("init");
    return new Promise<void>((resolve, reject) => {
        console.log("serviceWorker notready");
        navigator.serviceWorker.ready.then((registration) => {
          console.log("serviceWorker ready");
            // Don't crash an error if messaging not supported
            if (!firebase.messaging.isSupported()) {
                console.log("Sin Soporte1");
                   resolve();
                   return;
            }

            const messaging = firebase.messaging();

            // Register the Service Worker
            messaging.useServiceWorker(registration);

            // Initialize your VAPI key
            messaging.usePublicVapidKey(
              environment.firebase.vapidKey
            );

            // Optional and not covered in the article
            // Listen to messages when your app is in the foreground
            messaging.onMessage((payload) => {
                console.log(payload);
            });
            // Optional and not covered in the article
            // Handle token refresh
            messaging.onTokenRefresh(() => {
                console.log("refresh");
                messaging.getToken().then(
                (refreshedToken: string) => {
                    console.log(refreshedToken);
                }).catch((err) => {
                    console.error(err);
                });
            });

            resolve();
        }, (err) => {
            reject(err);
        });
    });
  }

  requestPermission(): Promise<void> {
    console.log("requestPermission");
    return new Promise<void>(async (resolve) => {
        if (!Notification) {
            console.log("Sin Notification");
            resolve();
            return;
        }
        if (!firebase.messaging.isSupported()) {
            console.log("Sin Soporte");
            resolve();
            return;
        }
        try {
            console.log("try");
            const messaging = firebase.messaging();
            await messaging.requestPermission();

            const token: string = await messaging.getToken();

            console.log('User notifications token:', token);
        } catch (err) {
          console.log("errou", err);
            // No notifications granted
        }

        resolve();
    });
  }
}
