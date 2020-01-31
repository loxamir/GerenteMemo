import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class CropsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCrops(keyword, page){
    return new Promise((resolve, reject)=>{
      let cropList = [];
      this.pouchdbService.searchDocTypeData(
        'crop', keyword
      ).then((crops: any[]) => {
        console.log("safras", crops);
        crops.forEach((crop)=>{
          crop.production_cost = 10000;
        })
        resolve(crops);
      });
    });
  }


  deleteCrop(crop) {
    return this.pouchdbService.deleteDoc(crop);
  }
}
