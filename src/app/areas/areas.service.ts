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
          console.log("areas", areas);

          areas.forEach(area=>{
            this.pouchdbService.getView(
              'Informes/AreaDiario', 3,
              [area._id],
              [area._id+'z']
            ).then((planneds: any[]) => {
            console.log("planneds"+area.name, planneds);
            // area.balance = 0;
            // if (area._id.split('.')[1] == 'area'){
              // let areaReport = planneds.filter(x => x.key[0]==area._id)[0]
              // area.balance = areaReport && areaReport.value || 0;
              area.lastActivity = planneds[planneds.length-1].value.replace('<br/>', ' ');
              area.lastDate = planneds[planneds.length-1].key[1];
              areaList.push(area);
            // }
          })
          resolve(areaList);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Areas', 1,
      ['0'],
      ['z']
    ).then((areas: any[]) => {
      let areaDict = {}
      areas.forEach(item=>{
        areaDict[item.key[0]] = item.value;
      })
      list.forEach((area, index)=>{
        if (
          change.doc.accountFrom_id == area._id
          || change.doc.accountTo_id == area._id
        ){
          area.balance = areaDict[area._id] || 0;
        }
      })
    });
  }

  deleteArea(area) {
    return this.pouchdbService.deleteDoc(area);
  }
}
