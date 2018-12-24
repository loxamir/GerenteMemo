import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Pro } from '@ionic/pro';
import { IonicApp, IonicModule, IonicErrorHandler } from '@ionic/angular';
import { APP_INITIALIZER, ErrorHandler, Injectable, Injector} from '@angular/core';
import { MyApp } from './app.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppConfig }       from './app.config';
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
// import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
registerLocaleData(es);
//import { environment } from '../environment/environment';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
// import { TabsPage } from '../pages/stock/tabs/tabs';
// import { SaleTabsPage } from '../pages/sale/tabs/tabs';
// import { FinancePage } from '../pages/finance/finance';

import { ImporterPage } from '../pages/importer/importer';
// import { AgriculturePage } from '../pages/agriculture/agriculture';
// import { PurchaseTabsPage } from '../pages/purchase/tabs/tabs';
import { PurchasePage } from '../pages/purchase/purchase';
import { PurchasePopover } from '../pages/purchase/purchase.popover';
import { PurchasesPage } from '../pages/purchase/list/purchases';
import { PurchasesPopover } from '../pages/purchase/list/purchases.popover';
// import { PurchaseDashboardPage } from '../pages/purchase/dashboard/purchase-dashboard';
import { PurchaseService } from '../pages/purchase/purchase.service';
import { PurchasesService } from '../pages/purchase/list/purchases.service';
// import { PurchaseDashboardService } from '../pages/purchase/dashboard/purchase-dashboard.service';

// import { SuperTabsModule } from 'ionic2-super-tabs';
import { TabsNavigationPage } from '../pages/tabs-navigation/tabs-navigation';
import { AgroTabsPage } from '../pages/agro-tabs/agro-tabs';
import { PersonTabsPage } from '../pages/person/person-tabs';
// import { AgriculturePage } from '../pages/agriculture/agriculture';
//Custom
// import { TaskPage } from '../pages/task/task';
// import { TasksPage } from '../pages/task/list/tasks';
// import { TasksPopover } from '../pages/task/list/tasks.popover';
// import { TaskService } from '../pages/task/task.service';
// import { TasksService } from '../pages/task/list/tasks.service';
import { SalePage } from '../pages/sale/sale';
import { SalePopover } from '../pages/sale/sale.popover';
import { SalesPage } from '../pages/sale/list/sales';
import { SalesPopover } from '../pages/sale/list/sales.popover';
// import { SaleDashboardPage } from '../pages/sale/dashboard/sale-dashboard';
import { InvoicePage } from '../pages/invoice/invoice';
import { InvoicePopover } from '../pages/invoice/invoice.popover';
import { InvoicesPage } from '../pages/invoice/list/invoices';
import { InvoicesPopover } from '../pages/invoice/list/invoices.popover';
// import { CheckPage } from '../pages/check/check';
// import { ChecksPage } from '../pages/check/list/checks';
// import { ChecksPopover } from '../pages/check/list/checks.popover';
import { ProductPage } from '../pages/product/product';
import { ProductsPage } from '../pages/product/list/products';
import { ProductsPopover } from '../pages/product/list/products.popover';
import { ContactPage } from '../pages/contact/contact';
import { ContactsPage } from '../pages/contact/list/contacts';
import { ContactsPopover } from '../pages/contact/list/contacts.popover';

import { AccountCategoryPage } from '../pages/cash/move/account/accountCategory/accountCategory';
import { AccountCategorysPage } from '../pages/cash/move/account/accountCategory/list/accountCategorys';
import { AccountCategorysPopover } from '../pages/cash/move/account/accountCategory/list/accountCategorys.popover';



import { HelpPage } from '../pages/help/help';
import { HelpsPage } from '../pages/help/list/helps';
import { Base64 } from '@ionic-native/base64';
import { CashPage } from '../pages/cash/cash';
import { CashListPage } from '../pages/cash/list/cash-list';
import { CashListPopover } from '../pages/cash/list/cash-list.popover';
import { CashMovePage } from '../pages/cash/move/cash-move';
import { CashMoveListPage } from '../pages/cash/move/list/cash-move-list';
import { CashMoveListPopover } from '../pages/cash/move/list/cash-move-list.popover';

import { AreaPage } from '../pages/area/area';
import { AreasPage } from '../pages/area/list/areas';
import { AreasPopover } from '../pages/area/list/areas.popover';

// import { RecurentPage } from '../pages/cash/recurent/recurent';
// import { RecurentListPage } from '../pages/cash/recurent/list/recurent-list';
// import { RecurentListPopover } from '../pages/cash/recurent/list/recurent-list.popover';

import { StockMovePage } from '../pages/stock/stock-move';
import { StockMoveListPage } from '../pages/stock/list/stock-move-list';
import { StockMoveListPopover } from '../pages/stock/list/stock-move-list.popover';

import { ReceiptPage } from '../pages/receipt/receipt';
import { ReceiptsPage } from '../pages/receipt/list/receipts';
import { ReceiptsPopover } from '../pages/receipt/list/receipts.popover';

import { ServicePage } from '../pages/service/service';
import { ServicePopover } from '../pages/service/service.popover';
import { ServiceEquipmentPage } from '../pages/service/equipment/equipment';
import { ServiceInputPage } from '../pages/service/input/input';
import { ServiceWorkPage } from '../pages/service/work/work';
import { ServiceTravelPage } from '../pages/service/travel/travel';
import { ServicesPage } from '../pages/service/list/services';
import { ServicesPopover } from '../pages/service/list/services.popover';

import { ProjectPage } from '../pages/project/project';
import { ProjectsPage } from '../pages/project/list/projects';

import { HomePage } from '../pages/home/home';

import { CategoryPage } from '../pages/product/category/category';
import { CategoriesPage } from '../pages/product/category/list/categories';

import { AccountPage } from '../pages/cash/move/account/account';
import { AccountsPage } from '../pages/cash/move/account/list/accounts';

import { WarehousePage } from '../pages/stock/warehouse/warehouse';
import { WarehousesPage } from '../pages/stock/warehouse/list/warehouses';
import { WarehousesPopover } from '../pages/stock/warehouse/list/warehouses.popover';

import { ViewPage } from '../pages/report/view/view';
import { ConfigInvoicePage } from '../pages/config/invoice/invoice';
import { UserPage } from '../pages/config/user/user';
import { ReportPage } from '../pages/report/report';
import { ReportsPage } from '../pages/report/list/reports';
import { ReportsPopover } from '../pages/report/list/reports.popover';
import { ReportSalePage } from '../pages/report/sale/report-sale';
import { ReportPurchasePage } from '../pages/report/purchase/report-purchase';
import { CashFlowPage } from '../pages/report/cashflow/cashflow';
import { ResultPage } from '../pages/report/result/result';
import { BalancePage } from '../pages/report/balance/balance';
import { AccountsReportPage } from '../pages/report/accounts/accounts';
import { LoginPage } from '../pages/login/login';
import { CurrencyPage } from '../pages/currency/currency';
import { CurrencyListPage } from '../pages/currency/list/currency-list';
import { PaymentConditionPage } from '../pages/payment-condition/payment-condition';
import { PaymentConditionListPage } from '../pages/payment-condition/list/payment-condition-list';
// import { PlannedPage } from '../pages/planned/planned';
import { PlannedListPage } from '../pages/planned/list/planned-list';
import { ConfigPage } from '../pages/config/config';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { FileChooser } from '@ionic-native/file-chooser';
//custom components
import { PreloadImage } from '../components/preload-image/preload-image';
// import { BackgroundImage } from '../components/background-image/background-image';
// import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
// import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
// import { ColorRadio } from '../components/color-radio/color-radio';
// import { CounterInput } from '../components/counter-input/counter-input';
// import { Rating } from '../components/rating/rating';
//import { GoogleMap } from '../components/google-map/google-map';
//import { VideoPlayerModule } from '../components/video-player/video-player.module';
import { ValidatorsModule } from '../components/validators/validators.module';

//services
import { LoginService } from '../pages/login/login.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Printer } from '@ionic-native/printer';
import { PouchdbService } from '../providers/pouchdb/pouchdb-service';
import { SaleService } from '../pages/sale/sale.service';
import { SalesService } from '../pages/sale/list/sales.service';
import { FormatService } from '../providers/format.service';
import { InvoiceService } from '../pages/invoice/invoice.service';
import { InvoicesService } from '../pages/invoice/list/invoices.service';
// import { CheckService } from '../pages/check/check.service';
// import { ChecksService } from '../pages/check/list/checks.service';
import { ProductService } from '../pages/product/product.service';
import { ProductsService } from '../pages/product/list/products.service';
import { ContactService } from '../pages/contact/contact.service';
import { ContactsService } from '../pages/contact/list/contacts.service';

import { DashboardService } from '../pages/dashboard/dashboard.service';
import { DashboardsService } from '../pages/dashboard/list/dashboards.service';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { DashboardsPage } from '../pages/dashboard/list/dashboards';
import { DashboardsPopover } from '../pages/dashboard/list/dashboards.popover';
import { DashboardFilterPage } from '../pages/dashboard/filter/filter';
import { AdvancePage } from '../pages/advance/advance';
import { AdvancesPage } from '../pages/advance/list/advances';
import { AdvancesPopover } from '../pages/advance/list/advances.popover';
import { AdvanceService } from '../pages/advance/advance.service';
import { AdvancesService } from '../pages/advance/list/advances.service';

import { SalaryPage } from '../pages/salary/salary';
import { SalarysPage } from '../pages/salary/list/salarys';
import { SalarysPopover } from '../pages/salary/list/salarys.popover';
import { SalaryService } from '../pages/salary/salary.service';
import { SalarysService } from '../pages/salary/list/salarys.service';
import { SalaryInputPage } from '../pages/salary/input/input';

import { TitlePage } from '../pages/cash/move/account/accountCategory/title/title';
import { TitlesPage } from '../pages/cash/move/account/accountCategory/title/list/titles';
import { TitlesPopover } from '../pages/cash/move/account/accountCategory/title/list/titles.popover';
import { TitleService } from '../pages/cash/move/account/accountCategory/title/title.service';
import { TitlesService } from '../pages/cash/move/account/accountCategory/title/list/titles.service';

import { AccountCategoryService } from '../pages/cash/move/account/accountCategory/accountCategory.service';
import { AccountCategorysService } from '../pages/cash/move/account/accountCategory/list/accountCategorys.service';

import { HelpService } from '../pages/help/help.service';
import { HelpsService } from '../pages/help/list/helps.service';
import { CashService } from '../pages/cash/cash.service';
import { CashListService } from '../pages/cash/list/cash-list.service';
import { CashMoveService } from '../pages/cash/move/cash-move.service';
import { CashMoveListService } from '../pages/cash/move/list/cash-move-list.service';

import { AreaService } from '../pages/area/area.service';
import { AreasService } from '../pages/area/list/areas.service';

import { MachinePage } from '../pages/machine/machine';
import { MachinesPage } from '../pages/machine/list/machines';
import { MachinesPopover } from '../pages/machine/list/machines.popover';
import { MachineService } from '../pages/machine/machine.service';
import { MachinesService } from '../pages/machine/list/machines.service';

import { CropPage } from '../pages/crop/crop';
import { CropsPage } from '../pages/crop/list/crops';
import { CropsPopover } from '../pages/crop/list/crops.popover';
import { CropService } from '../pages/crop/crop.service';
import { CropsService } from '../pages/crop/list/crops.service';

import { AnimalPage } from '../pages/animal/animal';
import { AnimalsPage } from '../pages/animal/list/animals';
import { AnimalsPopover } from '../pages/animal/list/animals.popover';
import { AnimalService } from '../pages/animal/animal.service';
import { AnimalsService } from '../pages/animal/list/animals.service';
// import { RecurentService } from '../pages/cash/recurent/recurent.service';
// import { RecurentListService } from '../pages/cash/recurent/list/recurent-list.service';
import { StockMoveService } from '../pages/stock/stock-move.service';
import { StockMoveListService } from '../pages/stock/list/stock-move-list.service';
import { ReceiptService } from '../pages/receipt/receipt.service';
import { ReceiptsService } from '../pages/receipt/list/receipts.service';

import { ServiceService } from '../pages/service/service.service';
import { ServicesService } from '../pages/service/list/services.service';

import { ActivityPage } from '../pages/work/activity/activity';
import { ActivitysPage } from '../pages/work/activity/list/activitys';
// import { ActivitysPopover } from '../pages/work/activity/list/activitys.popover';
import { WorkPage } from '../pages/work/work';
import { WorkFieldPage } from '../pages/work/activity/field/field';
import { WorksPage } from '../pages/work/list/works';
import { WorksPopover } from '../pages/work/list/works.popover';
import { ActivityService } from '../pages/work/activity/activity.service';
import { ActivitysService } from '../pages/work/activity/list/activitys.service';
import { WorkService } from '../pages/work/work.service';
import { WorksService } from '../pages/work/list/works.service';

import { ProjectService } from '../pages/project/project.service';
import { ProjectsService } from '../pages/project/list/projects.service';
import { HomeService } from '../pages/home/home.service';
// import { HomesService } from '../pages/home/list/homes.service';

import { CheckPage } from '../pages/check/check';
import { ChecksPage } from '../pages/check/list/checks';
import { CheckService } from '../pages/check/check.service';
import { ChecksService } from '../pages/check/list/checks.service';

import { CategoryService } from '../pages/product/category/category.service';
import { CategoriesService } from '../pages/product/category/list/categories.service';
import { AccountService } from '../pages/cash/move/account/account.service';
import { AccountsService } from '../pages/cash/move/account/list/accounts.service';
import { WarehouseService } from '../pages/stock/warehouse/warehouse.service';
import { WarehousesService } from '../pages/stock/warehouse/list/warehouses.service';
import { ViewService } from '../pages/report/view/view.service';
import { ReportService } from '../pages/report/report.service';
import { ReportsService } from '../pages/report/list/reports.service';
// import { SaleDashboardService } from '../pages/sale/dashboard/sale-dashboard.service';
import { CurrencyService } from '../pages/currency/currency.service';
import { PlannedService } from '../pages/planned/list/planned-list.service';
import { PaymentConditionService } from '../pages/payment-condition/payment-condition.service';
import { ConfigService } from '../pages/config/config.service';
import { IonicStorageModule } from '@ionic/storage';

import { LanguageService } from '../providers/language/language.service';

// Ionic Native Plugins
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NativeStorage } from '@ionic-native/native-storage';
// import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
// import { Geolocation } from '@ionic-native/geolocation';
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Camera } from '@ionic-native/camera';
// import { Crop } from '@ionic-native/crop';

import { TextToSpeech } from '@ionic-native/text-to-speech';
import { RestProvider } from '../providers/rest/rest';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
Pro.init('963757e3', {
  appVersion: '1.11.2'
})
@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

@NgModule({
  declarations: [
    MyApp,
    // TabsPage,
    // SaleTabsPage,
    // FinancePage,
    ImporterPage,
// AgriculturePage,
    // TaskPage,
    // TasksPage,
    // TasksPopover,
    TabsNavigationPage,
    // AgriculturePage,
    AgroTabsPage,
    PersonTabsPage,
    SalePage,
    SalesPage,
    InvoicePage,
    InvoicePopover,
    InvoicesPage,
    InvoicesPopover,
    // CheckPage,
    // ChecksPage,
    // ChecksPopover,
    // PurchaseTabsPage,
    PurchasePage,
    PurchasePopover,
    PurchasesPage,
    ProductPage,
    ProductsPage,
    ProductsPopover,
    ContactPage,
    ContactsPage,
    ContactsPopover,
    DashboardPage,
    DashboardsPage,
    DashboardsPopover,
    AdvancePage,
    AdvancesPage,
    AdvancesPopover,
    SalaryPage,
    SalarysPage,
    SalarysPopover,
    // ProjectPage,
    // ProjectsPage,
    // ProjectsPopover,
    TitlePage,
    TitlesPage,
    TitlesPopover,
    AccountCategoryPage,
    AccountCategorysPage,
    AccountCategorysPopover,
    ActivityPage,
    ActivitysPage,
    // ActivitysPopover,
    HelpPage,
    HelpsPage,
    CashPage,
    CashListPage,
    CashListPopover,
    CashMovePage,
    CashMoveListPage,
    CashMoveListPopover,
    AreaPage,
    AreasPage,
    AreasPopover,
    CropPage,
    CropsPage,
    CropsPopover,
    MachinePage,
    MachinesPage,
    MachinesPopover,
    AnimalPage,
    AnimalsPage,
    AnimalsPopover,
    // RecurentPage,
    // RecurentListPage,
    // RecurentListPopover,
    StockMovePage,
    StockMoveListPage,
    StockMoveListPopover,
    ReceiptPage,
    ReceiptsPage,
    ReceiptsPopover,
    SalesPopover,
    SalePopover,
    PurchasesPopover,
    ServicesPopover,
    ServicePage,
    ServicesPage,
    ServicePopover,
    ServiceEquipmentPage,
    ServiceInputPage,
    SalaryInputPage,
    ServiceWorkPage,
    DashboardFilterPage,
    ServiceTravelPage,
    ConfigInvoicePage,
    UserPage,

    WorksPopover,
    WorkPage,
    WorksPage,
    WorkFieldPage,

    ProjectPage,
    ProjectsPage,
    CheckPage,
    ChecksPage,
    HomePage,
    // HomesPage,
    CategoryPage,
    CategoriesPage,
    AccountPage,
    AccountsPage,
    WarehousePage,
    WarehousesPage,
    WarehousesPopover,
    ViewPage,
    ReportPage,
    ReportsPage,
    // SaleDashboardPage,
    // PurchaseDashboardPage,
    ReportsPopover,
    ReportSalePage,
    ReportPurchasePage,
    CashFlowPage,
    ResultPage,
    BalancePage,
    AccountsReportPage,
    LoginPage,
    CurrencyPage,
    CurrencyListPage,
    PaymentConditionPage,
    PaymentConditionListPage,
    // PlannedPage,
    PlannedListPage,
    ConfigPage,


    //custom components
    PreloadImage,
    // BackgroundImage,
    // ShowHideContainer,
    // ShowHideInput,
    // ColorRadio,
    // CounterInput,
    // Rating,
    //GoogleMap
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
			modalEnter: 'modal-slide-in',
			modalLeave: 'modal-slide-out',
			pageTransition: 'ios-transition',
			swipeBackEnabled: false
		}),
    // SuperTabsModule.forRoot(),
    IonicStorageModule.forRoot(),
		TranslateModule.forRoot({
    loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		ValidatorsModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    // TabsPage,
    // SaleTabsPage,
    // PurchaseTabsPage,
    // FinancePage,
    ImporterPage,
    // AgriculturePage,
    // TaskPage,
    // TasksPage,
    // TasksPopover,
    TabsNavigationPage,
    AgroTabsPage,
    PersonTabsPage,
    // AgriculturePage,
    SalePage,
    SalesPage,
    SalesPopover,
    SalePopover,
    InvoicePage,
    InvoicePopover,
    InvoicesPage,
    InvoicesPopover,

    // CheckPage,
    // ChecksPage,
    // ChecksPopover,

    ProductsPopover,
    PurchasePage,
    PurchasePopover,
    PurchasesPage,
    PurchasesPopover,
    ProductPage,
    ProductsPage,
    ContactPage,
    ContactsPage,
    ContactsPopover,
    DashboardPage,
    DashboardsPage,
    DashboardsPopover,
    AdvancePage,
    AdvancesPage,
    AdvancesPopover,
    SalaryPage,
    SalarysPage,
    SalarysPopover,
    // ProjectPage,
    // ProjectsPage,
    // ProjectsPopover,
    TitlePage,
    TitlesPage,
    TitlesPopover,
    AccountCategoryPage,
    AccountCategorysPage,
    AccountCategorysPopover,
    ActivityPage,
    ActivitysPage,
    // ActivitysPopover,
    HelpPage,
    HelpsPage,
    CashPage,
    CashListPage,
    CashListPopover,
    CashMovePage,
    CashMoveListPage,
    CashMoveListPopover,
    AreaPage,
    AreasPage,
    AreasPopover,
    CropPage,
    CropsPage,
    CropsPopover,
    MachinePage,
    MachinesPage,
    MachinesPopover,
    AnimalPage,
    AnimalsPage,
    AnimalsPopover,
    // RecurentPage,
    // RecurentListPage,
    // RecurentListPopover,
    StockMovePage,
    StockMoveListPage,
    StockMoveListPopover,
    ReceiptPage,
    ReceiptsPage,
    ReceiptsPopover,

    ServicePage,
    ServicePopover,
    ServicesPage,
    ServicesPopover,
    ServiceEquipmentPage,
    ServiceInputPage,
    SalaryInputPage,
    ServiceWorkPage,
    DashboardFilterPage,
    ServiceTravelPage,
    ConfigInvoicePage,
    UserPage,
    WorkPage,
    WorksPage,
    WorksPopover,
    WorkFieldPage,

    ProjectPage,
    ProjectsPage,
    CheckPage,
    ChecksPage,
    HomePage,
    // HomesPage,
    CategoryPage,
    CategoriesPage,
    AccountPage,
    AccountsPage,
    WarehousePage,
    WarehousesPage,
    WarehousesPopover,
    ViewPage,
    ReportPage,
    ReportsPage,
    ReportsPopover,
    // SaleDashboardPage,
    // PurchaseDashboardPage,
    ReportSalePage,
    ReportPurchasePage,
    CashFlowPage,
    ResultPage,
    BalancePage,
    AccountsReportPage,
    LoginPage,
    CurrencyPage,
    CurrencyListPage,
    // PlannedPage,
    PlannedListPage,
    PaymentConditionPage,
    PaymentConditionListPage,
    ConfigPage,

  ],

  providers: [
    { provide: LOCALE_ID, useValue: 'es-PY' },
    LoginService,
    TextToSpeech,
    RestProvider,
    SpeechRecognition,
    BluetoothSerial,
    Printer,
    PouchdbService,
    SaleService,
    SalesService,
    FormatService,
    InvoiceService,
    InvoicesService,
    // CheckService,
    // ChecksService,
    // TaskService,
    // TasksService,
    PurchaseService,
    PurchasesService,
    ProductService,
    ProductsService,
    ContactService,
    ContactsService,
    DashboardService,
    DashboardsService,
    AdvanceService,
    AdvancesService,
    SalaryService,
    SalarysService,
    // ProjectService,
    // ProjectsService,
    TitleService,
    TitlesService,
    AccountCategoryService,
    AccountCategorysService,
    ActivityService,
    ActivitysService,
    HelpService,
    HelpsService,
    Base64,
    File,
    FilePath,
    FileChooser,
    CashService,
    CashListService,
    CashMoveService,
    CashMoveListService,
    AreaService,
    AreasService,
    CropService,
    CropsService,
    MachineService,
    MachinesService,
    AnimalService,
    AnimalsService,
    // RecurentService,
    // RecurentListService,
    StockMoveService,
    StockMoveListService,
    ReceiptService,
    ReceiptsService,
    ServiceService,
    ServicesService,
    WorkService,
    WorksService,
    ProjectService,
    ProjectsService,
    CheckService,
    ChecksService,
    HomeService,
    // HomesService,
    CategoryService,
    AccountService,
    AccountsService,
    WarehouseService,
    WarehousesService,
    ViewService,
    CategoriesService,
    ReportService,
    ReportsService,
    // SaleDashboardService,
    // PurchaseDashboardService,
    CurrencyService,
    PlannedService,
    PaymentConditionService,
    ConfigService,

    //Template
    LanguageService,

    //ionic native plugins
	  SplashScreen,
	  StatusBar,
    SocialSharing,
    NativeStorage,
    // InAppBrowser,
    Keyboard,
    // Geolocation,
		//AdMobFree,
		// ImagePicker,
    // Camera,
		// Crop,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
      deps: [AppConfig],
      multi: true,
    },
     IonicErrorHandler,
     [{ provide: ErrorHandler, useClass: MyErrorHandler }]
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
