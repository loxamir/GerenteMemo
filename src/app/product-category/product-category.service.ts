
import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {

  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCategory(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createCategory(category){
    category.docType = 'category';
    return this.pouchdbService.createDoc(category);
  }

  updateCategory(category){
    category.docType = 'category';
    return this.pouchdbService.updateDoc(category);
  }

  deleteCategory(category){
    return this.pouchdbService.deleteDoc(category);
  }
}
