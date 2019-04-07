import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';
// import { ReceiptsPage } from '../../../receipt/list/receipts';
// import { CashListPage } from '../../../cash/list/cash-list';
import { CashMoveService } from '../cash-move/cash-move.service';
// import { FileChooser } from '@ionic-native/file-chooser';
// import { FilePath } from '@ionic-native/file-path';
// import { File } from '@ionic-native/file/ngx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
// import { ImporterPage } from '../importer/importer.page';

@Component({
  template: `
    <ion-list>
      <ion-item class="popover-item" (click)="importer()">Importar</ion-item>
    </ion-list>
  `
})
export class CashMoveListPopover {
  public csvItems : any;
  pop: PopoverController;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public fileChooser: FileChooser,
    // public filePath: FilePath,
    // public file: File,
    public cashMoveService: CashMoveService,
    public pouchdbService: PouchdbService,
    public events: Events,
  ) {
    this.pop = navParams.get('popoverController');
  }

  importer(){
    // this.navCtrl.navigateForward([ImporterPage, {'docType': 'cash-move'}]);
    // this.viewCtrl.dismiss();
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/importer', {'docType': 'cash-move'}]);
  }
}
