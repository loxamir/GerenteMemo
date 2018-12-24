import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CashMoveService } from '../cash-move.service';

@Injectable()
export class CashMoveListService {
  constructor(
    public pouchdbService: PouchdbService,
    public cashMoveService: CashMoveService,
  ) {}

  getCashMoveList(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
        'cash-move', keyword, page, "contact_name"
      ).then((data: any[]) => {
        resolve(data);
      }).catch((error) => {
        console.log("getCashMoveList Error:", error);
      });
    });
  }

  deleteCashMove(cashMove) {
    return this.pouchdbService.deleteDoc(cashMove);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
