import { Component } from '@angular/core';
import {  } from '@ionic/angular';
//import { File } from '@ionic-native/file';
import { HttpClient } from '@angular/common/http';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { AccountCategoryService } from '../accountCategory.service';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Options</ion-list-header>
      <button ion-item (click)="importAccountCategorys()">Importar AccountCategoryos</ion-button>
    </ion-list>
  `
})
export class AccountCategorysPopover {
  public csvItems : any;

  constructor(
    
    public fileChooser: FileChooser,
    public filePath: FilePath,
    public file: File,
    public http: HttpClient,
    public accountCategoryService: AccountCategoryService,
) {}


  importAccountCategorys(accountCategory) {
    this.fileChooser.open()
      .then(uri => {
        this.filePath.resolveNativePath(uri)
          .then(filePath => {
            let tmppath = filePath.split("/");
            let file = filePath.split("/")[tmppath.length-1];
            let path = filePath.split(file)[0];
            //console.log("file", file);
            //console.log("path", path);
            this.file.readAsText(path, file).then(data => {
              var csv = this.parseCSVFile(data);
              let count = 0
              csv.forEach(item => {
                count += 1;
                //console.log("item", JSON.stringify(item));
                this.accountCategoryService.createAccountCategory(item);
              })
            }).catch(err => {
              //console.log('Directory doesnt exist', JSON.stringify(err));
            });
          })
          .catch(err => console.log(JSON.stringify(err)));

      })
      .catch(e => console.log(JSON.stringify(e)));
      // this.viewCtrl.dismiss();
  }

  parseCSVFile(str)
  {

     var arr  = [],
         row,
         col,
         c,
         quote   = false;  // true means we're inside a quoted field

     // iterate over each character, keep track of current row and column (of the returned array)
     for (row = col = c = 0; c < str.length; c++)
     {
        var cc = str[c],
            nc = str[c+1];        // current character, next character

        arr[row]           = arr[row] || [];
        arr[row][col]  = arr[row][col] || '';

        /* If the current character is a quotation mark, and we're inside a
      quoted field, and the next character is also a quotation mark,
      add a quotation mark to the current column and skip the next character
        */
        if (cc == '"' && quote && nc == '"')
        {
           arr[row][col] += cc;
           ++c;
           continue;
        }


        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"')
        {
           quote = !quote;
           continue;
        }


        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote)
        {
           ++col;
           continue;
        }


        /* If it's a newline and we're not in a quoted field, move on to the next
           row and move to column 0 of that new row */
        if (cc == '\n' && !quote)
        {
           ++row;
           col = 0;
           continue;
        }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
     }
     return this.formatParsedObject(arr, true);
  }



  formatParsedObject(arr, hasTitles)
  {
     let _id,
         name,
         document,
        // cost,
         obj = [];

     for(var j = 0; j < arr.length; j++)
     {
        var items         = arr[j];

         if(hasTitles === true && j === 0)
         {
            _id = items[0];
            name = items[1];
            document = items[2];
            //cost          = items[3];
         }
         else
         {
            obj.push({
               _id: items[0],
               name: items[1],
               document: items[2],
               //cost         : items[3]
            });
         }

     }
     return obj;
  }
}
