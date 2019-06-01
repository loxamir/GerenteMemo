import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable()
export class PersonsService {
  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getPersons(keyword, page){
    return new Promise((resolve, reject)=>{
        let personList = [];
        this.pouchdbService.searchDocTypeData(
          'contact', keyword, page
        ).then(async (persons: any[]) => {
          await this.formatService.asyncForEach(persons, async person=>{
            await this.pouchdbService.getViewInv(
              'Informes/ContactDiario', 3,
              [person._id+'z'],
              [person._id],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              person.lastActivity =  planneds[0] && planneds[0].value.replace('<br/>', ' ') || '';
              person.lastDate = planneds[0] && planneds[0].key[1] || null;
              personList.push(person);
          })
        });
        let self=this;
        let listOrdered= personList.sort(function(a, b) {
          return self.formatService.compareField(a, b, 'lastDate', 'decrease');
        })
        resolve(listOrdered);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deletePerson(person) {
    return this.pouchdbService.deleteDoc(person);
    //Have to delete all works created for it
  }
}
