import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ActivatedRoute, Router } from '@angular/router';
import { FormatService } from "../../services/format.service";

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

  closeForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;

  constructor(
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public formatService: FormatService,
  ) {
    this.amount_theoretical = this.route.snapshot.paramMap.get('amount_theoretical');
    this.accountMoves = this.route.snapshot.paramMap.get('accountMoves');
    this.cash_id = this.route.snapshot.paramMap.get('cash_id');
  }

  ngOnInit() {
    this.closeForm = this.formBuilder.group({
      name: new FormControl(''),
      amount_theoretical: new FormControl(this.amount_theoretical),
      amount_physical: new FormControl(),
      amount_difference: new FormControl(0),
      amount_open: new FormControl(0),
      amount_close: new FormControl(0),
      amount_income: new FormControl(0),
      amount_expense: new FormControl(0),
      cash_id: new FormControl(this.cash_id),
      accountMoves: new FormControl(this.accountMoves||[]),
      _id: new FormControl(''),
    });
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
      amount_open: 0,
      amount_close: this.closeForm.value.amount_physical-0,
      amount_income: amount_income,
      amount_expense: amount_expense,
    })
  }

}
