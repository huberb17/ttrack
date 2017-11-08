import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackCustomer } from '../../../app/domain-model/domain-model'

@Component({
  templateUrl: 'add-customer-modal.html'
})
export class AddCustomerModalPage {
    public customers: TTrackCustomer[];

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController
    )
    { 
        this.customers = this.params.get('customers');
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    useCustomer(idx: number): void {
        // clone the object
        let custString = JSON.stringify(this.customers[idx]);
        this.viewCtrl.dismiss(JSON.parse(custString));
    }
}