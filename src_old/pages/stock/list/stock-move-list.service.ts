import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { StockMoveService } from '../stock-move.service';

@Injectable()
export class StockMoveListService {
  constructor(
    public http: Http,
    public pouchdbService: PouchdbService,
    public stockMoveService: StockMoveService,
  ) {}

  getStockMoveList(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
        'stock-move', keyword, page, "contact_name"
      ).then((data: any[]) => {
        resolve(data);
      }).catch((error) => {
        console.log("getStockMoveList Error:", error);
      });
    });
  }

  deleteStockMove(stockMove) {
    return this.pouchdbService.deleteDoc(stockMove);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
