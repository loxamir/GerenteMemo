
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

  async getCategory(doc_id): Promise<any> {
    let category: any = await this.pouchdbService.getDoc(doc_id, true);
    return category;
  }

  async createCategory(viewData, blob){
    let category = Object.assign({}, viewData);
    category.docType = 'category';
    if (blob) {
      category._attachments = {
        'avatar.png': {
          type: 'image/jpeg',
          data: blob
        }
      };
    }
    return this.pouchdbService.createDoc(category);
  }

  async updateCategory(viewData, blob){
    let category = Object.assign({}, viewData);
    category.docType = 'category';
    if (blob) {
      await this.pouchdbService.attachFile(category._id, 'avatar.png', blob);
      let data: any = await this.pouchdbService.getDoc(category._id);
      let attachments = data._attachments;
      category._attachments = attachments;
    }
    return this.pouchdbService.updateDoc(category);
  }

  deleteCategory(category){
    return this.pouchdbService.deleteDoc(category);
  }
}
