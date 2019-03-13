import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable()
export class MachinesService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getMachines(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/Machines', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let machineList = [];
        this.pouchdbService.searchDocTypeDataField(
          'product', keyword, page, 'type', 'machine'
        ).then((machines: any[]) => {
          console.log("machines", machines);
          console.log("planneds", planneds);
          machines.forEach(machine=>{
            machine.balance = 0;
            // if (machine._id.split('.')[1] == 'machine'){
              let machineReport = planneds.filter(x => x.key[0]==machine._id)[0]
              machine.balance = machineReport && machineReport.value || 0;
              machineList.push(machine);
            // }
          })
          resolve(machineList);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Machines', 1,
      ['0'],
      ['z']
    ).then((machines: any[]) => {
      let machineDict = {}
      machines.forEach(item=>{
        machineDict[item.key[0]] = item.value;
      })
      list.forEach((machine, index)=>{
        if (
          change.doc.accountFrom_id == machine._id
          || change.doc.accountTo_id == machine._id
        ){
          machine.balance = machineDict[machine._id] || 0;
        }
      })
    });
  }

  deleteMachine(machine) {
    return this.pouchdbService.deleteDoc(machine);
  }
}
