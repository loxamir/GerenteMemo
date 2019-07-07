import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController,  LoadingController,
   AlertController, ToastController,
 ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';
import { ReportService } from '../report/report.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TitlePage } from '../title/title.page';
import { AccountCategoryPage } from '../account-category/account-category.page';

@Component({
  selector: 'app-balance-report',
  templateUrl: './balance-report.page.html',
  styleUrls: ['./balance-report.page.scss'],
})
export class BalanceReportPage implements OnInit {
  @ViewChild('select') select;

    balanceForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    balance: any[];
    accountCategories: any[];
    accounts: any[];
    languages: Array<LanguageModel>;
    currency_precision = 2;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      public productService: ProductService,
      public reportService: ReportService,
      public toastCtrl: ToastController,
      public formatService: FormatService,
      public pouchdbService: PouchdbService,
      public modalCtrl: ModalController,
    ) {
      this.today = new Date();
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
    }

    sortByCode(list=[]){
      let self= this;
      let list2 = list.sort(function(a, b) {
        return self.formatService.compareField(a, b, 'code', 'increase');
      });
      return list2;
    }

    groupBySum(object, prop, sum) {
      return object.reduce(function(lines, item) {
        const val = item[prop]
        lines[val] = lines[val] || {}
        lines[val][sum] = lines[val][sum] || 0
        lines[val][sum] += item[sum]
        return lines
      }, {})
    }

    async openTitle(view) {
      let profileModal = await this.modalCtrl.create({
        component: TitlePage,
        componentProps: {
          select: true,
          '_id': view._id
        }
      });
      profileModal.present();
    }

    doRefresh(refresher) {
      setTimeout(() => {
        this.recomputeValues();
        refresher.target.complete();
      }, 500);
    }


    async openCategory(view) {
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          select: true,
          '_id': view._id
        }
      });
      profileModal.present();
    }

    groupByName(object, prop, sum) {
        return object.reduce(function(lines, item) {
          const val = item[prop]
          lines[val] = lines[val] || {}
          lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
          if (item.signal== "-"){
            lines[val][sum] -= parseFloat(item[sum])
          } else {
            lines[val][sum] += parseFloat(item[sum])
          }

          lines[val]['list'] = lines[val]['list'] || []
          lines[val]['list'].push(item)
          return lines
        }, {})
      }

    groupByDate(object, prop, sum) {
        return object.reduce(function(lines, item) {
          const val = item[prop].split("T")[0]
          lines[val] = lines[val] || {}
          lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
          if (item.signal== "-"){
            lines[val][sum] -= parseFloat(item[sum])
          } else {
            lines[val][sum] += parseFloat(item[sum])
          }

          lines[val]['list'] = lines[val]['list'] || []
          lines[val]['list'].push(item)
          return lines
        }, {})
      }

    compare(a, b, field) {
      const genreA = a[field];
      const genreB = b[field];
      if (genreA > genreB) {
        return -1;
      } else if (genreA < genreB) {
        return 1;
      }
      return 0;
    }

    async ngOnInit() {
      this.balanceForm = this.formBuilder.group({
        contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}, Validators.required),
        name: new FormControl(''),
        contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')||''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today.toISOString()),
        dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||this.getFirstDateOfMonth()),
        dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd')||this.today.toISOString()),
        origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
        total: new FormControl(0),
        residual: new FormControl(0),
        note: new FormControl(''),
        state: new FormControl('QUOTATION'),
        tab: new FormControl('products'),
        items: new FormControl(this.route.snapshot.paramMap.get('items')||[], Validators.required),
        payments: new FormControl([]),
        planned: new FormControl([]),
        paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        invoice: new FormControl(''),
        balanceType: new FormControl('cashFlow'),
        groupBy: new FormControl('date'),
        orderBy: new FormControl('quantity'),
        filterBy: new FormControl('contact'),
        filter: new FormControl(''),
        invoices: new FormControl([]),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      this.recomputeValues();
    }

    getFirstDateOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    recomputeValues() {
        let balance = [];
        let dict = {};

        this.pouchdbService.searchDocTypeData(
          'title',
          ''
        ).then((titles: any[]) => {
        this.pouchdbService.searchDocTypeData(
          'accountCategory',
          ''
        ).then((accountCategories: any[]) => {

          let teste = this.groupByName(accountCategories, 'title_id', '');
          titles.forEach(title=>{
            if (parseFloat(title.code)<=3){
              balance.push({
                "name": title.name,
                "code": title.code,
                "formula": title.formula,
                "_id": title._id,
                "categories": teste[title._id] && teste[title._id]['list'] || []
              });
            }
          });

          this.pouchdbService.searchDocTypeData('account', '').then((accounts: any[]) => {
            this.accounts = accounts;
            let categArray = this.groupByName(accounts, 'category_id', '');
            balance.forEach(title =>{
              title.categories.forEach(catego=>{
                catego['accounts'] = categArray[catego._id] && categArray[catego._id]['list'] || [];
              })
            })
            this.pouchdbService.getView(
              'stock/ResultadoDiario', 2,
              [this.balanceForm.value.dateStart.split("T")[0], '0'],
              [this.balanceForm.value.dateEnd.split("T")[0], 'z']
            ).then((view: any[]) => {
              balance.forEach(title=>{
                let titbalance = 0;
                title.categories.forEach(category=>{
                  let catbalance = 0
                  category.accounts && category.accounts.forEach(account=>{
                    let balance = 0;
                    view.forEach(viewData=>{
                      if(viewData.key[1] == account._id){
                        balance += viewData.value;
                      }
                    })
                    account.balance = balance;
                    catbalance += balance;
                  })
                  category.balance = catbalance;
                  titbalance += catbalance;
                })
                title.balance = titbalance;
              })
              // Calculate the formula titles
              balance.forEach(title=>{
                if (title.formula){
                  let calculo = title.formula;
                  balance.forEach(it=>{
                    calculo = calculo.replace(it._id, it.balance);
                    it.categories.forEach(categor=>{
                      calculo = calculo.replace(categor._id, categor.balance);
                      categor.accounts.forEach(account=>{
                        calculo = calculo.replace(account._id, account.balance);
                      })
                    })
                  })
                  title.balance = eval(calculo);
                }
              })
              this.balance = balance.reverse();
              this.loading.dismiss();
            });
          });
        });
      });
    }

    setLanguage(lang: LanguageModel){
      let language_to_set = this.translate.getDefaultLang();

      if(lang){
        language_to_set = lang.code;
      }
      this.translate.setDefaultLang(language_to_set);
      this.translate.use(language_to_set);
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    onSubmit(values){
      //console.log(values);
    }
}
