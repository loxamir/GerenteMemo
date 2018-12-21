import { Component } from '@angular/core';
import { PopoverController, NavController } from '@ionic/angular';
//import { File } from '@ionic-native/file';
// import { HttpClient } from '@angular/common/http';
// import { FileChooser } from '@ionic-native/file-chooser';
// import { FilePath } from '@ionic-native/file-path';
// import { File } from '@ionic-native/file';
// import { AdvanceService } from '../advance.service';
import { ImporterPage } from '../../importer/importer';

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="importer()">Importar Advanceos</button>
    </ion-list>
  `
})
export class AdvancesPopover {
  public csvItems : any;

  constructor(
    public popoverController: PopoverController,
    // public fileChooser: FileChooser,
    // public filePath: FilePath,
    // public file: File,
    // public http: HttpClient,
    // public advanceService: AdvanceService,
    public navCtrl: NavController,
  ) {}


  importer(){
    this.popoverController.dismiss();
  }

}
