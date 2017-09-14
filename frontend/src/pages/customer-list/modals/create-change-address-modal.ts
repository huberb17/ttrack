import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackAddress } from '../../../app/domain-model/domain-model'
import { AddressService } from "../../../app/services/address.service";

@Component({
  templateUrl: 'create-change-address-modal.html'
})
export class CreateOrChangeAddressModalPage {
    public address: TTrackAddress;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private addrCtrl: AddressService
    )
    { 
        this.address = Object.create(this.params.get('address'));
        if (this.address.id == null) {
            this.address.isActive = true;
        }
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveCustomer(): void {
        let data = { 'address': this.address}
        this.viewCtrl.dismiss(data);
    }
}