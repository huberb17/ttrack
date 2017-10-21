import { Component } from '@angular/core';

import { NavController, ModalController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import { TTrackAddress } from '../../app/domain-model/domain-model';
import { ChangeAddressModalPage } from '../work-day/modals/change-address-modal';
import { WorkdayService } from '../../app/services/workday.service';
import { GooglePlus } from 'ionic-native';

declare var gapi;

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public defaultStartAddress: TTrackAddress;
  public defaultEndAddress: TTrackAddress;
  private auth_code: string;
  private auth_token: string;
  
  constructor(public navCtrl: NavController,
      public modalCtrl: ModalController,
      private addrService: AddressService,
      private custService: CustomerService,
      private wdService: WorkdayService,
      private gdriveService: GdriveService) {
    
    this.defaultStartAddress = addrService.getDefaultStartAddress();
    this.defaultEndAddress = addrService.getDefaultEndAddress();

    this.addressSettingsCallback = this.addressSettingsCallback.bind(this);
    this.addrService.registSettingsCallback(this.addressSettingsCallback);

  }

  doGoogleLogin(){
    
    GooglePlus.login({
      'scopes': 'https://www.googleapis.com/auth/drive', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
      'webClientId': '452487708050-b3fl6dukhcr59ta22ku9el2mo5b4jl9q.apps.googleusercontent.com', //'452487708050-bv4qlfm7rk98sh36751vjdhog7ta2m1m.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
      'offline': true
    })
    .then(res => {
      console.log(res);
      this.auth_code = res['serverAuthCode'];

      var request = gapi.client.request({
        'path': '/oauth2/v4/token',
        'method': 'POST',
        'params': {'code': this.auth_code, 
            'client_id': '452487708050-b3fl6dukhcr59ta22ku9el2mo5b4jl9q.apps.googleusercontent.com',
            'client_secret': '5lBDA9qk8nkfS2INMf8tQiOH',
            'redirect_uri': '',
            'grant_type': 'authorization_code'
        },
        'headers': { },
        //    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        //},
        'body': {}});//multipartRequestBody});
      request.execute( (res) => { 
        console.log(res);
        this.auth_token = res['access_token'];
      });
    })
    .catch(err => console.log(err));
  }

  doGoogleLogout(){
    GooglePlus.logout()
    .then(res => console.log(res))
    .catch(err => console.log(err));
  }



  public changeStartAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addrService.getAddresses() });
    modal.onDidDismiss(data => {
      if (data) {
        this.addrService.setDefaultStartAddress(data.address);       
      }
    });
    modal.present();
  }

  public changeEndAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addrService.getAddresses() });
    modal.onDidDismiss(data => {
      if (data) {
        this.addrService.setDefaultEndAddress(data.address);       
      }
    });
    modal.present();
  }
  
  private addressSettingsCallback(defaultStartAddress: TTrackAddress,
            defaultEndAddress: TTrackAddress): void {
      this.defaultStartAddress = defaultStartAddress;
      this.defaultEndAddress = defaultEndAddress;
  }

  public syncCustomers(): void {
    this.gdriveService.uploadCustomers(this.custService.getCustomers());
  }

  public syncAddresses(): void {
    this.gdriveService.uploadAddresses(this.addrService.getAddresses());
  }

  public syncWorkdayHistory(): void {
    console.log(this.auth_token);
    this.gdriveService.uploadWorkdays(this.wdService.getWorkdayHistory(), this.auth_token);
  }
}
