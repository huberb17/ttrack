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
        console.log("[INFO - create-change-customer-modal.ts - Constructor]: oldCustomer: " + JSON.stringify(oldCust));
        if (oldCust.address === undefined) {
            this.customer = oldCust;
            this.hasAddress = false;
            this.customer.invoiceConfiguration = new TTrackIncome();
            this.customer.invoiceConfiguration.textForReport = "";
            this.customer.invoiceConfiguration.value = 450;
        }
        else {
            this.customer = this.custCtrl.createCustomerCopy(oldCust);
            this.hasAddress = true;
        }
        console.log("[INFO - create-change-customer-modal.ts - Constructor]: customer: " + JSON.stringify(this.customer));
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveCustomer(): void {
        console.log("[INFO - create-change-customer-modal.ts - saveCustomer]: customer: " + JSON.stringify(this.customer));
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
                console.log("[INFO - create-change-customer-modal.ts - createAddress]: new adderss created" + JSON.stringify(data));
                this.customer.address = data['address'];
                console.log("[INFO - create-change-customer-modal.ts - createAddress]: customer: " + JSON.stringify(this.customer));
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
                console.log("[INFO - create-change-customer-modal.ts - chooseAddress]: address: " + JSON.stringify(data['address']));
                this.customer.address = data['address'];
                console.log("[INFO - create-change-customer-modal.ts - chooseAddress]: customer: " + JSON.stringify(this.customer));
                this.hasAddress = true;
            }
        });
        modal.present();

    }
}