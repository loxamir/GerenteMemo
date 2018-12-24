import { Component } from '@angular/core';
import {  NavController } from '@ionic/angular';
//import { File } from '@ionic-native/file';
// import { HttpClient } from '@angular/common/http';
// import { FileChooser } from '@ionic-native/file-chooser';
// import { FilePath } from '@ionic-native/file-path';
// import { File } from '@ionic-native/file';
// import { ContactService } from '../contact.service';
import { ImporterPage } from '../../importer/importer';

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="importer()">Importar Contactos</ion-button>
    </ion-list>
  `
})
export class ContactsPopover {
  public csvItems : any;

  constructor(
    
    // public fileChooser: FileChooser,
    // public filePath: FilePath,
    // public file: File,
    // public http: HttpClient,
    // public contactService: ContactService,
    public navCtrl: NavController,
  ) {}


  importer(){
    this.navCtrl.navigateForward(ImporterPage, {'docType': 'contact'});
    // this.viewCtrl.dismiss();
  }

}
