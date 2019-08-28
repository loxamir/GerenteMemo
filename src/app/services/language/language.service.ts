import { Injectable } from "@angular/core";
import { LanguageModel } from "./language.model";
import { Storage } from '@ionic/storage';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages : Array<LanguageModel> = new Array<LanguageModel>();

   constructor(
     public storage: Storage,
   ) {
     this.languages.push(
       {name: "English", code: "en"},
       {name: "Español", code: "es"},
       {name: "Português", code: "pt"},
     );
   }

   getLanguages(){
     return this.languages;
   }

   async getDefaultLanguage(){
     return new Promise(async resolve => {
       let lenguage = await this.storage.get("language");
       if (!lenguage){
         lenguage = navigator.language.split('-')[0];
       }
       resolve(lenguage);
     })
   }
 }
