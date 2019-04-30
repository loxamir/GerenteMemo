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
        let machineList = [];
        this.pouchdbService.searchDocTypeData(
          'machine', keyword, page
        ).then((machines: any[]) => {
          machines.forEach(machine=>{
            delete machine.image;
            if (machine._attachments && machine._attachments['avatar.png']){
              let image = machine._attachments['avatar.png'].data;
              machine.image = "data:image/png;base64,"+image;
            } else {
              machine.image = "./assets/icons/field.jpg";
            }

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
        resolve(machineList);
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
