import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackCustomer } from '../../../app/domain-model/domain-model'
import { CustomerService } from "../../../app/services/customer.service";

@Component({
  templateUrl: 'create-change-customer-modal.html'
})
export class CreateOrChangeCustomerModalPage {
    public customer: TTrackCustomer;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private custCtrl: CustomerService
    )
    { 
        this.customer = new TTrackCustomer;
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveCustomer(): void {
        this.custCtrl.saveCustomer(this.customer);
        this.viewCtrl.dismiss(this.customer);
    }
}