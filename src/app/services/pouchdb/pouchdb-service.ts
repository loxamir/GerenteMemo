import { Injectable, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import PouchDB1 from 'pouchdb';
// import PouchDBFind from 'pouchdb-find';
declare var require: any;
declare var Buffer: any;
import { HttpClient, HttpHeaders } from '@angular/common/http';
import PouchdbUpsert from 'pouchdb-upsert';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import { Storage } from '@ionic/storage';
// import { AppConfig } from '../../app/app.config';
import { FormatService } from '../format.service';
// import * from 'pouchdb-quick-search';
// import * as PouchQuickSearch from 'pouchdb-quick-search';

var server = "couchdb.sistema.social";
var port = "5984";

@Injectable({ providedIn: 'root' })
export class PouchdbService {
  db: any;
  remote: any;
  // database = "demo";
  // username = "demo";
  sequences = {
    "sale": 3001,
    "cash-move": 3001,
    "stock-move": 3001,
    "invoice": 3001,
    "receipt": 3001,
    "service": 3001,
    "warehouse": 3001,
    "product": 3001,
    "contact": 3001,
    "account": 3001,
    "payment-condition": 3001,
    "purchase": 3001,
    "category": 3001,
    "accountCategory": 3001,
  }
  docTypes = {};

  constructor(
    public http: HttpClient,
    public zone: NgZone,
    public storage: Storage,
    // public appConfig: AppConfig,
    public events: Events,
    public formatService: FormatService,
  ) {
    this.getConnect();
    this.events.subscribe('end-sync', () => {
      this.getDoc('config.profile').then((config: any)=>{
        this.sequences = {
          "sale": parseInt(config.sale_sequence),
          "cash-move": parseInt(config.cash_move_sequence),
          "stock-move": parseInt(config.stock_move_sequence),
          "invoice": parseInt(config.invoice_sequence),
          "receipt": parseInt(config.receipt_sequence),
          "service": parseInt(config.service_sequence),
          "warehouse": parseInt(config.warehouse_sequence),
          "product": parseInt(config.product_sequence),
          "contact": parseInt(config.contact_sequence),
          "account": parseInt(config.account_sequence),
          "payment-condition": parseInt(config.payment_condition_sequence),
          "purchase": parseInt(config.purchase_sequence),
          "category": parseInt(config.category_sequence),
          "accountCategory": parseInt(config.accountCategory_sequence),
        }
      })
    })
    // });
  }

  putSecurity(data){
    return new Promise(resolve => {
      this.http.put(
        'https://couchdb.sistema.social/'+'demo'+'/_security',
        data,
        {
          // headers: new HttpHeaders().set('Authorization', "Basic YWRtaW46YWp2MTQzOXM=")
          headers: new HttpHeaders().set('Authorization', "Basic " + new Buffer('demo' + ":" + 'demo123').toString("base64"))
        }
      ).subscribe(data => {
        console.log("changed Password", data);
        resolve(data);
      }, err => {
        resolve(err);
        // console.log("erro", err);
      });
    });
  }


  getConnect(){
    let self = this;
    return new Promise((resolve, reject)=>{
      this.storage.get("username").then(username => {
        console.log("username", username);
        if (! username){
          resolve(false);
          return;
        }
        this.storage.get("database").then(database => {
          if (! database){
            resolve(false);
            return;
          }
          let PouchDB: any = PouchDB1;
          PouchDB.plugin(PouchdbUpsert);
          PouchDB.plugin(cordovaSqlitePlugin);
          // this.db = new PouchDB(database);
          this.db = new PouchDB(database, { adapter: 'cordova-sqlite' });
          console.log("database", database);
          self.events.publish('got-database');
          this.storage.get('password').then(password => {
            // resolve(true);
            console.log("password", password);
            this.remote = "https://"+username+":"+password+"@"+server+'/'+database;
            let options = {
              live: true,
              retry: true
            };

            this.db.changes({
              live: true,
              since: 'now',
              include_docs: true
            }).on('change', (change) => {
              console.log("changed", change);
              this.handleChangeData(change);
            }).on('complete', function(info) {
              //console.log("have info", info);
            }).on('error', function (err) {
              console.log(err);
              // resolve(false)
            });

            this.db.sync(this.remote, options)
            .on('change', function (info) {
              // handle change
              console.log("sync change", info);
            }).on('paused', function (err) {
              console.log("sync paused", err);
              self.events.publish('end-sync');
              // replication paused (e.g. replication up to date, user went offline)
            }).on('active', function () {
              console.log("sync activated");
              // replicate resumed (e.g. new changes replicating, user went back online)
            }).on('denied', function (err) {
              console.log("sync no permissions", err);
              // a document failed to replicate (e.g. due to permissions)
            }).on('complete', function (info) {
              console.log("sync complete", info);
              // handle complete
            }).on('error', function (err) {
              console.log("sync other error", err);
              // handle error
            });
          })
        });
      });
    });
  }

  getDisConnect(){
    this.db.close();
    this.docTypes = {};
    this.events.publish('database-disconnect');
  }

  searchDocs(docType, keyword="", page=null, field=undefined, filter=undefined){
    return new Promise((resolve, reject)=>{
      let start = page*15;
      let end = (page+1)*15;
      if (page == null){
        start = undefined;
        end = undefined;
      }

      let docs = this.docTypes[docType].filter(word => filter && word[filter] || ! filter && true)
      .filter(word => field && word[field] && word[field].toString().search(new RegExp(keyword, "i")) != -1
      || (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
      || (word.code && word.code.toString().search(keyword) != -1))
      .sort(this.formatService.compare)
      .slice(start, end);
      console.log(docs)
      resolve(docs);
    });
  }


  getView(
    viewName,
    level=undefined,
    startkey=undefined,
    endkey=undefined,
    reduce=true,
    group=true,
    limit=undefined,
    skip=undefined,
    include_docs=false,
    keys=undefined
  ){
    return new Promise((resolve, reject)=>{
      let options = {
        'reduce': reduce,
        'group': group,
        'group_level':level,
        'startkey': startkey,
        'endkey': endkey,
        'limit': limit,
        'skip': skip,
        'include_docs': include_docs,
        'keys': keys,
      }
      this.db.query(viewName, options).then(function (res) {
        resolve(res.rows);
      }).catch(function (err) {
        console.log("error", err);
      });
    });
  }

  getDoc(doc_id) {
    return new Promise((resolve, reject)=>{
      // console.log("doc:id", doc_id );
      // console.log("typeof", typeof doc_id);
      if (typeof doc_id === "string"){
        resolve(this.db.get(doc_id));
      } else {
        resolve({})
      }
    })
  }

  getUUID(){
    const uuidv4 = require('uuid/v4');
    return uuidv4();
  }

  createDocList(list){
    return new Promise((resolve, reject)=>{
      let returns = [];
      let processedList = [];
      let docTypeDict = {};
      list.forEach((item: any)=>{
        if (docTypeDict[item.docType]){
          docTypeDict[item.docType].push(item);
        }
        else {
          docTypeDict[item.docType] = [item];
        }
      })
      this.db.get("config.profile").then((config: any)=>{
        let sequenceDict = {}
        Object.keys(docTypeDict).forEach(key=>{
          let docTypeSequence = key.replace("-", "_")+"_sequence";
          sequenceDict[key] = parseFloat(config[docTypeSequence]);
          config[docTypeSequence] = parseFloat(config[docTypeSequence]) + docTypeDict[key].length;
        })
        this.db.put(config);

        list.forEach((item: any)=>{
          // let random: string = Math.random().toString(32).slice(11);
          // item.code = this.formatService.string_pad(4, sequenceDict[item.docType], "right", "0")+"-"+random;
          item.code = this.getUUID();
          item._id = item.docType+"."+item.code
          sequenceDict[item.docType] += 1;
          if (item._return){
            delete item._return;
            returns.push(item);
          }
          processedList.push(item);
        })
        this.db.bulkDocs(processedList).then(createdDocs=>{
          resolve(returns);
        })
      })
    })
  }

  updateDocList(list){
    return new Promise((resolve, reject)=>{
      // let returns = [];
      // let processedList = [];
      // let docTypeDict = {};
      // list.forEach((item: any)=>{
      //   if (docTypeDict[item.docType]){
      //     docTypeDict[item.docType].push(item);
      //   }
      //   else {
      //     docTypeDict[item.docType] = [item];
      //   }
      // })
      console.log("list", list);
      this.db.bulkDocs(list).then(createdDocs=>{
        console.log("createdDocs", createdDocs);
        resolve(createdDocs);
      })
    })
  }

  put(data){
    this.db.put(data);
  }

  createDoc(data){
    // let random: string = Math.random().toString(36).slice(11);
    if (!data['_id']){
      let code = this.getUUID();
      // if (!data['code']){
      //   code = this.getUUID();
      // } else {
      //   code = data['code'];
      // }
      if (!data['code']){
        data['code'] = code;
      }
      data['_id'] = data['docType']+"."+code;
      this.sequences[data.docType] += 1;
    } else {
      console.log("data com id", data);
    }
    return new Promise((resolve, reject)=>{
      this.db.put(data).then(res=>{
        resolve(res);
      }).catch(function (err) {
        console.log("erro creating", err);
      });
    })
  }

  updateDoc(doc){
    return new Promise((resolve, reject)=>{
      // delete doc._rev;
      // this.db.put(doc).then(data=>{
      //   console.log('dadadada', data);
      //   resolve(data);
      // }).catch(function (err) {
      //   console.log("arrrrr", err)
      // });
      this.db.upsert(doc._id, function () {
        return doc;
      }).then(function (res) {
        resolve(res);
      }).catch(function (err) {
      });
    });
  }

  deleteDoc(doc){
    this.db.remove(doc).catch((err) => {
      console.log("Delete error", err);
    });
  }

  getRelated(docType, related, id): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.getDocType(docType).then((docList: any[])=>{
        resolve(docList.filter(word => word[related] == id).sort(this.formatService.compare));
      })
    });
  }

  getDocType(docType) {
    return new Promise((resolve, reject)=>{
      let self = this;
        this.db.allDocs({
          include_docs : true,
          startkey: docType+".",
          endkey: docType+".z",
        }).then((res) => {
          // console.log("getDocType", res);
          let docs = [];
          res.rows.forEach(row=>{
            docs.push(row.doc);
          })
          resolve(docs);

        }).catch((err) => {
          reject(err);
        })
    });
  }

  getList(list) {
    return new Promise((resolve, reject)=>{
      // let self = this;
        this.db.allDocs({
          include_docs : true,
          keys: list
        }).then((res) => {
          resolve(res.rows);
        }).catch((err) => {
          reject(err);
        })
    });
  }

  getIntervalList(startkey, endkey) {
    return new Promise((resolve, reject)=>{
      // let self = this;
        this.db.allDocs({
          include_docs : true,
          startkey: startkey,
          endkey: endkey,
        }).then((res) => {
          resolve(res.rows);
        }).catch((err) => {
          reject(err);
        })
    });
  }

  searchDocTypeData(docType, keyword="", page=null, field=null, filter=null) {
    return new Promise((resolve, reject)=>{
      let start = page*15;
      let end = (page+1)*15;
      if (page == null){
        start = undefined;
        end = undefined;
      }
      if (this.docTypes[docType]){
        let docs = this.docTypes[docType].filter(word => filter && word[filter] || ! filter && true)
        .filter(word => field && word[field] && word[field].toString().search(new RegExp(keyword, "i")) != -1
        || (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
        || (word.code && word.code.toString().search(keyword) != -1))
        .sort(this.formatService.compare)
        .slice(start, end);
        resolve(docs);
      } else {
        this.getDocType(docType).then((docList: any[])=>{
          this.docTypes[docType] = docList;
          let docs = this.docTypes[docType].filter(word => filter && word[filter] || ! filter && true)
          .filter(word => field && word[field] && word[field].toString().search(new RegExp(keyword, "i")) != -1
          || (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
          || (word.code && word.code.toString().search(keyword) != -1))
          .sort(this.formatService.compare)
          .slice(start, end);
          resolve(docs);
        })
      }
    });
  }

  searchDocTypeDataField(docType, keyword="", page=null, field=null, field_value="") {
    return new Promise((resolve, reject)=>{
      let start = page*15;
      let end = (page+1)*15;
      if (page == null){
        start = undefined;
        end = undefined;
      }
      if (this.docTypes[docType]){
        let docs = this.docTypes[docType].filter(word => field && word[field] == field_value)
        .filter(word => (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
        || (word.code && word.code.toString().search(keyword) != -1))
        .sort(this.formatService.compare)
        .slice(start, end);
        resolve(docs);
      } else {
        this.getDocType(docType).then((docList: any[])=>{
          this.docTypes[docType] = docList;
          let docs = this.docTypes[docType].filter(word => field && word[field] == field_value)
          .filter(word => (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
          || (word.code && word.code.toString().search(keyword) != -1))
          .sort(this.formatService.compare)
          .slice(start, end);
          resolve(docs);
        })
      }
    });
  }

  searchDocField(docType, keyword="", field="name") {
    return new Promise((resolve, reject)=>{
      this.getDocType(docType).then((docList: any[])=>{
        let docs = docList.filter(word => word[field] == keyword)
        .sort(this.formatService.compare)
        resolve(docs);
      })
    });
  }

  searchDocTypeAllData(docType, keyword="", page=null, field=null, filter=null) {
    // console.log("dadossss", docType, keyword, page, field, filter);
    return new Promise((resolve, reject)=>{
      this.getDocType(docType).then((docList: any[])=>{
        let docs = docList.filter(word => filter && word[filter] || ! filter && true)
        .filter(word => field && word[field] && word[field].toString().search(new RegExp(keyword, "i")) != -1
        || (word['name'] && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
        || (word.code && word.code.toString().search(keyword) != -1))
        .sort(this.formatService.compare);
        resolve(docs);
      })
    });
  }



  handleChangeData(change){
    let docType=change.id.split('.')[0];
    let docTypesChangedDoc = null;
    let docTypesChangedIndex = null;

    if (this.docTypes[docType]){
      this.docTypes[docType].forEach((doc, index) => {
        if(doc._id === change.id){
          docTypesChangedDoc = doc;
          docTypesChangedIndex = index;
        }
      });
    }

    let self = this;
    this.zone.run(() => {
      //A document was deleted
      if(change.deleted){
        if (this.docTypes[docType]){
          self.docTypes[docType].splice(docTypesChangedIndex, 1);
        }
      }
      else {
        //A document was updated
        if(docTypesChangedDoc){
          if (this.docTypes[docType]){
            this.docTypes[docType][docTypesChangedIndex] = change.doc;
          }
        }
        //A document was added
        else {
          if (this.docTypes[docType]){
            this.docTypes[docType].unshift(change.doc);
          }
        }
      }
      this.events.publish('changed-'+docType, change);
    });
  }

  localHandleChangeData(list, change){
    let changedDoc = null;
    let changedIndex = null;

    list.forEach((doc, index) => {
      if(doc._id === change.id){
        changedDoc = doc;
        changedIndex = index;
      }
    });

    //A document was deleted
    if(change.deleted){
      list.splice(changedIndex, 1);
    }
    else {
      //A document was updated
      if(changedDoc){
        list[changedIndex] = change.doc;
      }
      //A document was added
      else {
        list.unshift(change.doc);
      }
    }
  }
}
