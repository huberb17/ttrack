import { Component } from '@angular/core';

import { NavController, AlertController, ModalController } from 'ionic-angular';
import { TTrackCustomer, TTrackAddress } from "../../app/domain-model/domain-model";
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
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

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              private custService: CustomerService,
              private addrService: AddressService) {
  
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

  }

  reloadCustomerList(): void {
    console.log('show inactive ' +  this.showInactive);
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
            this.customers = this.custService.deleteCustomer(this.customers[idx]);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            console.log('Abbrechen clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  changeCustomer(idx: number): void {
    console.log('pressed customer edit with idx '  + idx);
    let modal = this.modalCtrl.create(CreateOrChangeCustomerModalPage, 
                  { customer: this.customers[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        console.log(data);
        this.custService.updateCustomer(data['customer'], data['customer'].id);
        this.customers = this.custService.getCustomers();
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
        this.customers = this.custService.getCustomers();
      }
    })
    modal.present();
  }

  toggleCustomer(idx: number): void {
    this.custService.toggleCustomer(this.customers[idx]);
  }

  changeAddress(idx: number): void {
    console.log('pressed address edit with idx '  + idx);
    var id = this.addresses[idx].id;
    let modal = this.modalCtrl.create(CreateOrChangeAddressModalPage, 
                  { address: this.addresses[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        console.log('edit address with idx '  + idx);
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
            console.log('Abbrechen clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  private observeAddressChange(addressList: TTrackAddress[]): void {
    this.addresses = addressList;
    console.log('callback observeAddressChange called');
    console.log(this.addresses);
    for (var cust of this.customers) {
      for (var addr of this.addresses) {
        if (cust.address) {
          if (cust.address.id == addr.id) {
            cust.address = addr;
          }
        }
      }
    }
  }

  private observeCustomerChange(customerList: TTrackCustomer[]): void {
    this.customers = customerList;
    this.visibleCustomers = [];
    console.log('callback observeCustomerChange called');
    console.log(this.customers);
    for (var cust of this.customers) {
      for (var addr of this.addresses) {
        if (cust.address) {
          if (cust.address.id == addr.id) {
            cust.address = addr;
          }
        }
      }
      if (this.showInactive) {
        this.visibleCustomers.push(cust);
      }
      else {
        if (cust.isActive) this.visibleCustomers.push(cust);
      }
    }
  }
}
