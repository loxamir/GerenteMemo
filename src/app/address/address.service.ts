import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {}

  getAddress(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createAddress(address){
    return new Promise((resolve, reject)=>{
      address.docType = 'address';
      // if (address.code != ''){
      //   // console.log("sin code", address.code);
      //   this.pouchdbService.createDoc(address).then(doc => {
      //     resolve({doc: doc, address: address});
      //   });
      // } else {
        // this.configService.getSequence('address').then((code) => {
          // address['code'] = code;
          this.pouchdbService.createDoc(address).then(doc => {
            resolve({doc: doc, address: address});
          });
        // });
      // }
    });
  }

  updateAddress(address){
    address.docType = 'address';
    return this.pouchdbService.updateDoc(address);
  }

  deleteAddress(address){
    return this.pouchdbService.deleteDoc(address);
  }
}
