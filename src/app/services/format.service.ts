import { Injectable } from "@angular/core";
import { File } from '@ionic-native/file';
let file = new File();

@Injectable({ providedIn: 'root' })
export class FormatService {

  string_pad(qty, user_str, order="left", complete=" "){
      if (!user_str){
          user_str = "";
      }
      user_str = user_str.toString()
      while(user_str.length<qty){
          if (order == "left"){
              user_str = user_str + complete;
          } else {
              user_str = complete + user_str;
          }
      }
      return user_str;
  }

   Unidades(num){

      switch(num)
      {
          case 1: return "UN";
          case 2: return "DOS";
          case 3: return "TRES";
          case 4: return "CUATRO";
          case 5: return "CINCO";
          case 6: return "SEIS";
          case 7: return "SIETE";
          case 8: return "OCHO";
          case 9: return "NUEVE";
      }

      return "";
  }//Unidades()

   Decenas(num){

      let decena = Math.floor(num/10);
      let unidad = num - (decena * 10);

      switch(decena)
      {
          case 1:
              switch(unidad)
              {
                  case 0: return "DIEZ";
                  case 1: return "ONCE";
                  case 2: return "DOCE";
                  case 3: return "TRECE";
                  case 4: return "CATORCE";
                  case 5: return "QUINCE";
                  default: return "DIECI" + this.Unidades(unidad);
              }
              //break;
          case 2:
              switch(unidad)
              {
                  case 0: return "VEINTE";
                  default: return "VEINTI" + this.Unidades(unidad);
              }
              //break;
          case 3: return this.DecenasY("TREINTA", unidad);
          case 4: return this.DecenasY("CUARENTA", unidad);
          case 5: return this.DecenasY("CINCUENTA", unidad);
          case 6: return this.DecenasY("SESENTA", unidad);
          case 7: return this.DecenasY("SETENTA", unidad);
          case 8: return this.DecenasY("OCHENTA", unidad);
          case 9: return this.DecenasY("NOVENTA", unidad);
          case 0: return this.Unidades(unidad);
      }
  }//this.Unidades()

   DecenasY(strSin, numUnidades) {
      if (numUnidades > 0)
      return strSin + " Y " + this.Unidades(numUnidades);

      return strSin;
  }//DecenasY()

   Centenas(num) {
      let centenas = Math.floor(num / 100);
      let decenas = num - (centenas * 100);

      switch(centenas)
      {
          case 1:
              if (decenas > 0)
                  return "CIENTO " + this.Decenas(decenas);
              return "CIEN";
          case 2: return "DOSCIENTOS " + this.Decenas(decenas);
          case 3: return "TRESCIENTOS " + this.Decenas(decenas);
          case 4: return "CUATROCIENTOS " + this.Decenas(decenas);
          case 5: return "QUINIENTOS " + this.Decenas(decenas);
          case 6: return "SEISCIENTOS " + this.Decenas(decenas);
          case 7: return "SETECIENTOS " + this.Decenas(decenas);
          case 8: return "OCHOCIENTOS " + this.Decenas(decenas);
          case 9: return "NOVECIENTOS " + this.Decenas(decenas);
      }

      return this.Decenas(decenas);
  }//Centenas()

   Seccion(num, divisor, strSingular, strPlural) {
      let cientos = Math.floor(num / divisor);
      let resto = num - (cientos * divisor);

      let letras = "";

      if (cientos > 0)
          if (cientos > 1)
              letras = this.Centenas(cientos) + " " + strPlural;
          else
              letras = strSingular;

      if (resto > 0)
          letras += "";

      return letras;
  }//Seccion()

   Miles(num) {
      let divisor = 1000;
      let cientos = Math.floor(num / divisor);
      let resto = num - (cientos * divisor);

      let strMiles = this.Seccion(num, divisor, "UN MIL", "MIL");
      let strCentenas = this.Centenas(resto);

      if(strMiles === "")
          return strCentenas;

      return strMiles + " " + strCentenas;
  }//Miles()

   Millones(num) {
      let   divisor = 1000000;
      let   cientos = Math.floor(num / divisor);
      let   resto = num - (cientos * divisor);

      let   strMillones = this.Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
      let   strMiles = this.Miles(resto);

      if(strMillones === "")
          return strMiles;

      return strMillones + " " + strMiles;
  }//Millones()

   NumeroALetras(num, moneda) {
      //console.log("moneda", moneda);
      //if (moneda == 'USD'){
      let moneda_plural =  "DOLARES";
      let moneda_singular = "DOLAR";
      if (moneda == 'PYG'){
          moneda_plural =  "GUARANIES";
          moneda_singular = "GUARANI";
      }
      var data = {
          numero: num,
          enteros: Math.floor(num),
          centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
          letrasCentavos: "",
          letrasMonedaPlural: moneda_plural,//"PESOS", 'Dólares', 'Bolívares', 'etcs'
          letrasMonedaSingular: moneda_singular, //"PESO", 'Dólar', 'Bolivar', 'etc'

          letrasMonedaCentavoPlural: "CENTAVOS",
          letrasMonedaCentavoSingular: "CENTAVO"
      };

      if (data.centavos > 0) {
          data.letrasCentavos = "CON " + (function (){
              if (data.centavos == 1)
                  return this.Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
              else
                  return this.Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
              })();
      }

      if(data.enteros === 0)
          return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
      if (data.enteros == 1)
          return this.Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
      else
          return this.Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
  }//NumeroALetras()

  getMonth(month) {
    if (month == '01'){
      return "Enero";
    } else if (month == '02'){
      return "Febrero";
    } else if (month == '03'){
      return "Marzo";
    } else if (month == '04'){
      return "Abril";
    } else if (month == '05'){
      return "Mayo";
    } else if (month == '06'){
      return "Junio";
    } else if (month == '07'){
      return "Julio";
    } else if (month == '08'){
      return "Agosto";
    } else if (month == '09'){
      return "Septiembre";
    } else if (month == '10'){
      return "Octubre";
    } else if (month == '11'){
      return "Noviembre";
    } else if (month == '12'){
      return "Diciembre";
    }
  }


  b64toBlob(b64Data, contentType, sliceSize) {
          contentType = contentType || '';
          sliceSize = sliceSize || 512;

          var byteCharacters = atob(b64Data);
          var byteArrays = [];

          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              var slice = byteCharacters.slice(offset, offset + sliceSize);

              var byteNumbers = new Array(slice.length);
              for (var i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
              }

              var byteArray = new Uint8Array(byteNumbers);

              byteArrays.push(byteArray);
          }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
  }

  savebase64AsPDF(folderpath,filename,content,contentType){
      // Convert the base64 string in a Blob
      var DataBlob = this.b64toBlob(content,contentType, 512);

      //console.log("Starting to write the file :3");
      (window as any).resolveLocalFileSystemURL(folderpath, function(dir) {
          //console.log("Access to the directory granted succesfully");
          dir.getFile(filename, {create:true}, function(file) {
              //console.log("File created succesfully.");
              file.createWriter(function(fileWriter) {
                  //console.log("Writing content to file");
                  fileWriter.write(DataBlob);
              }, function(){
                console.log("Ponto7", folderpath);
                  alert('Unable to save file in path '+ folderpath);
              });
          });
      });
  }

  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const genreA = a.date;
    const genreB = b.date;

    if (genreA > genreB) {
      return -1;
    } else if (genreA < genreB) {
      return 1;
    }
    return 0;
  }

  // compareField(a, b, field) {
  //   const genreA = a[field];
  //   const genreB = b[field];
  //
  //   if (genreA > genreB) {
  //     return 1;
  //   } else if (genreA < genreB) {
  //     return -1;
  //   }
  //   return 0;
  // }

  compareField(a, b, field, direction='increase') {
    const genreA = a[field];
    const genreB = b[field];
    if (direction == 'increase'){
      if (genreA > genreB) {
        return 1;
      } else if (genreA < genreB) {
        return -1;
      }
    }
    else if (direction == 'decrease'){
      if (genreA < genreB) {
        return 1;
      } else if (genreA > genreB) {
        return -1;
      }
    }
    return 0;
  }

  addDays(date, days) {
    days = parseInt(days);
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

}
