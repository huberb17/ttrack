import { Component, OnInit } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';
import { CustomerAtWorkday, TTrackAddress } from "../../../app/domain-model/domain-model";
import { DistanceService } from "../../../app/services/distance.service";


@Component({
  templateUrl: 'overule-distance-modal.html'
})
export class OveruleDistanceModalPage implements OnInit {
    public customer: CustomerAtWorkday;
    private tempDistance: number;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private distService: DistanceService
    )
    { 
        this.customer = this.params.get('customer');
        console.log(this.customer.address);
        this.tempDistance = this.customer.routeToCustomer.lengthInKm;
    }

    ngOnInit(): void {
        console.log('called onInit');
        console.log(this.customer.address);
        this.customer = this.params.get('customer');
        this.tempDistance = this.customer.routeToCustomer.lengthInKm;
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    saveDistance(): void {
        this.viewCtrl.dismiss(this.tempDistance);
    }

    getDistance(): void {
        this.distService.getDistance(
            this.getAddressString(this.customer.routeToCustomer.start),
            this.getAddressString(this.customer.routeToCustomer.end))
            .then(response => {
                if (typeof response !== 'undefined') {
                    this.tempDistance = response.value / 1000;
                }
                else {
                    this.tempDistance = 0;
                }
          });
    }

    private getAddressString(address: TTrackAddress): string {
    return address.street + ' ' + address.streetNumber +
      ',' + address.zipCode + ' ' + address.city;
  }
}