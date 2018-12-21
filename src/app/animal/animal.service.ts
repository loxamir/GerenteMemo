import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigService } from '../config/config.service';
// import { AnimalMoveService } from './move/animal-move.service';

@Injectable()
export class AnimalService {

  constructor(
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
    // public animalMoveService: AnimalMoveService,
  ) {}


  getAnimal(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Animals', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          pts.push(item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
          balance += parseFloat(item.value);
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(animalMoves => {
          let animal = Object.assign({}, animalMoves[animalMoves.length-1]);
          animal.moves = [];
          animal.balance = balance;
          animal.account = animalMoves[animalMoves.length-1];
          animal.name
          for(let i=0;i<pts.length;i++){
            animal.moves.unshift(animalMoves[i]);
          }
          resolve(animal);
        })
      });
    });
  }

  createAnimal(animal){
    animal.docType = 'account';
    delete animal.moves;
    delete animal.animal;
    return new Promise((resolve, reject)=>{
      if (animal.code && animal.code != ''){
        this.pouchdbService.createDoc(animal).then(doc => {
          if (animal.type == 'liquidity'){
            animal._id = "account.animal."+animal.code;
          }
          resolve({doc: doc, animal: animal});
        });
      } else {
        this.configService.getSequence('account').then((code) => {
          animal['code'] = code;
          if (animal.type == 'liquidity'){
            animal._id = "account.animal."+code;
          }
          this.pouchdbService.createDoc(animal).then(doc => {
            resolve({doc: doc, animal: animal});
          });
        });
      }

    });
  }

  getDefaultAnimal(){
    return new Promise((resolve, reject)=>{
      this.configService.getConfigDoc().then(config => {
        this.pouchdbService.getDoc(config.animal_id).then(default_animal => {
          resolve(default_animal);
        })
      });
    });
  }

  updateAnimal(animal){
    animal.docType = 'account';
    delete animal.moves;
    delete animal.animal;
    return this.pouchdbService.updateDoc(animal);
  }

  deleteAnimal(animal){
    return this.pouchdbService.deleteDoc(animal);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }
}
