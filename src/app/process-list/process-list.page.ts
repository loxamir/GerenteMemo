import { Component, OnInit } from '@angular/core';
import { ProcessListService } from './process-list.service';
import { NavController, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.page.html',
  styleUrls: ['./process-list.page.scss'],
})
export class ProcessListPage implements OnInit {
  processList: any;
  loading: any;
  page = 0;
  select:any;

  constructor(
    public processListService: ProcessListService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public events: Events,
  ) { }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.startFilteredItems();
  }

  startFilteredItems() {
    this.processListService.getProcess().then((process) => {
      this.processList = process;
      this.page = 0;
      this.loading.dismiss();
    });
  }

  selectProcess(process) {
    // if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-process', process);
      // });
    // }
  }

}
