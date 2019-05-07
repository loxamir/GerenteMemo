import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
// import { DashboardPage } from '../dashboard/dashboard.page';
import 'rxjs/Rx';
import { DashboardsService } from './dashboard-list.service';
// import { DashboardsPopover } from './dashboards.popover';
import { File } from '@ionic-native/file';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.page.html',
  styleUrls: ['./dashboard-list.page.scss'],
})
export class DashboardListPage implements OnInit {
  @ViewChild('searchBar') myInput;
  dashboards: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';
  supplier: any = false;
  seller: any = false;
  employee: any = false;
  customer: any = true;

  constructor(
    public navCtrl: NavController,
    public dashboardsService: DashboardsService,
    public loadingCtrl: LoadingController,

    public modal: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
    public file: File,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.supplier = this.route.snapshot.paramMap.get('supplier')|| false;
    this.seller = this.route.snapshot.paramMap.get('seller')|| false;
    this.employee = this.route.snapshot.paramMap.get('employee')|| false;
    this.customer = this.route.snapshot.paramMap.get('customer')|| false;
    this.events.subscribe('changed-dashboard', (change)=>{
      this.dashboardsService.handleChange(this.dashboards, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.dashboardsService.searchItems(this.searchTerm, 0).then((sales) => {
      console.log("dashboards", sales);
      this.dashboards = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.dashboardsService.getDashboardsPage(this.searchTerm, 0, filter).then((dashboards: any[]) => {
      this.dashboards = dashboards;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.dashboardsService.getDashboardsPage(this.searchTerm, this.page).then((dashboards: any[]) => {
        dashboards.forEach(dashboard => {
          this.dashboards.push(dashboard);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.dashboardsService.getDashboardsPage(this.searchTerm, 0).then((dashboards: any[]) => {
        if (this.filter == 'all'){
          this.dashboards = dashboards;
        }
        else if (this.filter == 'seller'){
          this.dashboards = dashboards.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.dashboards = dashboards.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.dashboards = dashboards.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.dashboards = dashboards.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(DashboardsPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openDashboard(dashboard) {
    this.events.subscribe('open-dashboard', (data) => {
      this.events.unsubscribe('open-dashboard');
    })
    if (this.select){
      this.navCtrl.navigateForward(['/dashboard', {'_id': dashboard._id}]);
    } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // newRootNav.push(DashboardPage, {'_id': dashboard._id});
      this.navCtrl.navigateForward(['/dashboard', {'_id': dashboard._id}]);
    }
  }

  selectDashboard(dashboard) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-dashboard', dashboard);
      // });
    } else {
      this.openDashboard(dashboard);
    }
  }

  createDashboard(){
    this.events.subscribe('create-dashboard', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-dashboard', data);
        // });
      }
      this.events.unsubscribe('create-dashboard');
    })
    if (this.select){
      this.navCtrl.navigateForward(['/dashboard', {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      }]);
    } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      this.navCtrl.navigateForward(['/dashboard', {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      }]);
    }
  }

  deleteDashboard(dashboard){
    let index = this.dashboards.indexOf(dashboard)
    this.dashboards.splice(index, 1);
    this.dashboardsService.deleteDashboard(dashboard);
  }

}
