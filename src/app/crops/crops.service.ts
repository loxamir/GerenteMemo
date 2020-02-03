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
      ).then(async (crops: any[]) => {
        let cropCost:any = await this.pouchdbService.getViewInv(
          'Informes/cropReport', 1,
          ['z'],
          ['0'],
          true,
          true,
        );
        let cropYield:any = await this.pouchdbService.getViewInv(
          'Informes/cropYield', 1,
          ['z'],
          ['0'],
          true,
          true,
        );
        crops.forEach((crop)=>{
          let cost = cropCost.filter(it=>crop._id == it.key[0])
          crop.production_cost = cost[0] && cost[0].value || 0;
          let Yield = cropYield.filter(it=>crop._id == it.key[0])
          crop.yieldTotal = Yield[0] && Yield[0].value || 0;
        })
        resolve(crops);
      });
    });
  }


  deleteCrop(crop) {
    return this.pouchdbService.deleteDoc(crop);
  }
}
