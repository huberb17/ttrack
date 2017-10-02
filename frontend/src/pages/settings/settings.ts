import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public needsSync: boolean;

  constructor(public navCtrl: NavController,
    private addrService: AddressService) {
    this.needsSync = this.addrService.getSyncState();
    console.log('AddressService needsUpload: ' + this.needsSync)
    this.addressSyncRequestCallback = this.addressSyncRequestCallback.bind(this);

    this.addrService.registerCallback(this.addressSyncRequestCallback);
  }

  private addressSyncRequestCallback(): void {
    console.log("addressService requires synchronization");
    this.needsSync = true;
  }

  private doSync(): void {
    console.log('mock: do sync');
    this.addrService.markUploadCompleted();
    this.needsSync = this.needsSync = this.addrService.getSyncState();
  }
}
