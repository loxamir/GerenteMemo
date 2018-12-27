import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
  {
    title: 'Contactos',
    url: '/contact-list',
    icon: 'home'
  },
  {
    title: 'Productos',
    url: '/product-list',
    icon: 'cube'
  },
  {
    title: 'Ventas',
    url: '/sale-list',
    icon: 'pricetag'
  },
  {
    title: 'Home',
    url: '/tabs',
    icon: 'cart'
  }
];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    public translate: TranslateService,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.translate.setDefaultLang('es');
      // this.translate.use('es');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
