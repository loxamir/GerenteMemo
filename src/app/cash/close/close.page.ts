import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';
import { FormatService } from "../../services/format.service";
import { ModalController, Events, LoadingController, NavController,
  AlertController } from '@ionic/angular';
import { CloseService } from "./close.service";
import { PouchdbService } from '../../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-close',
  templateUrl: './close.page.html',
  styleUrls: ['./close.page.scss'],
})
export class ClosePage implements OnInit {
  @ViewChild('input') input;
  @Input() amount_theoretical;
  @Input() accountMoves;
  @Input() cash_id;
  @Input() _id;
  @Input() select;
  @Input() amount_open;
  @Input() amount_physical;

  closeForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public formatService: FormatService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public closeService: CloseService,
    public events: Events,
    public pouchdbService: PouchdbService,
  ) {
    this.amount_theoretical = this.route.snapshot.paramMap.get('amount_theoretical');
    this.accountMoves = this.route.snapshot.paramMap.get('accountMoves');
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
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    if (this._id){
      this.closeService.getClose(this._id).then((data) => {
        this.closeForm.patchValue(data);
        this.cash_id = data.cash_id;
        this.amount_theoretical = data.amount_theoretical;
        this.amount_physical = data.amount_physical;
        // this.closeForm.controls.amount_physical.disable();
        // this.recomputeValues();
        this.loading.dismiss();
      });
    } else {
      setTimeout(() => {
        this.input.setFocus();
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
            this.modalCtrl.dismiss();
          }
        });
      }
    });
  }

  goNextStep(){
    if (!this.closeForm.value.amount_physical){
      this.input.setFocus();
    } else {
      this.closeConfirm();
    }
  }

  async closeConfirm(){
    this.accountMoves = [];
    // this.closeForm.value.accountMoves.forEach(async accountMove => {
    let accountMoves2 = [];
    await this.createCashAdjust();
    let data = this.closeForm.value.accountMoves;
    await this.asyncForEach(data, async (accountMove: any)=>{
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

  }

  async changeAccountMovesState(){
    let cashMoves = [];
    this.accountMoves.forEach(async accountMove => {
      // Update account move
      accountMove.close_id = this._id;
      await this.pouchdbService.updateDoc(accountMove);
    });
  }

  async createCashAdjust(){
    return new Promise(async (resolve, reject)=>{
    let amount = this.closeForm.value.amount_physical - this.closeForm.value.amount_theoretical
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
      accountTo = 'account.income.positiveDifference';
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

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  print(){
    let date = this.closeForm.value.date.split('T')[0];
    let content = "Cierre de Caja";
    content += "Fecha: "+date+"\n";
    content += "Monto Inicial: $ "+this.closeForm.value.amount_open.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    content += "Monto Recebido: $ "+this.closeForm.value.amount_income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    content += "Monto Entregado: $ "+this.closeForm.value.amount_expense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    content += "Monto Final: $ "+this.closeForm.value.amount_physical.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    content += "Variación: $ "+(this.closeForm.value.amount_physical-this.closeForm.value.amount_open).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    // content += "---------| Movimentos |---------\n";
    content += this.formatService.string_pad(60, "| Movimentos |", 'center', '-')+"\n";
    content += this.formatService.string_pad(20, "Contacto")+this.formatService.string_pad(30, "Descripcion")+this.formatService.string_pad(10,"Valor", 'right')+"\n";
    content += this.formatService.string_pad(60, "", 'center', '-')+"\n";
    this.closeForm.value.accountMoves.forEach(move=>{
      content += this.formatService.string_pad(20, move.contact_name)+this.formatService.string_pad(30, move.name)+this.formatService.string_pad(10, move.amount, 'right')+"\n";
    })
    let filename = "Cierre_"+date+".prt";
    this.formatService.printMatrix(content, filename);
  }

  hideCashMoves(){

  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.closeForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
              header: 'Descartar',
              message: '¿Deseas salir sin guardar?',
              buttons: [{
                      text: 'Si',
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: 'No',
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
