import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { GdriveService } from "../../app/services/gdrive.service";
import CryptoJS from 'crypto-js'

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public needsSync: boolean;
  public addressSync: boolean;

  constructor(public navCtrl: NavController,
      private addrService: AddressService,
      private gdriveService: GdriveService) {
    this.addressSync = this.addrService.getSyncState();
    if (this.addressSync) {
      this.needsSync = true;
    }
    console.log('Some data needs upload: ' + this.needsSync)
    this.addressSyncRequestCallback = this.addressSyncRequestCallback.bind(this);
    this.addrService.registerStateCallback(this.addressSyncRequestCallback);
  }

  private addressSyncRequestCallback(): void {
    console.log("addressService requires synchronization");
    this.addressSync = true;
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
    
    this.needsSync = this.addressSync;;
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
