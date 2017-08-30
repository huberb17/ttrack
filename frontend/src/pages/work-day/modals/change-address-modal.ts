import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { TTrackAddress } from '../../../app/domain-model/domain-model'

@Component({
  templateUrl: 'change-address-modal.html'
})
export class ChangeAddressModalPage {
    public addresses: TTrackAddress[];

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController
    ) { 
        this.addresses = this.params.get('addresses');
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }
    
    useAddress(idx: number): void  {
        let data = {
            address: this.addresses[idx],
        }
        this.viewCtrl.dismiss(data);
    }
}