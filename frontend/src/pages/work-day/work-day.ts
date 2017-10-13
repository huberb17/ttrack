import { Component, OnInit } from '@angular/core';

import { ModalController, NavController, ToastController } from 'ionic-angular';

import { TTrackCustomer, TTrackAddress, CustomerAtWorkday, TTrackRoute } from '../../app/domain-model/domain-model';
import { CustomerService } from '../../app/services/customer.service';
import { AddressService } from '../../app/services/address.service';
import { AddCustomerModalPage } from './modals/add-customer-modal';
import { ChangeAddressModalPage } from './modals/change-address-modal';
import { DistanceService } from "../../app/services/distance.service";
import { OveruleDistanceModalPage } from "./modals/overule-distance-modal";
import { GdriveService } from "../../app/services/gdrive.service";
import { WorkdayService, Workday } from "../../app/services/workday.service";

@Component({
  selector: 'page-work-day',
  templateUrl: 'work-day.html'
})
export class WorkDayPage implements OnInit {
  public therapyDate: string;
  public isCreated: boolean;
  public isDayEmpty: boolean;
  public isDaySaved: boolean;
  public customersOfDay: CustomerAtWorkday[];
  public milage: number;
  
  private customerList: TTrackCustomer[];
  private addressList: TTrackAddress[];
  private startAddress: TTrackAddress;
  private endAddress: TTrackAddress;
  private lastRoute: TTrackRoute;

  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public toastCtrl: ToastController,
              private customerService: CustomerService,
              private addressService: AddressService,
              private distanceService: DistanceService,
              private workdayService: WorkdayService,
              private gdriveService: GdriveService) {
    this.isCreated = false;
    this.isDayEmpty = true;
    this.isDaySaved = true;
    this.customersOfDay = new Array<CustomerAtWorkday>();
    
    this.addressList = [];
    this.customerList = [];
    this.observeAddressChange = this.observeAddressChange.bind(this);
    this.addressService.registerAddressCallback(this.observeAddressChange);
    
    this.observeCustomerChange = this.observeCustomerChange.bind(this);
    this.customerService.registerCustomerCallback(this.observeCustomerChange);    

    this.observeWorkdayChange = this.observeWorkdayChange.bind(this);
    this.workdayService.registerWorkdayCallback(this.observeWorkdayChange);
    this.workdayService.reloadWorkday();
  }

  ngOnInit(): void {
    this.therapyDate = new Date().toISOString();
    this.startAddress = this.addressService.getHomeAddress();
    this.endAddress = this.addressService.getHomeAddress();
    this.lastRoute = new TTrackRoute();
  }

  createWorkDay(): void {
    this.customersOfDay = [];
    this.startAddress = this.addressService.getHomeAddress();
    this.endAddress = this.addressService.getHomeAddress();
    this.isCreated = true;
    this.isDayEmpty = true;
    this.isDaySaved = true;
  }

  getStartAddress(): string {
    return this.getAddressString(this.startAddress);
  }

  changeStartAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.startAddress = data.address;
        this.isDaySaved = false;
      }
    })
    modal.present();
  }

   getEndAddress(): string {
    return this.getAddressString(this.endAddress);
  }

  changeEndAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.endAddress = data.address;
        this.isDaySaved = false;
      }
    })
    modal.present();
  }

  addCustomer(): void {
    let modal = this.modalCtrl.create(AddCustomerModalPage, 
                  { customers: this.customerList });
    modal.onDidDismiss(data => {
      if (data)
      {
        console.log('this.customersOfDay.length: ' + this.customersOfDay.length)
        let lastCustomer = this.customersOfDay.length;
        console.log('this.startAdress: '+ this.startAddress);
        let startAdress = this.startAddress;
        if (lastCustomer != 0) {
          // this is not the first customer -> use the customers startAdress
          // for calculating the route
          startAdress = this.customersOfDay[lastCustomer-1].address;
        }
        let newCustomer = new CustomerAtWorkday(<TTrackCustomer> data);
        let route = new TTrackRoute();
        route.start = startAdress;
        route.end = newCustomer.address;
        newCustomer.routeToCustomer = route;
        this.distanceService.getDistance(this.getAddressString(newCustomer.routeToCustomer.start),
          this.getAddressString(newCustomer.routeToCustomer.end))
          .then(response => {
            if (typeof response !== 'undefined') {
              newCustomer.routeToCustomer.lengthInKm = response.value / 1000;
            }
            else {
              newCustomer.routeToCustomer.lengthInKm = 0;
            }
            this.customersOfDay.push(newCustomer);
            this.isDayEmpty = false;
            this.isDaySaved = false;
          });
        // TODO: this does not work -> why?
        console.log('Route to End (start): ' + newCustomer.address.street)
        this.lastRoute.start = newCustomer.address;
        console.log('Route to End (end): ' + this.endAddress.street)
        this.lastRoute.end = this.endAddress;
        this.distanceService.getDistance(this.getAddressString(this.lastRoute.start),
          this.getAddressString(this.lastRoute.end))
          .then(response => {
            if (typeof response !== 'undefined') {
              this.lastRoute.lengthInKm = response.value / 1000;
              console.log('Route to End (distance): ' + this.lastRoute.lengthInKm)
            }
            else {
              this.lastRoute.lengthInKm = 0;
            }
          }).catch(error => {
            console.log(error);
          }
        )
      }
    });
    modal.present();
  }

  removeCustomer(idx: number): void {
    this.customersOfDay.splice(idx, 1);
    if (this.customersOfDay.length == 0) {
      this.isDayEmpty = true;
    }
  }

  changeCustomerAddress(idx: number): void {
    // TODO change also rooute of customer!
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.customersOfDay[idx].address = data.address;
        this.isDaySaved = false;
        console.log(this.customersOfDay[idx].address);
      }
    })
    modal.present();
  }

  private getAddressString(address: TTrackAddress): string {
    return address.street + ' ' + address.streetNumber +
      ',' + address.zipCode + ' ' + address.city;
  }

  saveWorkday(): void {
    var workday = new Workday();
    workday.therapyDate = this.therapyDate;
    workday.milage = this.milage;
    workday.customersOfDay = this.customersOfDay;
    workday.startAddress = this.startAddress;
    workday.endAddress = this.endAddress;
    this.workdayService.saveWorkday(workday);

    let toast = this.toastCtrl.create({
      message: 'Arbeitstag gespeichert.',
      duration: 1000,
      position: 'bottom'
    })
    toast.present();

    this.isDaySaved = true;
  }

  submitWorkday(): void {
    var workday = new Workday();
    workday.therapyDate = this.therapyDate;
    workday.milage = this.milage;
    workday.customersOfDay = this.customersOfDay;
    workday.startAddress = this.startAddress;
    workday.endAddress = this.endAddress;
    this.workdayService.submitWorkday(workday);

    let toast = this.toastCtrl.create({
      message: 'Arbeitstag erfolgreich übernommen.',
      duration: 1000,
      position: 'bottom'
    })
    toast.present();

    this.customersOfDay = [];
    this.isDayEmpty = true;
    this.isDaySaved = true;
    this.isCreated = false;
  }

  deleteWorkday(): void {
    var workday = new Workday();
    this.workdayService.saveWorkday(workday);

    let toast = this.toastCtrl.create({
      message: 'Arbeitstag gelöscht.',
      duration: 1000,
      position: 'bottom'
    })
    toast.present();

    this.customersOfDay = [];
    this.isDayEmpty = true;
    this.isDaySaved = true;
    this.isCreated = false;
  }

  overuleDistance(idx: number): void {
    console.log('clicked overuleDistance with id: ' + idx);
    console.log(this.customersOfDay[idx].address);
    let modal = this.modalCtrl.create(OveruleDistanceModalPage, 
                  { customer: this.customersOfDay[idx] });
    modal.onDidDismiss(data => {
      if (data)
      {
        console.log(this.customersOfDay[idx].address);
        this.customersOfDay[idx].routeToCustomer.lengthInKm = data;
        this.isDaySaved = false;
      }
    })
    modal.present();
  }

  setToUnsaved() {
    this.isDaySaved = false;
  }

  private observeAddressChange(addressList: TTrackAddress[]): void {
    this.addressList = addressList;
    console.log('callback observeAddressChange called');
  }

  private observeCustomerChange(customerList: TTrackCustomer[]): void {
    this.customerList = customerList;
    console.log('callback observeCustomerChange called');
  }

  private observeWorkdayChange(workday: Workday): void {
    console.log(workday);
    if (workday.therapyDate === undefined) {
      this.therapyDate = new Date().toISOString();
      this.isCreated = false;
    }
    else {
      this.therapyDate = workday.therapyDate;
      this.isCreated = true;
    }
    this.milage = workday.milage;
    this.customersOfDay = workday.customersOfDay;
    if (this.customersOfDay.length > 0 ) {
      this.isDayEmpty = false;
    }
    else {
      this.isDayEmpty = true;
    }
    if (workday.startAddress === undefined) {
      this.startAddress = this.addressService.getHomeAddress();
    }
    else if (workday.startAddress.street === undefined) {
      this.startAddress = this.addressService.getHomeAddress();
    }
    else {
      this.startAddress = workday.startAddress;
    }
    if (workday.endAddress === undefined) {
      this.endAddress = this.addressService.getHomeAddress();
    }
    else if (workday.endAddress.street === undefined) {
      this.endAddress = this.addressService.getHomeAddress();
    }
    else {
      this.endAddress = workday.endAddress;
    }
  }
}
