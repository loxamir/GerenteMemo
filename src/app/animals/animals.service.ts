import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { FormatService } from '../services/format.service';

@Injectable()
export class AnimalsService {
  constructor(
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
  ) {}

  getAnimals(keyword, page){
    return new Promise((resolve, reject)=>{
        let animalList = [];
        this.pouchdbService.searchDocTypeData(
          'animal', keyword, page
        ).then(async (animals: any[]) => {
          await this.formatService.asyncForEach(animals, async animal=>{
            await this.pouchdbService.getViewInv(
              'Informes/AnimalDiario', 3,
              [animal._id+'z'],
              [animal._id],
              true,
              true,
              1
            ).then((planneds: any[]) => {
              animal.lastActivity =  planneds[0] && planneds[0].value.replace('<br/>', ' ') || '';
              animal.lastDate = planneds[0] && planneds[0].key[1] || null;
              animalList.push(animal);
          })
        });
        let self=this;
        let listOrdered= animalList.sort(function(a, b) {
          return self.formatService.compareField(a, b, 'lastDate', 'decrease');
        })
        resolve(listOrdered);
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  deleteAnimal(animal) {
    return this.pouchdbService.deleteDoc(animal);
    //Have to delete all works created for it
  }
}
