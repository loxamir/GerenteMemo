import { Injectable } from '@angular/core';
import { RestProvider } from '../services/rest/rest';

@Injectable({
  providedIn: 'root'
})
export class ProcessListService {

  constructor(
    public restProvider: RestProvider,
  ) {

  }

  getProcess(){
    return new Promise(resolve => {
      this.restProvider.getProcess().then((process: any[]) => {
        console.log("got process service", process);
        resolve(process);
      });
    });
  }
}
