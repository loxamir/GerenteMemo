import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, Events } from '@ionic/angular';
import { ProjectPage } from '../project';
import 'rxjs/Rx';
//import { ProjectsModel } from './projects.model';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'projects-page',
  templateUrl: 'projects.html'
})
export class ProjectsPage {
  projects: any;
  loading: any;
  select: boolean;
  searchTerm: string = '';
  page = 0;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public projectsService: ProjectsService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    this.events.subscribe('changed-project', (change)=>{
      this.projectsService.handleChange(this.projects, change);
    })
  }

  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    //console.log('Begin async operation');
    setTimeout(() => {
      this.projectsService.getProjects(this.searchTerm, this.page).then((projects: any[]) => {
        projects.forEach(project => {
          this.projects.push(project);
        });
        // this.projects = projects;
        this.page += 1;
      });
      //console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.projectsService.getProjects(this.searchTerm, 0).then((projects: any[]) => {
        this.projects = projects;
      });
      this.page = 1;
      refresher.complete();
    }, 200);
  }


  setFilteredItems() {
    this.projectsService.getProjects(this.searchTerm, 0).then((projects) => {
      this.projects = projects;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doRefreshList() {
    setTimeout(() => {
      this.projectsService.getProjects(this.searchTerm, 0).then((projects: any[]) => {
        this.projects = projects;
        this.page = 1;
      });
    }, 200);
  }

  selectProject(project) {
    //console.log("selectProject");
    if (this.select){
      this.navCtrl.pop().then(() => {
        this.events.publish('select-project', project);
      });
    } else {
      this.openProject(project);
    }
  }

  openProject(project) {
    this.events.subscribe('open-project', (data) => {
      this.events.unsubscribe('open-project');
      this.doRefreshList();
    })
    this.navCtrl.push(ProjectPage,{'_id': project._id});
  }

  createProject(){
    this.events.subscribe('create-project', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-project', data);
        });
      }
      this.events.unsubscribe('create-project');
      this.doRefreshList();
    })
    this.navCtrl.push(ProjectPage, {});
  }

  deleteProject(project){
    let index = this.projects.indexOf(project);
    this.projects.splice(index, 1);
    this.projectsService.deleteProject(project);
  }

}
