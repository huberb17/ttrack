import { Component } from '@angular/core';

import { NavController, ModalController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import { TTrackAddress } from '../../app/domain-model/domain-model';
import { ChangeAddressModalPage } from '../work-day/modals/change-address-modal';
import { WorkdayService } from '../../app/services/workday.service';

declare var gapi;

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public defaultStartAddress: TTrackAddress;
  public defaultEndAddress: TTrackAddress;
  
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

  doGoogleLogout(){
    this.gdriveService.logout();
    //GooglePlus.logout();
  }

  doGoogleLogin(){
    this.gdriveService.tryLogin( (res) => console.log(res) );
    // GooglePlus.login( {
    //   'scopes': 'https://www.googleapis.com/auth/drive',
    //   'webClientId': '894125857880-7bj3f8ttc59i021vmi9qnn0mhc4s34v4.apps.googleusercontent.com', //gdriveWrapper.CLIENT_ID,
    //   'offline': true
    // }).then(function (user) {
    //   console.log(JSON.stringify(user));
    //   alert(JSON.stringify(user))
    // }, function (error) {
    //   console.log(JSON.stringify(error));
    //   alert(JSON.stringify(error))
    // });
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
    this.gdriveService.uploadWorkdays(this.wdService.getWorkdayHistory());
  }

  public reload(): void {
    var lastPage = this.navCtrl.last;
    window.location.reload();
    this.navCtrl.push(lastPage);
  }
}
