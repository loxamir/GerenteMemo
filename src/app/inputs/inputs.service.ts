import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class InputsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getInputs(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/Inputs', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let inputList = [];
        this.pouchdbService.searchDocTypeDataField(
          'product', keyword, page, 'type', 'product'
        ).then((inputs: any[]) => {
          console.log("inputs", inputs);
          console.log("planneds", planneds);
          inputs.forEach(input=>{
            input.balance = 0;
            // if (input._id.split('.')[1] == 'input'){
              let inputReport = planneds.filter(x => x.key[0]==input._id)[0]
              input.balance = inputReport && inputReport.value || 0;
              inputList.push(input);
            // }
          })
          resolve(inputList);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Inputs', 1,
      ['0'],
      ['z']
    ).then((inputs: any[]) => {
      let inputDict = {}
      inputs.forEach(item=>{
        inputDict[item.key[0]] = item.value;
      })
      list.forEach((input, index)=>{
        if (
          change.doc.accountFrom_id == input._id
          || change.doc.accountTo_id == input._id
        ){
          input.balance = inputDict[input._id] || 0;
        }
      })
    });
  }

  deleteInput(input) {
    return this.pouchdbService.deleteDoc(input);
  }
}
