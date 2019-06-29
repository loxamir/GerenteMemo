import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable()
export class InputsService {
  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getInputs(keyword, page){
    return new Promise((resolve, reject)=>{
        let inputList = [];
        this.pouchdbService.searchDocTypeData(
          'product', keyword, page
        ).then(async (inputs: any[]) => {
          await this.formatService.asyncForEach(inputs, async input=>{
            await this.pouchdbService.getViewInv(
              'Informes/InputDiario', 3,
              [input._id+'z'],
              [input._id],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              input.lastActivity =  planneds[0] && planneds[0].value.replace('<br/>', ' ') || '';
              input.lastDate = planneds[0] && planneds[0].key[1] || null;
              inputList.push(input);
          })
        });
        let self=this;
        let listOrdered= inputList.sort(function(a, b) {
          return self.formatService.compareField(a, b, 'lastDate', 'decrease');
        })
        resolve(listOrdered);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteInput(input) {
    return this.pouchdbService.deleteDoc(input);
    //Have to delete all works created for it
  }
}
