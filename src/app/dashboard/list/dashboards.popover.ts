import { Component } from '@angular/core';
import { ViewController, NavController } from '@ionic/angular';
//import { File } from '@ionic-native/file';
// import { HttpClient } from '@angular/common/http';
// import { FileChooser } from '@ionic-native/file-chooser';
// import { FilePath } from '@ionic-native/file-path';
// import { File } from '@ionic-native/file';
// import { DashboardService } from '../dashboard.service';
import { ImporterPage } from '../../importer/importer';

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="importer()">Importar Dashboardos</button>
    </ion-list>
  `
})
export class DashboardsPopover {
  public csvItems : any;

  constructor(
    public viewCtrl: ViewController,
    // public fileChooser: FileChooser,
    // public filePath: FilePath,
    // public file: File,
    // public http: HttpClient,
    // public dashboardService: DashboardService,
    public navCtrl: NavController,
  ) {}


  importer(){
    this.navCtrl.push(ImporterPage, {'docType': 'dashboard'});
    this.viewCtrl.dismiss();
  }

}
