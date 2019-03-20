import { Injectable } from "@angular/core";
import { File } from '@ionic-native/file';
import { saveAs } from 'file-saver';
let file = new File();

@Injectable({ providedIn: 'root' })
export class FormatService {

  breakString(string, length){
    let counter = 0;
    let resultado = "";
    for(let i = 0;i<string.length;i++){
      let leter = string[i];
      resultado += leter;
      counter +=1;
      if (counter == length){
        resultado += "\n";
        counter = 0;
      }
    }
    // string.forEach(leter=>{
    //
    // })
    return resultado;
  }

  string_pad(qty, user_str, order = "left", complete = " ") {
    if (!user_str) {
      user_str = "";
    }
    user_str = user_str.toString()
    if (order == 'center') {
      let start: any = (qty - user_str.length) / 2
      start = parseInt(start);
      let start_space = "";
      for (let x = 0; x < start; x++) {
        start_space += complete;
      }
      order = "left";
      user_str = start_space + user_str;
    }
    while (user_str.length < qty) {
      if (order == "left") {
        user_str = user_str + complete;
      } else {
        user_str = complete + user_str;
      }
    }
    return user_str;
  }


  Unidades(num) {

    switch (num) {
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

  Decenas(num) {

    let decena = Math.floor(num / 10);
    let unidad = num - (decena * 10);

    switch (decena) {
      case 1:
        switch (unidad) {
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
        switch (unidad) {
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

    switch (centenas) {
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

    if (strMiles === "")
      return strCentenas;

    return strMiles + " " + strCentenas;
  }//Miles()

  Millones(num) {
    let divisor = 1000000;
    let cientos = Math.floor(num / divisor);
    let resto = num - (cientos * divisor);

    let strMillones = this.Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
    let strMiles = this.Miles(resto);

    if (strMillones === "")
      return strMiles;

    return strMillones + " " + strMiles;
  }//Millones()

  NumeroALetras(num, moneda) {
    //console.log("moneda", moneda);
    //if (moneda == 'USD'){
    let moneda_plural = "DOLARES";
    let moneda_singular = "DOLAR";
    if (moneda == 'PYG') {
      moneda_plural = "GUARANIES";
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
      data.letrasCentavos = "CON " + (function() {
        if (data.centavos == 1)
          return this.Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
        else
          return this.Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
      })();
    }

    if (data.enteros === 0)
      return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    if (data.enteros == 1)
      return this.Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
    else
      return this.Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
  }//NumeroALetras()

  getMonth(month) {
    if (month == '01' || month == 0) {
      return "Enero";
    } else if (month == '02' || month == 1) {
      return "Febrero";
    } else if (month == '03' || month == 2) {
      return "Marzo";
    } else if (month == '04' || month == 3) {
      return "Abril";
    } else if (month == '05' || month == 4) {
      return "Mayo";
    } else if (month == '06' || month == 5) {
      return "Junio";
    } else if (month == '07' || month == 6) {
      return "Julio";
    } else if (month == '08' || month == 7) {
      return "Agosto";
    } else if (month == '09' || month == 8) {
      return "Septiembre";
    } else if (month == '10' || month == 9) {
      return "Octubre";
    } else if (month == '11' || month == 10) {
      return "Noviembre";
    } else if (month == '12' || month == 11) {
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

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  savebase64AsPDF(folderpath, filename, content, contentType) {
    // Convert the base64 string in a Blob
    var DataBlob = this.b64toBlob(content, contentType, 512);

    //console.log("Starting to write the file :3");
    (window as any).resolveLocalFileSystemURL(folderpath, function(dir) {
      //console.log("Access to the directory granted succesfully");
      dir.getFile(filename, { create: true }, function(file) {
        //console.log("File created succesfully.");
        file.createWriter(function(fileWriter) {
          //console.log("Writing content to file");
          fileWriter.write(DataBlob);
        }, function() {
          console.log("Ponto7", folderpath);
          alert('Unable to save file in path ' + folderpath);
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

  compareField(a, b, field, direction = 'increase') {
    const genreA = a[field] && a[field].toUpperCase() || a[field];
    const genreB = b[field] && b[field].toUpperCase() || b[field];
    if (direction == 'increase') {
      if (genreA > genreB) {
        return 1;
      } else if (genreA < genreB) {
        return -1;
      }
    }
    else if (direction == 'decrease') {
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

  breakLine(lines) {
    let count = 0;
    let string = "";
    while (count < lines) {
      string += "\n";
      count += 1;
    }
    return string;
  }

  printInvoice(order, layout = null) {
    var prefix = "Factura_";
    var extension = ".prt";
    var partner_name = order.contact_name;
    var partner = order.contact;
    var ruc = partner.document;
    var street = partner.address;
    var phone = partner.phone;
    var max_lines = layout.lines_limit;
    // var lines_count = 0;
    var lines = "";
    var subtotal_10 = 0;
    var subtotal_05 = 0;
    var subtotal_00 = 0;
    var iva_10 = 0;
    var iva_05 = 0;
    let self = this;

    let amount_in_word_line = this.NumeroALetras(order.total, 'PYG');

    //Create matrix
    let page_printed = [];
    for (var y = 0; y < 43 + layout.lines_limit; y++) {
      page_printed[y] = [];
      for (var x = 0; x < 160; x++) {
        page_printed[y][x] = ' ';
      }
    }


    //put invoice number
    let marginTop: any = layout.invoiceNumber_top / 4.4;
    let marginLeft: any = layout.invoiceNumber_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    let dataModel = order.code;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put date
    if (layout.invoiceDateType == 'normal'){
      marginTop = layout.invoiceDate_top / 4.4;
      marginLeft = layout.invoiceDate_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = (new Date(order.date)).toLocaleDateString('es-PY');
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }
    } else {
      //Put Day
      marginTop = layout.invoiceDate_top / 4.4;
      marginLeft = layout.invoiceDate_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = (new Date(order.date)).toLocaleDateString('es-PY').split('/')[0];
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }

      //Put Month
      // marginTop = layout.invoiceMonth_top / 4.4;
      marginLeft = layout.invoiceMonth_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = this.getMonth((new Date(order.date)).toLocaleDateString('es-PY').split('/')[1]);
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }

      //Put Year
      // marginTop = layout.invoiceYear_top / 4.4;
      marginLeft = layout.invoiceYear_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = (new Date(order.date)).toLocaleDateString('es-PY').split('/')[2];
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }
    }
    //put payment
    if (layout.invoicePaymentType == 'name'){
      marginTop = layout.invoicePayment_top / 4.4;
      marginLeft = layout.invoicePayment_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = order.paymentCondition;
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }
    } else if (order.paymentCondition == 'Contado') {
      marginTop = layout.invoicePayment_top / 4.4;
      marginLeft = layout.invoicePayment_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = "XX";
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }
    } else {
      marginTop = layout.invoicePaymentCredit_top / 4.4;
      marginLeft = layout.invoicePaymentCredit_left / 1.35;
      marginTop = parseInt(marginTop);
      marginLeft = parseInt(marginLeft);
      dataModel = "XX";
      for (var x = 0; x < dataModel.toString().length; x++) {
        let b = marginLeft;
        page_printed[marginTop][x + b] = dataModel.toString()[x];
      }
    }
    //put client
    marginTop = layout.contactName_top / 4.4;
    marginLeft = layout.contactName_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = order.contact_name;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put ruc
    marginTop = layout.contactDocument_top / 4.4;
    marginLeft = layout.contactDocument_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = ruc || "";
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put address
    marginTop = layout.contactAddress_top / 4.4;
    marginLeft = layout.contactAddress_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = street || "";
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put phone
    marginTop = layout.contactPhone_top / 4.4;
    marginLeft = layout.contactPhone_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = phone || "";
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }


    //put lines
    marginTop = layout.lines_top / 4.4;
    // marginLeft  = 0;
    let linesMarginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);

    order.items.forEach((line: any, index) => {
      let line_amount_00 = 0;
      let line_amount_05 = 0;
      let line_amount_10 = 0;

      //IVA Exento
      if (line.product.tax == 'iva0') {
        line_amount_00 = line.quantity * line.price;
        subtotal_00 += line_amount_00;
      }
      //IVA 5%
      if (line.product.tax == 'iva5') {
        line_amount_05 = line.quantity * line.price;
        subtotal_05 += line_amount_05;
        iva_05 += line_amount_05 / 21;
      }
      //IVA 10%
      if (line.product.tax == 'iva10') {
        line_amount_10 = line.quantity * line.price;
        subtotal_10 += line_amount_10;
        iva_10 = iva_10 + line_amount_10 / 11;
      }

      //put code
      let codeWidth: any = layout.linesCode_width / 1.35;
      codeWidth = parseInt(codeWidth);
      marginLeft = 0;
      dataModel = this.string_pad(codeWidth, line.product.code, 'center');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += parseInt(codeWidth);

      // marginTop = layout.contactPhone_top/4.4;
      let quantityWidth: any = layout.linesQuantity_width / 1.35;
      quantityWidth = parseInt(quantityWidth);
      // marginLeft = 0;
      dataModel = this.string_pad(quantityWidth, line.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += parseInt(quantityWidth);
      let linesProductName_width: any = layout.linesProductName_width / 1.35;
      linesProductName_width = parseInt(linesProductName_width);
      dataModel = line.description.substring(0, linesProductName_width);
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += linesProductName_width;

      let linesPrice_width: any = layout.linesPrice_width / 1.35;
      linesPrice_width = parseInt(linesPrice_width);
      // dataModel = line.price;
      dataModel = this.string_pad(linesPrice_width, line.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += linesPrice_width;

      let linesTax0_width: any = layout.linesTax0_width / 1.35;
      linesTax0_width = parseInt(linesTax0_width);
      // dataModel = line_amount_00;
      dataModel = this.string_pad(linesTax0_width, line_amount_00.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += parseInt(linesTax0_width);


      let linesTax5_width: any = layout.linesTax5_width / 1.35;
      linesTax5_width = parseInt(linesTax5_width);
      // dataModel = line_amount_05;
      dataModel = this.string_pad(linesTax5_width, line_amount_05.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
      marginLeft += parseInt(linesTax5_width);

      let linesTax10_width: any = layout.linesTax10_width / 1.35;
      linesTax10_width = parseInt(linesTax10_width);
      // marginLeft += linesTax10_width;
      // dataModel = line_amount_10;
      dataModel = this.string_pad(linesTax10_width, line_amount_10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
      for (var x = 0; x < dataModel.toString().length; x++) {
        page_printed[linesMarginTop + index][x + marginLeft] = dataModel.toString()[x];
      }
    });

    //put exento
    marginTop = layout.subTotalTax0_top / 4.4;
    marginLeft = layout.subTotalTax0_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = subtotal_00.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put subtotal_05
    marginTop = layout.subTotalTax5_top / 4.4;
    marginLeft = layout.subTotalTax5_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = subtotal_05.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put subTotalTax10_width
    marginTop = layout.subTotalTax10_top / 4.4;
    marginLeft = layout.subTotalTax10_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = subtotal_10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put total
    marginTop = layout.invoiceTotal_top / 4.4;
    marginLeft = layout.invoiceTotal_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = order.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put amount_in_word_line
    marginTop = layout.amountInWords_top / 4.4;
    marginLeft = layout.amountInWords_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = amount_in_word_line;
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put iva_05
    marginTop = layout.totalTax5_top / 4.4;
    marginLeft = layout.totalTax5_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = iva_05.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put iva_10
    marginTop = layout.totalTax10_top / 4.4;
    marginLeft = layout.totalTax10_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    dataModel = parseInt(iva_10.toString()).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }
    //put iva_total
    marginTop = layout.totalTax_top / 4.4;
    marginLeft = layout.totalTax_left / 1.35;
    marginTop = parseInt(marginTop);
    marginLeft = parseInt(marginLeft);
    let amount_tax = parseInt((iva_05 + iva_10).toString());

    dataModel = amount_tax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    for (var x = 0; x < dataModel.toString().length; x++) {
      let b = marginLeft;
      page_printed[marginTop][x + b] = dataModel.toString()[x];
    }

    let invoice = "\x1b\x40\x1b\x78\x30\x1b\x4d\x0f\x0a";
    for (var y = 0; y < 43 + layout.lines_limit; y++) {
      for (var x = 0; x < 160; x++) {
        invoice += page_printed[y][x];
      }
      invoice += "\n";
    }
    var blob = new Blob([invoice], { type: "text/plain;charset=utf-8" });
    saveAs(blob, prefix + order.code + extension);
  }




  print_file(order, dotmatrix_model) {
    let date = new Date(order.date);
    let day = date.getDay();
    let month = this.getMonth(date.getMonth());
    let year = date.getFullYear();
    let contado = "";
    let credito = "";
    let condicion = "Credito"
    if (order.paymentCondition == 'Contado') {
      contado = "XX";
      condicion = "Contado";
    } else {
      credito = "XX";
      condicion = "Credito";
    }
    let name = "123"
    var prefix = "factura_";
    var extension = ".prt";
    var partner_name = order.contact.name_legal || order.contact.name;
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
    order.items.forEach((line: any) => {
      let line_amount_00 = 0;
      let line_amount_05 = 0;
      let line_amount_10 = 0;

      //IVA Exento
      if (line.product.tax == 'iva0') {
        line_amount_00 = line.quantity * line.price;
        subtotal_00 = subtotal_00 + line.subtotal;
      }
      //IVA 5%
      if (line.product.tax == 'iva5') {
        line_amount_05 = line.quantity * line.price;
        subtotal_05 = subtotal_05 + line.quantity * line.price;
        iva_05 = iva_05 + line.quantity * line.price / 21;
      }
      //IVA 10%
      if (line.product.tax == 'iva10') {
        line_amount_10 = line.quantity * line.price;
        subtotal_10 = subtotal_10 + line.quantity * line.price;
        iva_10 = iva_10 + line.quantity * line.price / 11;
      }
      console.log("line", dotmatrix_model.line);
      let line_eval = eval(dotmatrix_model.line.toString())
      console.log("line_eval", line_eval);
      lines = lines + line_eval;
      lines_count = lines_count + 1;
    });
    while (lines_count < max_lines) {
      lines = lines + "\n";
      lines_count = lines_count + 1;
    }
    let gross = order.total;
    let amount_in_word_line = this.NumeroALetras(order.total, 'PYG');
    let amount_tax = iva_05 + iva_10;
    let invoice = "\x1b\x40\x1b\x78\x30\x1b\x4d\x0f\x0a" + eval(dotmatrix_model.content).replace("false", "");
    var blob = new Blob([invoice], { type: "text/plain;charset=utf-8" });
    saveAs(blob, prefix + order.code + extension);
  }

  printMatrix(content, filename) {
    let invoice = "\x1b\x40\x1b\x78\x30\x1b\x4d\x0f\x0a" + content;
    var blob = new Blob([invoice], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
  }

  printMatrixClean(content, filename) {
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
