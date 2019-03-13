import { Component, OnInit } from '@angular/core';
import { NavController,  LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { AnimalPage } from '../animal/animal.page';

import 'rxjs/Rx';
import { AnimalsService } from './animals.service';
// import { AnimalsPopover } from './animals.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { AnimalService } from '../animal/animal.service';
import { WorkService } from '../work/work.service';
import { ProductPage } from '../product/product.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-animals',
  templateUrl: './animals.page.html',
  styleUrls: ['./animals.page.scss'],
})
export class AnimalsPage implements OnInit {
  animals: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    // public app: App,
    public animalsService: AnimalsService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public animalService: AnimalService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.animalsService.handleViewChange(this.animals, change);
    })
    this.events.subscribe('changed-product', (change)=>{
      // this.animalsService.handleChange(this.animals, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.animalsService.getAnimals(
        this.searchTerm, this.page
      ).then((animals: any[]) => {
        animals.forEach(animal => {
          this.animals.push(animal);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }


  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.animalsService.getAnimals(
      this.searchTerm, 0
    ).then((animals) => {
      this.animals = animals;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(AnimalsPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openAnimal(animal) {
    this.events.subscribe('open-animal', (data) => {
      this.events.unsubscribe('open-animal');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(AnimalPage, {'_id': animal._id});
    this.navCtrl.navigateForward(['/animal', {'_id': animal._id}]);
  }

  selectAnimal(animal) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-animal', animal);
      // });
    } else {
      this.openAnimal(animal);
    }
  }

  createAnimal() {
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ProductPage, {'type': 'animal'});
    this.navCtrl.navigateForward(['/product', {'type': 'animal'}]);
  }

  async setInitialBalance(animal){
    // let self = this;
    let prompt = await this.alertCtrl.create({
      // title: 'Balance del Caja',
      message: 'Cuanto dinero tenes en la Caja '+animal.name+'?',
      inputs: [
        {
          type: 'number',
          name: 'balance',
          value: "0"
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Confirmar',
          handler: data => {
            this.workService.createWork({
              "amount": data.balance,
              "name": "Saldo Inicial",
              "date": new Date().toJSON(),
              "accountFrom_id": "account.other.open",
              "contact_id": 'contact.myCompany',
              "accountTo_id": animal._id,
              'signal': '+',
              "origin_id": animal._id
            });
          }
        }
      ],
    });
    prompt.present();
  }

  deleteAnimal(animal){
    let index = this.animals.indexOf(animal);
    if (animal.balance == 0){
      this.animals.splice(index, 1);
      this.animalsService.deleteAnimal(animal);
    }
  }

}
