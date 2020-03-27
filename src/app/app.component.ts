import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PouchdbService } from './services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    // private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    public modalCtrl: ModalController,
    public pouchdbService: PouchdbService,
  ) {
    // this.initializeApp();
    this.backButtonListener();
  }

  // initializeApp() {
    // this.authService.init();
    // this.platform.ready().then(() => {
      // if (this.platform.is('cordova')){
      //   this.statusBar.show()
      //   this.statusBar.styleLightContent()
      //   this.statusBar.backgroundColorByHexString('#1652a0');
      //   // this.splashScreen.hide();
      // }
    // });
  // }

  backButtonListener(): void {
    window.onpopstate = async (evt) => {
      // Close any active modals or overlays
      const modal = await this.modalCtrl.getTop();
      if (modal) {
        await modal.dismiss();
      }
    }
  }
}
