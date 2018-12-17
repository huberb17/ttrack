import { Component } from '@angular/core';

import { NavController, AlertController, ModalController } from 'ionic-angular';
import { TTrackCustomer, TTrackAddress } from "../../app/domain-model/domain-model";
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { GdriveService } from "../../app/services/gdrive.service";
import { CreateOrChangeCustomerModalPage } from "./modals/create-change-customer-modal";
import { CreateOrChangeAddressModalPage } from "./modals/create-change-address-modal";

@Component({
  selector: 'page-customer-list',
  templateUrl: 'customer-list.html'
})
export class CustomerListPage {
  public customerData: string;
  public customers: TTrackCustomer[];
  public visibleCustomers: TTrackCustomer[];
  public addresses: TTrackAddress[];
  public showInactive: boolean;
  public isHistoryEmpty: boolean;
  
  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              private custService: CustomerService,
              private addrService: AddressService,
              private gdriveService: GdriveService) {
  
    this.customerData = "customers";
    this.showInactive = false;
    this.customers = [];
    this.visibleCustomers = [];
    this.addresses = [];
    this.observeAddressChange = this.observeAddressChange.bind(this);
    this.addrService.registerAddressCallback(this.observeAddressChange);
    this.addrService.reloadAddresses();

    this.observeCustomerChange = this.observeCustomerChange.bind(this);
    this.custService.registerCustomerCallback(this.observeCustomerChange);
    this.custService.reloadCustomers();

    //this.observeChangeHistoryChange = this.observeChangeHistoryChange.bind(this);
    this.gdriveService.registerUploadCallback(this.observeChangeHistoryChange);    
    this.gdriveService.reloadChangeHistory();
  }

  public doSync(): void {
    this.gdriveService.uploadChangeHistory();
  }

  reloadCustomerList(): void {
    console.log("[INFO - customer-lists.ts - reloadCustomerList]: " + 'show inactive ' +  this.showInactive);
    this.custService.reloadCustomers();
  }

  removeCustomer(idx: number): void {
    let confirm = this.alertCtrl.create({
      title: 'Kunden wirklich löschen?',
      message: 'Soll der Kunde wirklich aus dem System entfernt werden?',
      buttons: [
        {
          text: 'Löschen',
          handler: () => {
            this.custService.deleteCustomer(this.visibleCustomers[idx]);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            console.log("[INFO - customer-lists.ts - removeCustomer]: " + 'Abbrechen clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  changeCustomer(idx: number): void {
    let modal = this.modalCtrl.create(CreateOrChangeCustomerModalPage, 
                  { customer: this.visibleCustomers[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.custService.updateCustomer(data['customer'], data['customer'].id);
      }
    })
    modal.present();
  }

  createCustomer(): void {
    let modal = this.modalCtrl.create(CreateOrChangeCustomerModalPage, 
                  { customer: new TTrackCustomer() });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.custService.addCustomer(data['customer']);
      }
    })
    modal.present();
  }

  toggleCustomer(customer: TTrackCustomer): void {
    this.custService.toggleCustomer(customer);
  }

  changeAddress(idx: number): void {
    var id = this.addresses[idx].id;
    let modal = this.modalCtrl.create(CreateOrChangeAddressModalPage, 
                  { address: this.addresses[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.addrService.updateAddress(data['address'], id);
        this.addresses = this.addrService.getAddresses();
      }
    })
    modal.present();
  }

  createAddress(): void {
    let modal = this.modalCtrl.create(CreateOrChangeAddressModalPage, 
                  { address: new TTrackAddress() });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.addrService.addAddress(data['address']);
        this.addresses = this.addrService.getAddresses();
      }
    })
    modal.present();
  }

  removeAddress(idx: number): void {
    let confirm = this.alertCtrl.create({
      title: 'Adresse wirklich löschen?',
      message: 'Soll die Adresse wirklich aus dem System entfernt werden?',
      buttons: [
        {
          text: 'Löschen',
          handler: () => {
            this.addresses = this.addrService.deleteAddress(this.addresses[idx]);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            console.log("[INFO - customer-lists.ts - removeAddress]: " + 'Abbrechen clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  private observeAddressChange(addressList: TTrackAddress[]): void {
    this.addresses = addressList;
  }

  private observeCustomerChange(customerList: TTrackCustomer[]): void {
    this.customers = customerList;
    this.visibleCustomers = [];
    for (var cust of this.customers) {
      if (this.showInactive) {
        this.visibleCustomers.push(cust);
      }
      else {
        if (cust.isActive) this.visibleCustomers.push(cust);
      }
    }
  }

  private observeChangeHistoryChange = (isHistoryEmpty: boolean) => {
    console.log("[INFO - customer-lists.ts - observeChangeHistoryChange]: " + 'observed gdrive change: %s', isHistoryEmpty);
    this.isHistoryEmpty = isHistoryEmpty;
  }
}
