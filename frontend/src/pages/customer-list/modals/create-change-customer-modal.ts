import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackCustomer, TTrackAddress } from '../../../app/domain-model/domain-model'
import { CustomerService } from "../../../app/services/customer.service";

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
        private custCtrl: CustomerService
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
        this.customer.address = new TTrackAddress();
        this.hasAddress = true;
        this.isCreateNew = true;
    }

    chooseAddress(): void {

    }
}