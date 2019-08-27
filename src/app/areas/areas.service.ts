import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable()
export class AreasService {
  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getAreas(keyword, page){
    return new Promise((resolve, reject)=>{
        let areaList = [];
        this.pouchdbService.searchDocTypeData(
          'area', keyword, page
        ).then(async (areas: any[]) => {
          let today = new Date().toISOString().split("T")[0];
          await this.formatService.asyncForEach(areas, async area=>{
            await this.pouchdbService.getViewInv(
              'Informes/AreaDiario', 3,
              [area._id, today],
              [area._id, "0"],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              area.lastActivity =  planneds[0] && planneds[0].value || '';
              area.lastDate = planneds[0] && planneds[0].key[1] || null;
              areaList.push(area);
          })
        });
        let self=this;
        let listOrdered= areaList.sort(function(a, b) {
          return self.formatService.compareField(a, b, 'lastDate', 'decrease');
        })
        resolve(listOrdered);
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
