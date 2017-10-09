import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackAddress } from '../../../app/domain-model/domain-model'
import { AddressService } from "../../../app/services/address.service";

@Component({
  templateUrl: 'choose-address-modal.html'
})
export class ChooseAddressModalPage {
    public addressList: TTrackAddress[];

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private addrCtrl: AddressService
    )
    { 
        this.addressList = this.addrCtrl.getAddresses();
        
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    selectAddress(idx: number): void {
        let data = { 'address': this.addressList[idx] };
        this.viewCtrl.dismiss(data);
    }
}