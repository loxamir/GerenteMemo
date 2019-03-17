import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  LoadingController,
   AlertController, Events, ToastController,
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
import { AccountPage } from '../account/account.page';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-accounts-report',
  templateUrl: './accounts-report.page.html',
  styleUrls: ['./accounts-report.page.scss'],
})
export class AccountsReportPage implements OnInit {

  @ViewChild('select') select;

    accountsReportForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    accountsReport: any[];

    accountCategories: any[];
    accounts: any[];

    languages: Array<LanguageModel>;

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

    groupBySum(object, prop, sum) {
      return object.reduce(function(lines, item) {
        const val = item[prop]
        lines[val] = lines[val] || {}
        lines[val][sum] = lines[val][sum] || 0
        lines[val][sum] += item[sum]
        return lines
      }, {})
    }

    sortByCode(list=[]){
      let self= this;
      let list2 = list.sort(function(a, b) {
        return self.formatService.compareField(a, b, 'code', 'increase');
      });
      return list2;
    }

    async openTitle(view) {
      let profileModal = await this.modalCtrl.create({
        component: TitlePage,
        componentProps: {
          '_id': view._id,
          select: true,
        }
      });
      profileModal.present();
    }

    async openCategory(view) {
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          _id: view._id,
          select: true,
        }
      });
      profileModal.present();
    }

    async openAccount(view) {
      let profileModal = await this.modalCtrl.create({
        component: AccountPage,
        componentProps: {
          _id: view._id,
          select: true,
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

    compare(a, b, field) {
      // Use toUpperCase() to ignore character casing
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
      this.accountsReportForm = this.formBuilder.group({
        contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}, Validators.required),
        name: new FormControl(''),
        contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')||''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today),
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
        accountsReportType: new FormControl('cashFlow'),
        groupBy: new FormControl('date'),
        orderBy: new FormControl('quantity'),
        filterBy: new FormControl('contact'),
        filter: new FormControl(''),
        invoices: new FormControl([]),
        showAccounts: new FormControl(true),
        showCateg: new FormControl(true),
        showTitle: new FormControl(true),
        _id: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      this.recomputeValues();
    }

    getFirstDateOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    recomputeValues() {
        let accountsReport = [];
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
              accountsReport.push({
                "name": title.name,
                "code": title.code,
                "formula": title.formula,
                "_id": title._id,
                "categories": teste[title._id] && teste[title._id]['list'] || []
              });
          });

          this.pouchdbService.searchDocTypeData('account', '').then((accounts: any[]) => {
            this.accounts = accounts;
            let categArray = this.groupByName(accounts, 'category_id', '');
            accountsReport.forEach(title =>{
              title.categories.forEach(catego=>{
                catego['accounts'] = categArray[catego._id] && categArray[catego._id]['list'] || [];
              })
            })
            this.pouchdbService.getView(
              'stock/ResultadoDiario', 2,
              [this.accountsReportForm.value.dateStart.split("T")[0], '0'],
              [this.accountsReportForm.value.dateEnd.split("T")[0], 'z']
            ).then((view: any[]) => {
              accountsReport.forEach(title=>{
                let titaccountsReport = 0;
                title.categories.forEach(category=>{
                  let cataccountsReport = 0
                  category.accounts && category.accounts.forEach(account=>{
                    let accountsReport = 0;
                    view.forEach(viewData=>{
                      if(viewData.key[1] == account._id){
                        accountsReport += viewData.value;
                      }
                    })
                    account.accountsReport = accountsReport;
                    cataccountsReport += accountsReport;
                  })
                  category.accountsReport = cataccountsReport;
                  titaccountsReport += cataccountsReport;
                })
                title.accountsReport = titaccountsReport;
              })
              // Calculate the formula titles
              accountsReport.forEach(title=>{
                if (title.formula){
                  let calculo = title.formula;
                  accountsReport.forEach(it=>{
                    calculo = calculo.replace(it._id, it.accountsReport);
                    it.categories.forEach(categor=>{
                      calculo = calculo.replace(categor._id, categor.accountsReport);
                      categor.accounts.forEach(account=>{
                        calculo = calculo.replace(account._id, account.accountsReport);
                      })
                    })
                  })
                  title.accountsReport = eval(calculo);
                }
              })
              this.accountsReport = accountsReport.reverse();
              this.loading.dismiss();
            });
          });
        });
      });
    }

    doRefresh(refresher) {
      setTimeout(() => {
        this.recomputeValues();
        refresher.target.complete();
      }, 500);
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
