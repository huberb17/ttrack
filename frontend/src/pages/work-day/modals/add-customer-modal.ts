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
        let newCustomer: TTrackCustomer = Object.create(this.customers[idx]);
        newCustomer.address = Object.create(this.customers[idx].address);
        this.viewCtrl.dismiss(newCustomer);
    }
}