import { Injectable, NgZone } from '@angular/core';
import { Events, Platform } from '@ionic/angular';
import PouchDB1 from 'pouchdb';
import PouchdbFind from 'pouchdb-find';
declare var require: any;
import { HttpClient, HttpHeaders } from '@angular/common/http';
import PouchdbUpsert from 'pouchdb-upsert';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import { Storage } from '@ionic/storage';
import { FormatService } from '../format.service';
var server = "database.sistemamemo.com";

@Injectable({ providedIn: 'root' })
export class PouchdbService {
  db: any;
  remote: any;
  docTypes = {};
  username = undefined;

  constructor(
    public http: HttpClient,
    public zone: NgZone,
    public storage: Storage,
    public platform: Platform,
    public events: Events,
    public formatService: FormatService,
  ) {
    this.platform.ready().then(() => {
      this.getConnect();
    });
  }

  putSecurity(data){
    return new Promise(resolve => {
      this.http.put(
        'https://'+server+'/'+'demo'+'/_security',
        data,
        {
          headers: new HttpHeaders().set(
            'Authorization', "Basic " + btoa('demo' + ":" + 'demo123')
          )
        }
      ).subscribe(data => {
        console.log("changed Password", data);
        resolve(data);
      }, err => {
        resolve(err);
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
        this.username = username;
        this.storage.get("database").then(database => {
          if (! database){
            resolve(false);
            return;
          }
          let PouchDB: any = PouchDB1;
          PouchDB.plugin(PouchdbUpsert);
          PouchDB.plugin(PouchdbFind);
          // PouchDB.plugin(cordovaSqlitePlugin);
          // this.db = new PouchDB(database);
          // this.db = new PouchDB(database, { adapter: 'cordova-sqlite' });
          console.log("database", database);
          self.events.publish('got-database');
          this.storage.get('password').then(password => {
            this.db = new PouchDB("https://"+username+":"+password+"@"+server+'/'+database);
            // this.remote = "https://"+username+":"+password+"@"+server+'/'+database;
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

            setTimeout(function(){
              self.events.publish('end-sync');
            }, 1000);
            // this.db.sync(this.remote, options)
            // .on('change', function (info) {
            //   // handle change
            //   console.log("sync change", info);
            // }).on('paused', function (err) {
            //   console.log("sync paused", err);
            //   self.events.publish('end-sync');
            //   // replication paused (e.g. replication up to date, user went offline)
            // }).on('active', function () {
            //   console.log("sync activated");
            //   // replicate resumed (e.g. new changes replicating, user went back online)
            // }).on('denied', function (err) {
            //   console.log("sync no permissions", err);
            //   // a document failed to replicate (e.g. due to permissions)
            // }).on('complete', function (info) {
            //   console.log("sync complete", info);
            //   // handle complete
            // }).on('error', function (err) {
            //   console.log("sync other error", err);
            //   // handle error
            // });
          })
        });
      });
    });
  }

  async getUser(){
    let user = await this.getDoc('user.'+this.username);
    if (JSON.stringify(user)!='{}'){
      return user
    }
    return {
      "username": this.username,
      "useSale": true,
      "useService": true,
      "usePurchase": true,
      "useProduction": true,
      "useFinance": true,
      "contact_id": "contact.myCompany",
      "admin": true,
      "cash_id": "",
      "warehouse_id": "warehouse.physical.my"
    }
  }

  getDisConnect(){
    this.db.close();
    this.docTypes = {};
    this.events.publish('database-disconnect');
  }

  searchDocs(
    docType, keyword="", page=null, field=undefined, filter=undefined,
    sort='date', direction='decrease'
  ){
    let self = this;
    return new Promise(async (resolve, reject)=>{
      let selector = {
        // name: {$regex: "(?i)"+keyword},
        // code: {$regex: "(?i)"+keyword},
        docType: {$eq: docType}
      }

      let dad = {
        "$or": [
          {
              "name": {
                  $regex: "(?i)"+keyword
              }
          },
          {
              "code": {
                  $regex: "(?i)"+keyword
              }
          }
      ],
      "$and": [
        {docType: {$eq: docType}}
      ]}

      if (field) {
        let dict: any = {};
        dict[field] = {$regex: "(?i)"+keyword};
        dad['$or'].push(dict)
      }
      await this.db.createIndex({
        index: {fields: [sort]}
      })
      let newSort = {}
      if (direction == 'decrease'){
        newSort[sort] = 'desc';
      } else {
        newSort[sort] = 'asc';
      }
      console.log("dad", dad);
      self.db.find({
        selector: dad,
        sort: [newSort],
      }).then(data=>{
        console.log("data", data.docs);
        resolve(data.docs);
      });


      // let start = page*15;
      // let self = this;
      // let end = (page+1)*15;
      // if (page == null){
      //   start = undefined;
      //   end = undefined;
      // }
      // let docs = this.docTypes[docType].filter(
      //   word => filter && word[filter] || ! filter && true)
      // .filter(word => field && word[field]
      //   && word[field].toString().search(new RegExp(keyword, "i")) != -1
      //   || (word['name']
      //   && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
      //   || (word.code && word.code.toString().search(keyword) != -1))
      // .sort(function(a, b) {
      //   return self.formatService.compareField(a, b, sort, direction);
      // })
      // .slice(start, end);
      // console.log(docs)
      // resolve(docs);
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
    return new Promise(async (resolve, reject)=>{
      if (typeof doc_id === "string"){
        try {
          let test = await this.db.get(doc_id);
          resolve(test);
        } catch {
          resolve({})
        }
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
      list.forEach((item: any)=>{
        if (!item._id){
          item._id = item.docType+"."+this.getUUID();
        }
        let time = new Date().toJSON();
        item.create_user = this.username;
        item.create_time = time;
        item.write_user = this.username;
        item.write_time = time;
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
  }

  updateDocList(list){
    return new Promise((resolve, reject)=>{
      let time = new Date().toJSON();
      list.forEach((item: any)=>{
        item.write_user = this.username;
        item.write_time = time;
      })
      this.db.bulkDocs(list).then(createdDocs=>{
        resolve(createdDocs);
      })
    })
  }

  put(data){
    this.db.put(data);
  }

  createDoc(data){
    if (!data['_id']){
      data['_id'] = data['docType']+"."+this.getUUID();;
    }
    let time = new Date().toJSON();
    data.create_user = this.username;
    data.create_time = time;
    data.write_user = this.username;
    data.write_time = time;
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
      let time = new Date().toJSON();
      doc.write_user = this.username;
      doc.write_time = time;
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
        resolve(docList.filter(
          word => word[related] == id).sort(this.formatService.compare)
        );
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

  searchDocTypeData(
    docType, keyword="", page=null, field=null, filter=null, sort='date',
    direction='decrease'
  ) {
    return new Promise((resolve, reject)=>{
      let start = page*15;
      let end = (page+1)*15;
      if (page == null){
        start = undefined;
        end = undefined;
      }
      let self = this;
      // if (this.docTypes[docType]){
      //   let docs = this.docTypes[docType].filter(
      //     word => filter && word[filter] || ! filter && true)
      //   .filter(
      //     word => field && word[field]
      //     && word[field].toString().search(new RegExp(keyword, "i")) != -1
      //     || (word['name']
      //     && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
      //     || (word.code && word.code.toString().search(keyword) != -1))
      //   .sort(function(a, b) {
      //     return self.formatService.compareField(a, b, sort, direction);
      //   })
      //   .slice(start, end);
      //   resolve(docs);
      // } else {
        this.getDocType(docType).then((docList: any[])=>{
          // this.docTypes[docType] = docList;
          let docs = docList.filter(
            word => filter && word[filter] || ! filter && true)
          .filter(word => field && word[field]
            && word[field].toString().search(new RegExp(keyword, "i")) != -1
            || (word['name']
            && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
            || (word.code && word.code.toString().search(keyword) != -1))
          .sort(function(a, b) {
            return self.formatService.compareField(a, b, sort, direction);
          })
          .slice(start, end);
          resolve(docs);
        })
      // }
    });
  }

  searchDocTypeDataField(
    docType, keyword="", page=null, field=null, field_value="", sort='date',
    direction='decrease'
  ) {
    return new Promise((resolve, reject)=>{
      let self = this;
      let start = page*15;
      let end = (page+1)*15;
      if (page == null){
        start = undefined;
        end = undefined;
      }
      // if (this.docTypes[docType]){
      //   let docs = this.docTypes[docType].filter(
      //     word => field && word[field] == field_value)
      //   .filter(word => (word['name']
      //   && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
      //   || (word.code && word.code.toString().search(keyword) != -1))
      //   .sort(function(a, b) {
      //     return self.formatService.compareField(a, b, sort, direction);
      //   })
      //   .slice(start, end);
      //   resolve(docs);
      // } else {
        this.getDocType(docType).then((docList: any[])=>{
          // this.docTypes[docType] = docList;
          let docs = docList.filter(
            word => field && word[field] == field_value)
          .filter(word => (word['name']
          && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
          || (word.code && word.code.toString().search(keyword) != -1))
          .sort(function(a, b) {
            return self.formatService.compareField(a, b, sort, direction);
          })
          .slice(start, end);
          resolve(docs);
        })
      // }
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
    return new Promise((resolve, reject)=>{
      this.getDocType(docType).then((docList: any[])=>{
        let docs = docList.filter(
          word => filter && word[filter] || ! filter && true)
        .filter(word => field && word[field]
          && word[field].toString().search(new RegExp(keyword, "i")) != -1
        || (word['name']
        && word['name'].toString().search(new RegExp(keyword, "i")) != -1)
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
