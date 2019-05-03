import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable()
export class MachinesService {
  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getMachines(keyword, page){
    return new Promise((resolve, reject)=>{
        let machineList = [];
        this.pouchdbService.searchDocTypeData(
          'machine', keyword, page
        ).then((machines: any[]) => {
          machines.forEach(machine=>{
            this.pouchdbService.getViewInv(
              'Informes/MachineDiario', 3,
              [machine._id+'z'],
              [machine._id],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              machine.lastActivity =  planneds[0] && planneds[0].value.replace('<br/>', ' ') || '';
              machine.lastDate = planneds[0] && planneds[0].key[1] || null;
              machineList.push(machine);
          })
        });
        let self=this;
        let listOrdered= machineList.sort(function(a, b) {
          return self.formatService.compareField(a, b, 'lastDate', 'decrease');
        })
        resolve(listOrdered);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteMachine(machine) {
    return this.pouchdbService.deleteDoc(machine);
  }
}
