import { Injectable } from '@angular/core';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CloseService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) { }

  async getClose(doc_id): Promise<any> {
    return new Promise(async (resolve, reject)=>{
      let close:any = await this.pouchdbService.getDoc(doc_id);
      close.accountMoves = await this.pouchdbService.getList(close.accountMoves);
      let moveList = [];
      close.accountMoves.forEach((accountMove: any) => {
        moveList.push(accountMove.doc);
      })
      close.accountMoves = moveList;
      resolve(close);
    })
  }

  createClose(close){
    return new Promise((resolve, reject)=>{
      close.docType = 'close';
      this.pouchdbService.createDoc(close).then(doc => {
        resolve({doc: doc, close: close});
      });
    });
  }
}
