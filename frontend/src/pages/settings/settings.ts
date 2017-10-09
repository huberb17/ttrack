import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import CryptoJS from 'crypto-js'

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public needsSync: boolean;
  public addressSync: boolean;
  public customerSync: boolean;
  // not implemented so far
  public workdaySync: boolean;

  constructor(public navCtrl: NavController,
      private addrService: AddressService,
      private custService: CustomerService,
      private gdriveService: GdriveService) {
    this.addressSync = false;
    this.customerSync = false;
    this.workdaySync = false;
    this.needsSync = false;
    
    this.addressSyncRequestCallback = this.addressSyncRequestCallback.bind(this);
    this.addrService.registerStateCallback(this.addressSyncRequestCallback);
    this.addrService.getSyncState();

    this.customerSyncRequestCallback = this.customerSyncRequestCallback.bind(this);
    this.custService.registerCustomerCallback(this.customerSyncRequestCallback);
    this.custService.getSyncState();
  }

  private addressSyncRequestCallback(): void {
    console.log("addressService requires synchronization");
    this.addressSync = true;
    this.needsSync = true;
  }

  private customerSyncRequestCallback(): void {
    console.log("customerService requires synchronization");
    this.customerSync = true;
    this.needsSync = true;
  }

  private doSync(): void {
    console.log('mock: do sync');
    if (this.addressSync) {
      var jsonAddresses = JSON.stringify(this.addrService.getAddresses());
      var addressFileContent = this.encryptString(jsonAddresses);
      var fileName = Date.now().toString() + '_adresses.bin';
      this.gdriveService.uploadFile(fileName, addressFileContent);
      // TODO: how to get success of upload?
      this.addrService.markUploadCompleted();
      this.addressSync = this.addrService.getSyncState();
    }
    if (this.customerSync) {
      var jsonCustomers = JSON.stringify(this.custService.getCustomers());
      var customerFileContent = this.encryptString(jsonCustomers);
      var fileName = Date.now().toString() + '_customers.bin';
      this.gdriveService.uploadFile(fileName, customerFileContent);
      // TODO: how to get success of upload?
      this.custService.markUploadCompleted();
      this.customerSync = this.custService.getSyncState();
    }
    
    this.needsSync = this.addressSync || this.customerSync || this.workdaySync;
  }

  encryptString(plainText: string): string {
    console.log('The following will be enrypted: ' + plainText);
    var key = CryptoJS.enc.Latin1.parse('1234567890123456');
    var iv = CryptoJS.enc.Latin1.parse('1234567890123456');
    var encrypted = CryptoJS.AES.encrypt(plainText, key, { iv: iv });
    var result = encrypted.iv.toString() + encrypted.toString();
    console.log('iv + cipher: ' + result);
    return result;
  }
}
