import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';
import { FormatService } from "../../services/format.service";
import { ModalController, Events, LoadingController, NavController,
  AlertController, ToastController } from '@ionic/angular';
import { CloseService } from "./close.service";
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';
import { ConfigService } from '../../config/config.service';

@Component({
  selector: 'app-close',
  templateUrl: './close.page.html',
  styleUrls: ['./close.page.scss'],
})
export class ClosePage implements OnInit {
  @ViewChild('input', { static: true }) input;
  @Input() amount_theoretical;
  @Input() accountMoves = [];
  @Input() cash_id;
  @Input() _id;
  @Input() select;
  @Input() amount_open;
  @Input() amount_physical;

  closeForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
    public formatService: FormatService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public closeService: CloseService,
    public events: Events,
    public configService: ConfigService,
    public languageService: LanguageService,
    public pouchdbService: PouchdbService,
  ) {
    this.amount_theoretical = this.route.snapshot.paramMap.get('amount_theoretical');
    // this.accountMoves = this.route.snapshot.paramMap.get('accountMoves');
    this.cash_id = this.route.snapshot.paramMap.get('cash_id');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.amount_open = this.route.snapshot.paramMap.get('amount_open');
  }

  async ngOnInit() {
    this.closeForm = this.formBuilder.group({
      name: new FormControl(''),
      date: new FormControl(new Date()),
      amount_theoretical: new FormControl(this.amount_theoretical),
      amount_physical: new FormControl(this.amount_theoretical),
      amount_difference: new FormControl(0),
      amount_open: new FormControl(this.amount_open || 1),
      amount_close: new FormControl(0),
      amount_income: new FormControl(0),
      amount_expense: new FormControl(0),
      cash_id: new FormControl(this.cash_id),
      accountMoves: new FormControl(this.accountMoves||[]),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (this._id){
      setTimeout(() => {
        this.closeForm.markAsPristine();
      }, 200);
      this.closeService.getClose(this._id).then((data) => {
        this.closeForm.patchValue(data);
        this.cash_id = data.cash_id;
        this.amount_theoretical = data.amount_theoretical;
        this.amount_physical = data.amount_physical;
        this.closeForm.controls.amount_physical.disable();
        this.loading.dismiss();
      });
    } else {
      setTimeout(() => {
        this.input.setFocus();
        this.closeForm.markAsPristine();
      }, 200);
      let amount_income = 0;
      let amount_expense = 0;
      this.accountMoves.forEach((accountMove: any)=>{
        if (accountMove.accountFrom_id == this.cash_id){
          amount_expense += accountMove.amount;
        }
        if (accountMove.accountTo_id == this.cash_id){
          amount_income += accountMove.amount;
        }
      })
      // this.closeForm.value.amount_open = 0;
      // this.closeForm.value.amount_close = this.amount_theoretical;
      // this.closeForm.value.amount_income = amount_income;
      // this.closeForm.value.amount_expense = amount_expense;
      this.closeForm.patchValue({
        amount_open: this.amount_open,
        amount_close: this.closeForm.value.amount_physical-this.amount_open,
        amount_income: amount_income,
        amount_expense: amount_expense,
      })
      this.loading.dismiss();
    }

  }

  buttonSave() {
    return new Promise((resolve, reject)=>{
      if (this._id){
        resolve(this._id);
        if (this.select){
          this.modalCtrl.dismiss();
        }
      } else {
        this.closeService.createClose(this.closeForm.value).then((doc: any) => {
          this._id = doc.doc.id;
          this.events.publish('create-close', this.closeForm.value);
          resolve(this._id);
          if (this.select){
            // this.modalCtrl.dismiss();
          }
        });
      }
    });
  }

  async closeConfirm(){
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.accountMoves = [];
    // this.closeForm.value.accountMoves.forEach(async accountMove => {
    let accountMoves2 = [];
    await this.createCashAdjust();
    let data = this.closeForm.value.accountMoves;
    await this.formatService.asyncForEach(data, async (accountMove: any)=>{
      accountMoves2.push(accountMove._id);
      let accountMoved = await this.pouchdbService.getDoc(accountMove._id)
      this.accountMoves.push(accountMoved);
      // accountMove = accountMove._id;
    });
    await this.closeForm.patchValue({
      accountMoves: accountMoves2,
    })
    await this.buttonSave();
    await this.changeAccountMovesState();
    this.loading.dismiss();

  }

  async changeAccountMovesState(){
    let cashMoves = [];
    this.accountMoves.forEach(async accountMove => {
      // Update account move
      if (accountMove.close_id){
        accountMove.close2_id = this._id;
        accountMove.both = undefined;
        accountMove.closed = true;
      } else if (
        accountMove.accountTo_id != this.closeForm.value.cash_id
        &&
        (accountMove.accountTo_id.split('.')[1] == 'cash'
        || accountMove.accountTo_id.split('.')[1] == 'bank'
        || accountMove.accountTo_id.split('.')[1] == 'check')
      ){
        accountMove.close_id = this._id;
        accountMove.both = accountMove.accountTo_id;
      } else if (
        accountMove.accountFrom_id != this.closeForm.value.cash_id
        &&
        (accountMove.accountFrom_id.split('.')[1] == 'cash'
        || accountMove.accountFrom_id.split('.')[1] == 'bank'
        || accountMove.accountFrom_id.split('.')[1] == 'check')
      ){
        accountMove.close_id = this._id;
        accountMove.both = accountMove.accountFrom_id;
      }
       else {
        accountMove.close_id = this._id;
        accountMove.closed = true;
      }
      await this.pouchdbService.updateDoc(accountMove);
    });
  }

  async createCashAdjust(){
    return new Promise(async (resolve, reject)=>{
    let amount = this.closeForm.value.amount_physical - this.closeForm.value.amount_theoretical;
    if (amount == 0){
      resolve(false);
      return;
    }
    let accountFrom = '';
    let accountTo = '';
    if (amount > 0){
      accountFrom = 'account.income.positiveDifference';
      accountTo = this.closeForm.value.cash_id;
    }
    if (amount < 0){
      accountFrom = this.closeForm.value.cash_id;
      accountTo = 'account.expense.negativeDifference';
    }
    let docList:any = await this.pouchdbService.getList([
      'contact.myCompany',
      accountFrom,
      accountTo
    ]);
    let docDict = {}
    docList.forEach(item=>{
      docDict[item.id] = item;
    })
    let cashMove = await this.pouchdbService.createDocList([{
      'name': "Ajuste por Diferencia",
      'contact_id': 'contact.myCompany',
      'contact_name': docDict['contact.myCompany'].doc.name,
      'amount': Math.abs(amount),
      'origin_id': this.closeForm.value._id,
      'date': new Date(),
      'accountFrom_id': accountFrom,
      'accountFrom_name': docDict[accountFrom].doc.name,
      'accountTo_id': accountTo,
      'accountTo_name': docDict[accountTo].doc.name,
      'docType': "cash-move",
      '_return': true,
    }])
    this.closeForm.value.accountMoves.unshift(cashMove[0]);
    this.closeForm.patchValue({
      accountMoves: this.closeForm.value.accountMoves
    })
    resolve(cashMove);
  })
  }

  async print(){
    let data = await this.configService.getConfigDoc();
    let date = this.closeForm.value.date.split('T')[0];
    let content = this.formatService.string_pad(data.ticketPrint.closePaperWidth, "| Cierre de Caja |", 'center', '-')+"\n";
    if (data.ticketPrint.closePaperWidth >= 80){
      content += "Monto Inicial: "+this.formatService.string_pad(15, "$ "+this.closeForm.value.amount_open.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-30, " ");
      content += "Fecha: "+this.formatService.string_pad(25, (new Date(this.closeForm.value.date).toLocaleDateString('es-PY')).substring(0, data.ticketPrint.closePaperWidth-5), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-22, " ")+"\n";
      content += "Monto Final:   "+this.formatService.string_pad(15, "$ "+this.amount_physical.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-30, " ");
      content += "Valor Recebido: "+this.formatService.string_pad(16, "$ "+this.closeForm.value.amount_income.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-31, " ")+"\n";
      content += "Variación:     "+this.formatService.string_pad(15, "$ "+(this.amount_physical-this.closeForm.value.amount_open).toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-30, " ");
      content += "Monto Entregado: "+this.formatService.string_pad(15, "$ "+this.closeForm.value.amount_expense.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      content += ""+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-32, " ")+"\n";

      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "| Movimentos |", 'center', '-')+"\n";
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/3, "Contacto")+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2, "Descripcion")+this.formatService.string_pad(data.ticketPrint.closePaperWidth/6-1,"Valor", 'right')+"\n";
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
      this.closeForm.value.accountMoves.forEach(move=>{
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/3, move.contact_name)+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2, move.name)+this.formatService.string_pad(data.ticketPrint.closePaperWidth/6-1, move.amount, 'right')+"\n";
      })
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
      if (data.ticketPrint.showCloseSign || data.ticketPrint.showCloseSignSuper){
        content += "\n";
        content += "\n";
      }
      if (data.ticketPrint.showCloseSign){
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-5, "", 'center', '_');
        content += "          ";
      }
      if (data.ticketPrint.showCloseSignSuper){
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-5, "", 'center', '_')+"\n";
      }
      if (data.ticketPrint.showCloseSign){
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-5, "Firma del Cajero", 'center', ' ');
        content += "          ";
      }
      if (data.ticketPrint.showCloseSignSuper){
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-5, "Firma del Supervisor", 'center', ' ')+"\n";
      }
      let i = data.ticketPrint.closeMarginBottom;
      while(i>0){
        content += "\n";
        i--;
      }

    } else {
      content += "Fecha"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-5, (new Date(this.closeForm.value.date).toLocaleDateString('es-PY')).substring(0, data.ticketPrint.closePaperWidth-5), "right")+"\n";
      content += "Monto Inicial"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-13, "$ "+this.closeForm.value.amount_open.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      content += "Valor Recebido"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-14, "$ "+this.closeForm.value.amount_income.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      content += "Monto Entregado"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-15, "$ "+this.closeForm.value.amount_expense.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      content += "Monto Final"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-11, "$ "+this.amount_physical.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      content += "Variación"+this.formatService.string_pad(data.ticketPrint.closePaperWidth-9, "$ "+(this.amount_physical-this.closeForm.value.amount_open).toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";

      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "| Movimentos |", 'center', '-')+"\n";
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/3, "Contacto")+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-1, "Descripcion")+this.formatService.string_pad(data.ticketPrint.closePaperWidth/6,"Valor", 'right')+"\n";
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
      this.closeForm.value.accountMoves.forEach(move=>{
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth/3, (move.contact_name || "").substring(0, data.ticketPrint.closePaperWidth/3))+this.formatService.string_pad(data.ticketPrint.closePaperWidth/2-1, (move.name || "").substring(0, data.ticketPrint.closePaperWidth/2-1))+this.formatService.string_pad(data.ticketPrint.closePaperWidth/6, move.amount, 'right')+"\n";
      })
      content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
      if (data.ticketPrint.showCloseSign){
        content += "\n";
        content += "\n";
        content += "\n";
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
        content += "Firma del Cajero\n";
      }
      if (data.ticketPrint.showCloseSignSuper){
        content += "\n";
        content += "\n";
        content += "\n";
        content += this.formatService.string_pad(data.ticketPrint.closePaperWidth, "", 'center', '-')+"\n";
        content += "Firma del Supervisor\n";
      }
      let i = data.ticketPrint.closeMarginBottom;
      while(i>0){
        content += "\n";
        i--;
      }

    }
    let filename = "Cierre_"+date+".prt";
    this.formatService.printMatrix(content, filename);
    let toast = await this.toastCtrl.create({
      message: this.translate.instant('PRINTING...'),
      duration: 3000
    });
    toast.present();
  }

  hideCashMoves(){

  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.closeForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
            header: this.translate.instant('DISCARD'),
            // message: this.translate.instant('SURE_DONT_SAVE'),
            message: this.translate.instant('SURE_DONT_SAVE'),
              buttons: [{
                      text: this.translate.instant('YES'),
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: this.translate.instant('NO'),
                      handler: () => {
                          // need to do something if the user stays?
                      }
                  }]
          });

          // Show the alert
          alertPopup.present();

          // Return false to avoid the page to be popped up
          return false;
      } else {
        this.exitPage();
      }
  }

  private exitPage() {
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      // this.contactForm.markAsPristine();
      this.navCtrl.navigateBack('/cash-list');
    }
  }

}
