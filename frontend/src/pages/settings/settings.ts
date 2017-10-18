import { Component } from '@angular/core';

import { NavController, ModalController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import { TTrackAddress } from '../../app/domain-model/domain-model';
import { ChangeAddressModalPage } from '../work-day/modals/change-address-modal';
import { WorkdayService } from '../../app/services/workday.service';

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
}
