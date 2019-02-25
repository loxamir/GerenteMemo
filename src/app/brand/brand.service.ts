
import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getBrand(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createBrand(brand){
    brand.docType = 'brand';
    return this.pouchdbService.createDoc(brand);
  }

  updateBrand(brand){
    brand.docType = 'brand';
    return this.pouchdbService.updateDoc(brand);
  }

  deleteBrand(brand){
    return this.pouchdbService.deleteDoc(brand);
  }
}
