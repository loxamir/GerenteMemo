import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Injectable()
export class AnimalsService {
  constructor(
    public pouchdbService: PouchdbService,
  ) {}

  getAnimals(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/Animals', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let animalList = [];
        this.pouchdbService.searchDocTypeDataField(
          'product', keyword, page, 'type', 'animal'
        ).then((animals: any[]) => {
          console.log("animals", animals);
          console.log("planneds", planneds);
          animals.forEach(animal=>{
            animal.balance = 0;
            // if (animal._id.split('.')[1] == 'animal'){
              let animalReport = planneds.filter(x => x.key[0]==animal._id)[0]
              animal.balance = animalReport && animalReport.value || 0;
              animalList.push(animal);
            // }
          })
          resolve(animalList);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Animals', 1,
      ['0'],
      ['z']
    ).then((animals: any[]) => {
      let animalDict = {}
      animals.forEach(item=>{
        animalDict[item.key[0]] = item.value;
      })
      list.forEach((animal, index)=>{
        if (
          change.doc.accountFrom_id == animal._id
          || change.doc.accountTo_id == animal._id
        ){
          animal.balance = animalDict[animal._id] || 0;
        }
      })
    });
  }

  deleteAnimal(animal) {
    return this.pouchdbService.deleteDoc(animal);
  }
}
