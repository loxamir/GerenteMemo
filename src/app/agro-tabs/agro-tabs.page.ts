import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";

@Component({
  selector: 'app-agro-tabs',
  templateUrl: './agro-tabs.page.html',
  styleUrls: ['./agro-tabs.page.scss'],
})
export class AgroTabsPage implements OnInit {

  constructor(
    public translate: TranslateService,
    public languageService: LanguageService,
  ) { }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

}
