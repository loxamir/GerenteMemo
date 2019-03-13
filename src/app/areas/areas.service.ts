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
      this.pouchdbService.getView(
        'stock/Areas', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let areaList = [];
        this.pouchdbService.searchDocTypeDataField(
          'product', keyword, page, 'type', 'rural_area'
        ).then((areas: any[]) => {
          console.log("areas", areas);
          console.log("planneds", planneds);
          areas.forEach(area=>{
            area.balance = 0;
            // if (area._id.split('.')[1] == 'area'){
              let areaReport = planneds.filter(x => x.key[0]==area._id)[0]
              area.balance = areaReport && areaReport.value || 0;
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
