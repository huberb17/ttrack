import { Component } from '@angular/core';

import { NavController, AlertController, ModalController } from 'ionic-angular';
import { TTrackCustomer, TTrackAddress } from "../../app/domain-model/domain-model";
import { AddressService } from "../../app/services/address.service";
import { CustomerService } from "../../app/services/customer.service";
import { CreateOrChangeCustomerModalPage} from "./modals/create-change-customer-modal";

@Component({
  selector: 'page-customer-list',
  templateUrl: 'customer-list.html'
})
export class CustomerListPage {
  public customerData:string;
  public customers: TTrackCustomer[];
  public addresses: TTrackAddress[];

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              private custService: CustomerService,
              private addrService: AddressService) {
    this.customerData="customers";
    this.customers = this.custService.getCustomers();
    this.addresses = this.addrService.getAddresses();
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
    let modal = this.modalCtrl.create(CreateOrChangeCustomerModalPage, 
                  { customer: this.customers[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.customers = this.custService.getCustomers();
      }
    })
    modal.present();
  }

  createCustomer(): void {
    let modal = this.modalCtrl.create(CreateOrChangeCustomerModalPage, 
                  { });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.customers = this.custService.getCustomers();
      }
    })
    modal.present();
  }

  toggleCustomer(idx: number): void {
    this.custService.toggleCustomer(this.customers[idx]);
  }
}
