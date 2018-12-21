import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class CropsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCrops(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/Crops', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let cropList = [];
        this.pouchdbService.searchDocTypeData(
          'project', keyword
        ).then((crops: any[]) => {
          console.log("projects", crops);
          console.log("planneds", planneds);
          crops.forEach(crop=>{
            crop.balance = 0;
            // if (crop._id.split('.')[1] == 'crop'){
              let cropReport = planneds.filter(x => x.key[0]==crop._id)[0]
              crop.balance = cropReport && cropReport.value || 0;
              cropList.push(crop);
            // }
          })
          resolve(cropList);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Crops', 1,
      ['0'],
      ['z']
    ).then((crops: any[]) => {
      let cropDict = {}
      crops.forEach(item=>{
        cropDict[item.key[0]] = item.value;
      })
      list.forEach((crop, index)=>{
        if (
          change.doc.accountFrom_id == crop._id
          || change.doc.accountTo_id == crop._id
        ){
          crop.balance = cropDict[crop._id] || 0;
        }
      })
    });
  }

  deleteCrop(crop) {
    return this.pouchdbService.deleteDoc(crop);
  }
}
