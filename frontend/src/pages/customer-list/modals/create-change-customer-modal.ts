import { Component } from '@angular/core';

import { Platform, NavParams, ViewController, ModalController } from 'ionic-angular';

import { TTrackCustomer, TTrackAddress } from '../../../app/domain-model/domain-model'
import { CustomerService } from "../../../app/services/customer.service";
import { CreateOrChangeAddressModalPage } from "./create-change-address-modal";
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
        this.customer = Object.create(this.params.get('customer'));
        if (this.customer.address == null) {
            console.log('null address found');
            this.hasAddress = false;
        }
        else {
            this.hasAddress = true;
        }
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveCustomer(): void {
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
                    this.customer.address = data['address'];
                    this.addrService.addAddress(data['address']);
                    this.hasAddress = true;
                    console.log(this.customer);
                    console.log(this.addrService.getAddresses());
                }
            })
        modal.present();
    }

    chooseAddress(): void {

    }
}