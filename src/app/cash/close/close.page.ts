import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-close',
  templateUrl: './close.page.html',
  styleUrls: ['./close.page.scss'],
})
export class ClosePage implements OnInit {

  closeForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  amount_theoretical;

  constructor(
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public route: ActivatedRoute,
  ) {
    this.amount_theoretical = this.route.snapshot.paramMap.get('amount_theoretical');
  }

  ngOnInit() {
    this.closeForm = this.formBuilder.group({
      name: new FormControl(''),
      amount_theoretical: new FormControl(this.amount_theoretical),
      amount_physical: new FormControl(),
      amount_difference: new FormControl(0),
      _id: new FormControl(''),
    });
  }

}
