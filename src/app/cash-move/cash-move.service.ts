import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
import { FormatService } from '../services/format.service';

@Injectable({
  providedIn: 'root'
})
export class CashMoveService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    public formatService: FormatService,
  ) {}

  getCashMove(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc(doc_id).then((pouchData: any) => {
        let getList = [
          pouchData['contact_id'],
          pouchData['accountFrom_id'],
          pouchData['accountTo_id'],
          pouchData['currency_id'],
          pouchData['check_id'],
        ];
        this.pouchdbService.getList(getList).then((docs: any[])=>{
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc;
          })
          pouchData.contact = doc_dict[pouchData.contact_id] || {};
          pouchData.accountFrom = doc_dict[pouchData.accountFrom_id] || {};
          pouchData.accountTo = doc_dict[pouchData.accountTo_id] || {};
          pouchData.currency = doc_dict[pouchData.currency_id] || {};
          pouchData.check = doc_dict[pouchData.check_id] || {};
          resolve(pouchData);
        })
      });
    });
  }

  async createCashMove(viewData){
    let cash = Object.assign({}, viewData);
    cash.amount = cash.amount || 0;
    cash.docType = 'cash-move';
    if (viewData.accountTo_id.split(".")[1] == 'receivable'){
      cash.amount_residual = parseFloat(cash.amount);
      if (! cash.payments){
        cash.payments = [];
      }
      if (! cash.amount_unInvoiced){
        cash.amount_unInvoiced = cash.amount;
      }
      if (! cash.invoices){
        cash.invoices = [];
      }
      cash.amount_residual = parseFloat(cash.amount);
    } else if (viewData.accountFrom_id.split(".")[1] == 'payable'){
      cash.amount_residual = parseFloat(cash.amount);
      if (! cash.payments){
        cash.payments = [];
      }
      if (! cash.amount_unInvoiced){
        cash.amount_unInvoiced = cash.amount;
      }
      if (! cash.invoices){
        cash.invoices = [];
      }
    } else {
      delete cash.amount_residual;
      delete cash.payments;
    }
    let docs: any = await this.pouchdbService.getList([
      cash.accountFrom_id,
      cash.accountTo_id,
      cash.contact_id,
    ]);
    let docDict = {}
    docs.forEach(item=>{
      docDict[item.id] = item;
    })
    console.log("docs", docDict);
    console.log("cash", cash);

    if (cash.contact){
      cash.contact_name = cash.contact.name;
    } else {
      if (!cash.contact_id){
        cash.contact_id = 'contact.unknown';
      }
      cash.contact_name = docDict[cash.contact_id].doc.name;
    }
    if (cash.accountFrom){
      cash.accountFrom_name = cash.accountFrom.name;
    } else {
      console.log("docDict[cash.accountFrom_id]", docDict[cash.accountFrom_id])
      cash.accountFrom_name = docDict[cash.accountFrom_id].doc.name;
    }
    if (cash.accountTo){
      cash.accountTo_name = cash.accountTo.name;
    } else {
      cash.accountTo_name = docDict[cash.accountTo_id].doc.name;
    }
    return new Promise((resolve, reject)=>{
      // this.configService.getSequence('cash_move').then((code) => {
        // cash['code'] = code;
        // cash['code'] = this.formatService.string_pad(4, code, "right", "0");
        if (!cash.origin_id){
          cash.origin_id = "M"+Date.now();
        }
        cash.amount = parseFloat(cash.amount);
        delete cash.cash;
        delete cash.contact;
        delete cash.project;
        delete cash.accountTo;
        delete cash.accountFrom;
        cash.currency_id = cash.currency && cash.currency._id || cash.currency_id || {};
        cash.check_id = cash.check && cash.check._id || cash.check_id || {};
        delete cash.currency;
        delete cash.check;
        return this.pouchdbService.createDoc(cash).then((data: any) => {
          cash.id = data.id;
          resolve(cash);
        })
      // });
    });
  }

  async updateCashMove(viewData){
    let cash = Object.assign({}, viewData);
    cash.docType = 'cash-move';
    cash.amount = parseFloat(cash.amount);
    if (viewData.accountTo_id.split(".")[1] == 'receivable'){
      cash.amount_residual = parseFloat(cash.amount);
      if (! cash.payments){
        cash.payments = [];
      }
      if (! cash.amount_unInvoiced){
        cash.amount_unInvoiced = cash.amount;
      }
      if (! cash.invoices){
        cash.invoices = [];
      }
    } else if (viewData.accountFrom_id.split(".")[1] == 'payable'){
      cash.amount_residual = parseFloat(cash.amount);
      if (! cash.payments){
        cash.payments = [];
      }
      if (! cash.amount_unInvoiced){
        cash.amount_unInvoiced = cash.amount;
      }
      if (! cash.invoices){
        cash.invoices = [];
      }
    } else {
      delete cash.amount_residual;
      delete cash.payments;
    }



    let docs = await this.pouchdbService.getList([
      cash.accountFrom_id,
      cash.accountTo_id,
      cash.contact_id,
    ]);
    if (cash.contact){
      cash.contact_name = cash.contact.name;
    } else {
      if (!cash.contact_id){
        cash.contact_id = 'contact.unknown';
      }
      cash.contact_name = docs[2].doc.name;
    }
    if (cash.accountFrom){
      cash.accountFrom_name = cash.accountFrom.name;
    } else {
      cash.accountFrom_name = docs[0].doc.name;
    }
    if (cash.accountTo){
      cash.accountTo_name = cash.accountTo.name;
    } else {
      cash.accountTo_name = docs[1].doc.name;
    }


    delete cash.cash;
    delete cash.contact;
    delete cash.project;
    delete cash.accountTo;
    delete cash.accountFrom;
    cash.currency_id = cash.currency && cash.currency._id || cash.currency_id || {};
    cash.check_id = cash.check && cash.check._id || cash.check_id || {};
    delete cash.currency;
    delete cash.check;
    // if (!cash.contact_id){
    //   cash.contact_id = 'contact.unknown';
    // }
    return this.pouchdbService.updateDoc(cash);
  }

  deleteCashMove(cash){
    return this.pouchdbService.deleteDoc(cash);
  }

}
