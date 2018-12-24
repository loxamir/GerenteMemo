import { Component } from '@angular/core';
import {  } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Learn Ionic</ion-button>
      <button ion-item (click)="close()">Documentation</ion-button>
      <button ion-item (click)="close()">Showcase</ion-button>
      <button ion-item (click)="close()">GitHub Repo</ion-button>
    </ion-list>
  `
})
export class InvoicesPopover {
  constructor(public viewCtrl: ) {}

  close() {
    // this.viewCtrl.dismiss();
  }
}
