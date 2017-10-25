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
        this.tempDistance = this.customer.routeToCustomer.lengthInKm;
        this.distanceCallback = this.distanceCallback.bind(this);
    }

    ngOnInit(): void {
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
        this.distService.calculateRoute(this.customer.routeToCustomer, this.distanceCallback, 0);
    }

    private distanceCallback(dummy: number, distance: number): void {
        var distanceInKm = Math.round(distance / 10) / 100;
        this.tempDistance = distanceInKm;
    }
}