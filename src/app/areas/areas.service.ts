import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class AreasService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getAreas(keyword, page){
    return new Promise((resolve, reject)=>{
        let areaList = [];
        this.pouchdbService.searchDocTypeData(
          'area', keyword, page
        ).then((areas: any[]) => {
          areas.forEach(area=>{
            delete area.image;
            if (area._attachments && area._attachments['avatar.png']){
              let image = area._attachments['avatar.png'].data;
              area.image = "data:image/png;base64,"+image;
            } else {
              area.image = "./assets/icons/field.jpg";
            }
            this.pouchdbService.getView(
              'Informes/AreaDiario', 3,
              [area._id],
              [area._id+'z'],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              area.lastActivity =  planneds[0] && planneds[0].value.replace('<br/>', ' ') || '';
              area.lastDate = planneds[0] && planneds[0].key[1] || null;
              areaList.push(area);
          })
        });
        resolve(areaList);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteArea(area) {
    return this.pouchdbService.deleteDoc(area);
    //Have to delete all works created for it
  }
}
