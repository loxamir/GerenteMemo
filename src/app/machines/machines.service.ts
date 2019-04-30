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
          console.log("machines", machines);

          machines.forEach(machine=>{
            delete machine.image;
            if (machine._attachments && machine._attachments['avatar.png']){
              console.log("machineaasdf", machine);
              let image = machine._attachments['avatar.png'].data;
              // console.log("image", image);
              // this.firstFileToBase64(image).then((result: string) => {
              //   machine.image = result;
              // });
              machine.image = "data:image/png;base64,"+image;
            } else {
              machine.image = "./assets/icons/field.jpg";
            }

            this.pouchdbService.getView(
              'Informes/MachineDiario', 3,
              [machine._id],
              [machine._id+'z']
            ).then((planneds: any[]) => {
            console.log("planneds"+machine.name, planneds);
            // machine.balance = 0;
            // if (machine._id.split('.')[1] == 'machine'){
              // let machineReport = planneds.filter(x => x.key[0]==machine._id)[0]
              // machine.balance = machineReport && machineReport.value || 0;
              machine.lastActivity =  planneds[planneds.length-1] && planneds[planneds.length-1].value.replace('<br/>', ' ') || '';
              machine.lastDate = planneds[planneds.length-1] && planneds[planneds.length-1].key[1] || null;
              machineList.push(machine);
            // }
          })
        });
        resolve(machineList);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  private firstFileToBase64(fileImage): Promise<{}> {
    return new Promise((resolve, reject) => {
      let fileReader: FileReader = new FileReader();
      if (fileReader && fileImage != null) {
        fileReader.readAsDataURL(fileImage);
        fileReader.onload = () => {
          resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject(new Error('No file found'));
      }
    });
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
