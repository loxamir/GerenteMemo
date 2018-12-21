import { Component } from '@angular/core';
import { ViewController, NavController, Events } from '@ionic/angular';
import { ReceiptsPage } from '../../../receipt/list/receipts';
import { CashListPage } from '../../../cash/list/cash-list';
import { CashMoveService } from '../cash-move.service';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { PouchdbService } from '../../../services/pouchdb/pouchdb-service';
import { ImporterPage } from '../../../importer/importer';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="importer()">Importar</button>
    </ion-list>
  `
})
export class CashMoveListPopover {
  public csvItems : any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public fileChooser: FileChooser,
    public filePath: FilePath,
    public file: File,
    public cashMoveService: CashMoveService,
    public pouchdbService: PouchdbService,
    public events: Events,
  ) {}

  importer(){
    this.navCtrl.push(ImporterPage, {'docType': 'cash-move'});
    this.viewCtrl.dismiss();
  }
}
