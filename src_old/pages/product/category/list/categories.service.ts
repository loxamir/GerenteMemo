import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class CategoriesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getCategories(keyword, page){
    return this.pouchdbService.searchDocTypeData('category', keyword, page);
  }

  deleteCategory(category) {
    return this.pouchdbService.deleteDoc(category);
  }
}
