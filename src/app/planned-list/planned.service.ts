import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Injectable({
  providedIn: 'root'
})
export class PlannedService {

  constructor(
    public pouchdbService: PouchdbService,
  ) { }


  getContactPlannedList(contact_id, keyword) {
    return new Promise((resolve, reject) => {
      this.pouchdbService.getView(
        'stock/A Cobrar', 3,
        [contact_id, '0', '0'],
        [contact_id, 'z', 'z']
      ).then((planneds: any[]) => {
        let promise_ids = []
        planneds.forEach(item => {
          item.name = item.key[1];
        })
        let agrupado = this.groupByName(planneds, 'name', 'value');
        let pts = [];
        planneds.forEach(item => {
          if (agrupado[item.name].value != 0) {
            if (agrupado[item.name].list.length == 1) {
              pts.push(item);
              promise_ids.push(this.pouchdbService.getDoc(item.key[2]));
            } else if (item.value > 0) {
              // REMOVED BECOUSE ITS CHANGING VALUES and giving problems
              // item.value = agrupado[item.name].value;
              pts.push(item);
              promise_ids.push(this.pouchdbService.getDoc(item.key[2]));
            }
          }
        })
        promise_ids.push(this.pouchdbService.getDoc(contact_id));
        Promise.all(promise_ids).then(contacts => {
          let prom_ids = [];
          for (let i = 0; i < pts.length; i++) {
            pts[i].doc = contacts[i];
            pts[i].contact = contacts[contacts.length - 1];
            prom_ids.push(this.pouchdbService.getDoc(contacts[i].accountFrom_id));
          }
          Promise.all(prom_ids).then(accounts => {
            for (let i = 0; i < pts.length; i++) {
              pts[i].doc.accountFrom = accounts[i];
            }
            let receivables = pts.filter(word => word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1);
            resolve(receivables);
          });
        })
      });
    });
  }

  getContactPayableList(contact_id, keyword) {
    return new Promise((resolve, reject) => {
      this.pouchdbService.getView(
        'stock/A Pagar', 3,
        [contact_id, '0', '0'],
        [contact_id, 'z', 'z']
      ).then((planneds: any[]) => {
        let promise_ids = []
        planneds.forEach(item => {
          item.name = item.key[1];
        })
        let agrupado = this.groupByName(planneds, 'name', 'value');
        let pts = [];
        planneds.forEach(item => {
          if (agrupado[item.name].value != 0) {
            if (agrupado[item.name].list.length == 1) {
              pts.push(item);
              promise_ids.push(this.pouchdbService.getDoc(item.key[2]));
            } else if (item.value > 0) {
              item.value = agrupado[item.name].value;
              pts.push(item);
              promise_ids.push(this.pouchdbService.getDoc(item.key[2]));
            }
          }
        })
        promise_ids.push(this.pouchdbService.getDoc(contact_id));
        Promise.all(promise_ids).then(contacts => {
          let prom_ids = [];
          for (let i = 0; i < pts.length; i++) {
            pts[i].doc = contacts[i];
            pts[i].contact = contacts[contacts.length - 1];
            prom_ids.push(this.pouchdbService.getDoc(contacts[i].accountTo_id));
          }
          Promise.all(prom_ids).then(accounts => {
            for (let i = 0; i < pts.length; i++) {
              pts[i].doc.accountTo = accounts[i];
            }
            let payables = pts.filter(word => word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1);
            resolve(payables);
          });
        })
      });
    });
  }

  getReceivables(keyword) {
    return new Promise((resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getView(
        'stock/A Cobrar', 1
      ).then((planneds: any[]) => {
        // console.log("planneds", planneds);
        let promise_ids = [];
        let pts = [];
        planneds.forEach(item => {
          pts.push(item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[0]));
        })
        Promise.all(promise_ids).then(contacts => {
          for (let i = 0; i < pts.length; i++) {
            pts[i].doc = contacts[i];
            pts[i].contact = contacts[i];
            pts[i].contact_name = contacts[i].name;
          }
          let receivables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
          resolve(receivables);
        })
      });
    });
  }

  getPayables(keyword) {
    return new Promise((resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getView(
        'stock/A Pagar', 1
      ).then((planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        planneds.forEach(item => {
          pts.push(item);
          // console.log("ites", item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[0]));
        })
        Promise.all(promise_ids).then(contacts => {
          for (let i = 0; i < pts.length; i++) {
            pts[i].doc = contacts[i];
            pts[i].contact = contacts[i];
            pts[i].contact_name = contacts[i].name;
          }
          let payables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
          resolve(payables)
        })
      });
    });
  }

  groupByName(object, prop, sum) {
    return object.reduce(function(lines, item) {
      const val = item[prop]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
      if (item.signal == "-") {
        lines[val][sum] -= parseFloat(item[sum])
      } else {
        lines[val][sum] += parseFloat(item[sum])
      }

      lines[val]['list'] = lines[val]['list'] || []
      lines[val]['list'].push(item)
      return lines
    }, {})
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
