import { Component } from '@angular/core';

import { NavController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import { TTrackAddress, TTrackCustomer } from '../../app/domain-model/domain-model';
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
      private alertCtrl: AlertController,
      private toastCtrl: ToastController,
      private addrService: AddressService,
      private custService: CustomerService,
      private wdService: WorkdayService,
      private gdriveService: GdriveService) {
    
    this.defaultStartAddress = addrService.getDefaultStartAddress();
    this.defaultEndAddress = addrService.getDefaultEndAddress();

    this.addressSettingsCallback = this.addressSettingsCallback.bind(this);
    this.addrService.registSettingsCallback(this.addressSettingsCallback);

    this.getAddressesFromGdriveCallback = this.getAddressesFromGdriveCallback.bind(this);
    this.getCustomersFromGdriveCallback = this.getCustomersFromGdriveCallback.bind(this);

  }

  public doGoogleLogout(){
    this.gdriveService.logout();
  }

  public doGoogleLogin(){
    this.gdriveService.tryLogin( (res) => console.log(res) );
  }

  public getCustomerData(): void {
    let confirm = this.alertCtrl.create({
      title: 'Kundendaten überschreiben?',
      message: 'Sollen die Kundendaten wirklich überschrieben werdden?',
      buttons: [
        {
          text: 'Überschreiben',
          handler: () => {
            this.gdriveService.getCustomerDataFromDrive(this.getCustomersFromGdriveCallback);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            console.log('get CustomerData canceled');
          }
        }
      ]
    });
    confirm.present();
  }

  public getAddressData(): void {
    let confirm = this.alertCtrl.create({
      title: 'Adressdaten überschreiben?',
      message: 'Sollen die Adressdaten wirklich überschrieben werdden?',
      buttons: [
        {
          text: 'Überschreiben',
          handler: () => {
            this.gdriveService.getAddressDataFromDrive(this.getAddressesFromGdriveCallback);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            console.log('get CustomerData canceled');
          }
        }
      ]
    });
    confirm.present();
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

  public getDefaultStartAddress(): string {
    return TTrackAddress.toString(this.defaultStartAddress);
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

  public getDefaultEndAddress(): string {
    return TTrackAddress.toString(this.defaultEndAddress);
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

  private getAddressesFromGdriveCallback(addresses: TTrackAddress[]): void {
    console.log('settings.ts - 148: ' + JSON.stringify(addresses));
    if (addresses) {
      if (addresses.length > 0) {
        this.addrService.overwriteAddresses(addresses);
        let toast = this.toastCtrl.create({
          message: 'Daten erfolgreich übernommen.',
          duration: 1000,
          position: 'bottom'
      })
      toast.present();
      }
    }
  }

  private getCustomersFromGdriveCallback(customers: TTrackCustomer[]): void {
    console.log('settings.ts - 163: ' + JSON.stringify(customers));
    if (customers) {
      if (customers.length > 0) {
        this.custService.overwriteCustomers(customers);
        let toast = this.toastCtrl.create({
          message: 'Daten erfolgreich übernommen.',
          duration: 1000,
          position: 'bottom'
      })
      toast.present();
      }
    }
    
  }
}
