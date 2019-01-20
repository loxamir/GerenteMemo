import { Injectable } from "@angular/core";
import { File } from '@ionic-native/file';
import { saveAs } from 'file-saver';
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
    if (month == '01' || month == 0){
      return "Enero";
    } else if (month == '02' || month == 1){
      return "Febrero";
    } else if (month == '03' || month == 2){
      return "Marzo";
    } else if (month == '04' || month == 3){
      return "Abril";
    } else if (month == '05' || month == 4){
      return "Mayo";
    } else if (month == '06' || month == 5){
      return "Junio";
    } else if (month == '07' || month == 6){
      return "Julio";
    } else if (month == '08' || month == 7){
      return "Agosto";
    } else if (month == '09' || month == 8){
      return "Septiembre";
    } else if (month == '10' || month == 9){
      return "Octubre";
    } else if (month == '11' || month == 10){
      return "Noviembre";
    } else if (month == '12' || month == 11){
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































  breakLine(lines){
    let count = 0;
    let string = "";
    while(count<lines){
      string+="\n";
      count+=1;
    }
    return string;
  }




  print_file(order, dotmatrix_model) {
    console.log("order", order);
    console.log("dotmatrix_model", dotmatrix_model);
              // let order = '123';
              // order._printed = true;
              // var months = new Array();
              // months[0] = "Enero";
              // months[1] = "Febrero";
              // months[2] = "Marzo";
              // months[3] = "Abril";
              // months[4] = "Mayo";
              // months[5] = "Junio";
              // months[6] = "Julio";
              // months[7] = "Agosto";
              // months[8] = "Septiembre";
              // months[9] = "Octubre";
              // months[10] = "Noviembre";
              // months[11] = "Dicimbre";
              // let invoice_data = order.export_for_printing();
              let date = new Date(order.date);
              let day = date.getDay();
              let month = this.getMonth(date.getMonth());
              let year = date.getFullYear();
              let contado = "";
              let credito = "";
              let condicion = "Credito"
              if(order.payment_term == 1){
                  contado = "x";
                  // credito = "";
                  condicion = "Contado";
              } else {
                  // contado = "";
                  credito = "x";
                  condicion = "Credito";
              }
              console.log("month", date.getMonth());
              // var discount_amount = 0;
              // var original_price = 0;
              // var lines_length = order.attributes.orderLines.length;
              // price_list_id = parseInt(this.pos.config.pricelist_id[0]);
              // for(var line=0; line<lines_length;line++){
              //     let this_line = order.attributes.orderLines.models[line]
              //     let line_price = this_line.price;
              //     //line_pricelist = this.pos.pricelist_engine.compute_price(
              //     //    this.pos.db, this_line.product, false, 1, price_list_id);
              //     let line_pricelist = this_line.price;
              //     let line_discount = (line_pricelist - line_price)*this_line.quantity;
              //     original_price = original_price + line_pricelist*this_line.quantity;
              //     if(line_discount > 0){
              //         discount_amount = discount_amount + line_discount;
              //     }
              // }
              // if (discount_amount > 0){
              //     let discount_percent = 100*discount_amount/original_price;
              // } else {
              //     let discount_percent = 0;
              // }
              // if(config.to_invoice){
              let name="123"
                  var prefix = "factura_";
                  var extension = ".prt";

//                   var dotmatrix_model = {
//                     qty_lines: 20,
//                     line: `self.string_pad(5,"")+self.string_pad(10,parseFloat(line.quantity).toFixed(0), "right")+" "+self.string_pad(67,line.description.substring(0,67))+" "+self.string_pad(8,parseFloat(line.price).toFixed(0), "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(15,parseFloat(line_amount_00).toFixed(0), "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(15,parseFloat(line_amount_05).toFixed(0), "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(15,parseFloat(line_amount_10).toFixed(0), "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.breakLine(1)`+'\n',
//                     content: `
// self.breakLine(4)+
// self.string_pad(125,"")+self.string_pad(15,order.code)+
// self.breakLine(4)+
// self.string_pad(20,'')+self.string_pad(2,day)+" de "+self.string_pad(2,month)+" de "+self.string_pad(90,year)+" "+self.string_pad(8,condicion)+
// self.breakLine(2)+
// self.string_pad(20,'')+self.string_pad(105,partner_name)+" "+self.string_pad(10,ruc)+
// self.breakLine(1)+
// self.string_pad(20,'')+self.string_pad(53,street)+" "+self.string_pad(15,phone)+
// self.breakLine(3)+
// lines+
// self.string_pad(93,'')+self.string_pad(15,subtotal_00, "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(14,subtotal_05, "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(14,subtotal_10, "right").replace(/\B(?=(\d{3})+(?!\d))/g, ".")+
// self.breakLine(3)+
// self.string_pad(130,'')+self.string_pad(10,gross.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")+
// self.breakLine(1)+
// self.string_pad(5,'')+self.string_pad(120,amount_in_word_line)+
// self.breakLine(1)+
// self.string_pad(55,'')+self.string_pad(20,iva_05.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(10,iva_10.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")+self.string_pad(24,'')+self.string_pad(10,amount_tax.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")+
// self.breakLine(7)`
//                   }
                  var partner_name = order.contact_name;
                  var partner = order.contact;
                  var ruc = partner.document;
                  var street = partner.address;
                  var phone = partner.phone;
                  var max_lines = dotmatrix_model.qty_lines;
                  var lines_count = 0;
                  var lines = "";
                  var subtotal_10 = 0;
                  var subtotal_05 = 0;
                  var subtotal_00 = 0;
                  var iva_10 = 0;
                  var iva_05 = 0;
                  let self = this;
                  order.items.forEach((line: any)=>{
                    let line_amount_00 = 0;
                    let line_amount_05 = 0;
                    let line_amount_10 = 0;

                    //IVA Exento
                    if(line.product.tax=='exenta'){
                        line_amount_00 = line.quantity*line.price;
                        subtotal_00 = subtotal_00 + line.subtotal;
                    }
                    //IVA 5%
                    if(line.product.tax=='iva5'){
                        line_amount_05 = line.quantity*line.price;
                        subtotal_05 = subtotal_05 + line.quantity*line.price;
                        iva_05 = iva_05 + line.quantity*line.price/21;
                    }
                    //IVA 10%
                    if(line.product.tax=='iva10'){
                        line_amount_10 = line.quantity*line.price;
                        subtotal_10 = subtotal_10 + line.quantity*line.price;
                        iva_10 = iva_10 + line.quantity*line.price/11;
                    }
                    console.log("line", dotmatrix_model.line);
                    let line_eval = eval(dotmatrix_model.line.toString())
                    console.log("line_eval", line_eval);
                    lines = lines+line_eval;
                    lines_count = lines_count + 1;
                  });

                  // }
                  // if(config.to_invoice){
                      while(lines_count < max_lines){
                          lines = lines+"\n";
                          lines_count = lines_count + 1;
                      }
                  // }
                  let gross = order.total;
                  // console.log(order);
                  let amount_in_word_line = this.NumeroALetras(order.total, 'PYG');
                  let amount_tax = iva_05 + iva_10;
                  let invoice = "\x1b\x40\x1b\x78\x30\x1b\x4d\x0f\x0a"+eval(dotmatrix_model.content).replace("false", "");
                  // console.log("invoice", invoice);
                  var blob = new Blob([invoice], {type: "text/plain;charset=utf-8"});
                  saveAs(blob, prefix+order.code+extension);
                  // this.download("factura.txt", invoice);
              // }
          }




// download(filename, text) {
//     var element = document.createElement('a');
//     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
//     element.setAttribute('download', filename);
//
//     element.style.display = 'none';
//     document.body.appendChild(element);
//
//     element.click();
//
//     document.body.removeChild(element);
//   }

}
