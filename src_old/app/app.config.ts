import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from '@ionic/angular';

@Injectable()
export class AppConfig {
    private database: string = "";

    constructor(
      public storage: Storage,
      public events: Events,
    ) {

    }

    public getDatabase() {
      return new Promise((resolve, reject) => {
        this.storage.get('database').then(database => {
          if (database){
            //console.log("getDatabase(get-database)");
            this.events.subscribe('get-user', (data) => {
              this.database = data['user'];
              resolve(data['user']);
            });
          } else {
            //console.log("getDatabase(demo)");
            this.database = "base";
            resolve("base");
          }
        });
      });
    }

    public setDatabase(database) {
      this.database = database;
    }

    public load() {
      //console.log("Inicio");
        return new Promise((resolve, reject) => {
          this.storage.get('database').then(data => {
            if (this.database){
              //console.log("found database", data);
              this.database = data;
            } else {
              this.database = "base";
            }
            resolve(data);
          })
        });
    }
}
