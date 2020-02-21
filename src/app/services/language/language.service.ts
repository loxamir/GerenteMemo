import { Injectable } from "@angular/core";
import { LanguageModel } from "./language.model";

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages : Array<LanguageModel> = new Array<LanguageModel>();

   constructor() {
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
       resolve(navigator.language.split('-')[0]);
     })
   }
 }
