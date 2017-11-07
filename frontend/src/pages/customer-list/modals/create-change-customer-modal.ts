import { Component } from '@angular/core';

import { Platform, NavParams, ViewController, ModalController } from 'ionic-angular';

import { TTrackCustomer, TTrackAddress, TTrackIncome } from '../../../app/domain-model/domain-model'
import { CustomerService } from "../../../app/services/customer.service";
import { CreateOrChangeAddressModalPage } from "./create-change-address-modal";
import { ChooseAddressModalPage } from "./choose-address-modal";
import { AddressService } from '../../../app/services/address.service';

@Component({
  templateUrl: 'create-change-customer-modal.html'
})
export class CreateOrChangeCustomerModalPage {
    public customer: TTrackCustomer;
    public isCreateNew;
    public hasAddress;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        private custCtrl: CustomerService,
        private addrService: AddressService
    )
    { 
        this.isCreateNew = false;
        var oldCust = this.params.get('customer');
        console.log(oldCust);
        if (oldCust.address === undefined) {
            this.customer = oldCust;
            this.hasAddress = false;
            this.customer.invoiceConfiguration = new TTrackIncome();
            this.customer.invoiceConfiguration.textForReport = "";
            this.customer.invoiceConfiguration.value = 450;
        }
        else {
            this.customer = new TTrackCustomer();
            this.customer.id = oldCust.id;
            this.customer.firstName = oldCust.firstName;
            this.customer.lastName = oldCust.lastName;
            this.customer.isActive = oldCust.isActive;
            this.customer.title = oldCust.title;
            this.customer.address = oldCust.address;           
            if (oldCust.invoiceConfiguration === undefined) {
                this.customer.invoiceConfiguration = new TTrackIncome();
                this.customer.invoiceConfiguration.textForReport = this.customer.firstName + " " + this.customer.lastName;
                this.customer.invoiceConfiguration.value = 450;
            }
            else {
                this.customer.invoiceConfiguration = oldCust.invoiceConfiguration;
            }
            this.hasAddress = true;
        }
        console.log(this.customer);
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveCustomer(): void {
        console.log('save customer')
        console.log(this.customer);
        let data = { 'customer': this.customer}
        this.viewCtrl.dismiss(data);
    }

    createAddress(): void {
        //this.customer.address = new TTrackAddress();
        //this.isCreateNew = true;
        let modal = this.modalCtrl.create(CreateOrChangeAddressModalPage, 
            { address: new TTrackAddress() });
        modal.onDidDismiss(data => {
            if (data)
            {
                console.log('new adderss created');
                console.log(data);
                this.customer.address = data['address'];
                console.log(this.customer);
                this.addrService.addAddress(data['address']);
                this.hasAddress = true;
            }
        });
        modal.present();
    }

    chooseAddress(): void {
        let modal = this.modalCtrl.create(ChooseAddressModalPage);
        modal.onDidDismiss(data => {
            if (data)
            {
                console.log('adderss chosen');
                console.log(data);
                console.log(data['address']);
                this.customer.address = data['address'];
                console.log(this.customer);
                this.hasAddress = true;
            }
        });
        modal.present();

    }
}