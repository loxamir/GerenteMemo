import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  user = {};
  loading: any;

  constructor(public pouchdbService: PouchdbService,
  public loadingCtrl: LoadingController,){
  }

  async ngOnInit(){
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser());
    console.log("this.user", this.user);
    this.loading.dismiss();
  }
}
