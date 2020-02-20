import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { AuthService } from "../services/auth.service";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Events } from '../services/events';
import { RestProvider } from "../services/rest/rest";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  validation_messages = {
    'phone': [
      { type: 'required', message: 'PHONE_IS_REQUIRED' }
    ]
  };

  constructor(
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public languageService: LanguageService,
    public authService: AuthService,
    public pouchdbService: PouchdbService,
    public events: Events,
    public restProvider: RestProvider,
  ) { }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      phone: new FormControl(undefined, Validators.required),
      document: new FormControl(),
      name_legal: new FormControl(),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  async doLogin(){
    if (this.loginForm.value.phone){
      let teste = await this.authService.login();
      console.log("teste", teste);
      this.authService.loggedIn.subscribe(async status => {
        console.log("status", status);
        if (status) {
          let data = await this.authService.getData();
          // this.contact_id = "contact."+data.currentUser.email;
          let contact:any = await this.pouchdbService.getDoc("contact."+data.currentUser.email, true);

          if (JSON.stringify(contact) == "{}"){
            this.getBase64Image(data.currentUser.photoURL,async (base64image) => {
              let createdDoc = await this.pouchdbService.createDoc({
                "_id": "contact."+data.currentUser.email,
                "name": data.currentUser.displayName,
                "name_legal": this.loginForm.value.name_legal,
                "address": "",
                "phone": this.loginForm.value.phone,
                "document": this.loginForm.value.document,
                "code": "#3",
                "section": "salary",
                "email": data.currentUser.email,
                "note": "",
                "customer": true,
                "supplier": true,
                "seller": false,
                "employee": false,
                "user": false,
                "user_details": {},
                "salary": null,
                "currency": {},
                "hire_date": null,
                "salaries": [],
                "advances": [],
                "fixed": true,
                "create_user": "",
                "create_time": "",
                "write_user": "larica",
                "write_time": new Date().toJSON(),
                "docType": "contact",
                "_attachments": {
                  "profile.png": {
                    "content_type": "image/png",
                    "data": base64image
                  }
                },
              })
              // this.contact = createdDoc;
              console.log("create contact", createdDoc);
              this.events.publish('login-success', {contact: createdDoc});
            });
          } else {
            console.log("logged contact", contact);
            this.events.publish('login-success', {contact: contact});
            // this.contact = contact;
          }
        // this.contact_name = data.currentUser.displayName;


          // this.loading.dismiss();

        }
      });
    } else {
      this.loginForm.controls.phone.markAsTouched();
      // console.log("login", this.loginForm.controls)
    }
  }

  getBase64Image(imgUrl, callback) {
    var img = new Image();
    // onload fires when the image is fully loadded, and has width and height
    img.onload = function(){
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL("image/png"),
          dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
      callback(dataURL); // the base64 string
    };
    // set attributes and src
    img.setAttribute('crossOrigin', 'anonymous'); //
    img.src = imgUrl;
  }

  changedDocument() {
    let dv = this.loginForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1) {
      this.getLegalName();
    }
  }

  getLegalName() {
    this.restProvider.getRucName(this.loginForm.value.document).then((data: any) => {
      if (data.name != 'HttpErrorResponse') {
        let dict = {
          'name_legal': data.name,
        }
        this.loginForm.patchValue(dict)
      }
    })
  }
}
