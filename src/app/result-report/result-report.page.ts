import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NavController, LoadingController,
  AlertController, ToastController,
  ModalController
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TitlePage } from '../title/title.page';
import { AccountCategoryPage } from '../account-category/account-category.page';

@Component({
  selector: 'app-result-report',
  templateUrl: './result-report.page.html',
  styleUrls: ['./result-report.page.scss'],
})
export class ResultReportPage implements OnInit {
  @ViewChild('select', { static: false }) select;

  resultForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  result: any[];
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
    public formatService: FormatService,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
  ) {
    this.today = new Date();



    this._id = this.route.snapshot.paramMap.get('_id');
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
        '_id': view._id,
        select: true,
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

  sortByCode(list=[]){
    let self= this;
    let list2 = list.sort(function(a, b) {
      return self.formatService.compareField(a, b, 'code', 'increase');
    });
    return list2;
    // list.sort(this.formatService.compareField('code'))
  }

  groupByName(object, prop, sum) {
    return object.reduce(function(lines, item) {
      const val = item[prop]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
      if (item.signal == "-") {
        lines[val][sum] -= parseFloat(item[sum])
      } else {
        lines[val][sum] += parseFloat(item[sum])
      }

      lines[val]['list'] = lines[val]['list'] || []
      lines[val]['list'].push(item)
      return lines
    }, {})
  }

 async ngOnInit() {
    this.resultForm = this.formBuilder.group({
      contact: new FormControl(this.route.snapshot.paramMap.get('contact')
      || {}, Validators.required),
      name: new FormControl(''),
      contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')
      || ''),
      code: new FormControl(''),
      date: new FormControl(this.route.snapshot.paramMap.get('date')
      || this.today.toISOString()),
      dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')
      || this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd')
      || this.today.toISOString()),
      origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
      total: new FormControl(0),
      residual: new FormControl(0),
      note: new FormControl(''),
      state: new FormControl('QUOTATION'),
      tab: new FormControl('products'),
      items: new FormControl(this.route.snapshot.paramMap.get('items')
      || [], Validators.required),
      payments: new FormControl([]),
      planned: new FormControl([]),
      paymentCondition: new FormControl({}),
      payment_name: new FormControl(''),
      invoice: new FormControl(''),
      resultType: new FormControl('cashFlow'),
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
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
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
    let result = [];
    let dict = {};
    this.pouchdbService.searchDocTypeData(
      'title',
      ''
    ).then((titles: any[]) => {
      titles.push({ "_id": undefined, "code": 0, "name": "Indefinido" });
      this.pouchdbService.searchDocTypeData(
        'accountCategory',
        ''
      ).then((accountCategories: any[]) => {
        let teste = this.groupByName(accountCategories, 'title_id', '');
        titles.forEach(title => {
          if (parseFloat(title.code) >= 4) {
            result.push({
              "name": title.name,
              "code": title.code,
              "formula": title.formula,
              "_id": title._id,
              "categories": teste[title._id] && teste[title._id]['list'] || []
            });
          }
        });

        this.pouchdbService.searchDocTypeData(
          'account', ''
        ).then((accounts: any[]) => {
          this.accounts = accounts;
          let categArray = this.groupByName(accounts, 'category_id', '');
          result.forEach(title => {
            title.categories.forEach(catego => {
              catego['accounts'] = categArray[catego._id]
              && categArray[catego._id]['list'] || [];
            })
          })
          this.pouchdbService.getView(
            'stock/ResultadoDiario', 2,
            [this.resultForm.value.dateStart.split("T")[0], '0'],
            [this.resultForm.value.dateEnd.split("T")[0], 'z']
          ).then((view: any[]) => {
            result.forEach(title => {
              let titbalance = 0;
              title.categories.forEach(category => {
                let catbalance = 0
                category.accounts && category.accounts.forEach(account => {
                  let balance = 0;
                  view.forEach(viewData => {
                    if (viewData.key[1] == account._id) {
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
            result.forEach(title => {
              if (title.formula) {
                let calculo = title.formula;
                result.forEach(it => {
                  calculo = calculo.replace(it._id, it.balance);
                  it.categories.forEach(categor => {
                    calculo = calculo.replace(categor._id, categor.balance);
                    categor.accounts.forEach(account => {
                      calculo = calculo.replace(account._id, account.balance);
                    })
                  })
                })
                title.balance = eval(calculo);
              }
            })
            this.result = result.reverse();
            this.loading.dismiss();
          });
        });
      });
    });
  }

  // ionViewWillLeave() {
  //   this.events.publish('create-result', this.resultForm.value);
  // }

  onSubmit(values) {
    //console.log(values);
  }

}
