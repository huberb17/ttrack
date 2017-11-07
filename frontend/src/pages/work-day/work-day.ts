import { Component, OnInit, NgZone, ViewChild } from '@angular/core';

import { ModalController, NavController, ToastController, Content, AlertController } from 'ionic-angular';

import { TTrackCustomer, TTrackAddress, CustomerAtWorkday, TTrackRoute, TTrackIncome } from '../../app/domain-model/domain-model';
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
  @ViewChild(Content) content: Content;
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
              private alertCtrl: AlertController,
              private zone: NgZone,
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

    this.observeSettingsChange = this.observeSettingsChange.bind(this);
    this.addressService.registSettingsCallback(this.observeSettingsChange);    

    this.observeCustomerChange = this.observeCustomerChange.bind(this);
    this.customerService.registerCustomerCallback(this.observeCustomerChange);    

    this.observeWorkdayChange = this.observeWorkdayChange.bind(this);
    this.workdayService.registerWorkdayCallback(this.observeWorkdayChange);
    this.workdayService.reloadWorkday();

    this.distanceCallback = this.distanceCallback.bind(this);
  }

  ngOnInit(): void {
    this.therapyDate = new Date().toISOString();
    this.startAddress = this.addressService.getDefaultStartAddress();
    this.endAddress = this.addressService.getDefaultEndAddress();
    this.lastRoute = new TTrackRoute();
  }

  createWorkDay(): void {
    this.customersOfDay = [];
    this.startAddress = this.addressService.getDefaultStartAddress();
    this.endAddress = this.addressService.getDefaultEndAddress();
    this.isCreated = true;
    this.isDayEmpty = true;
    this.isDaySaved = true;
    this.content.resize();
  }

  getStartAddress(): string {
    return this.startAddress.toString();
  }

  changeStartAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.startAddress = data.address;
        if (this.customersOfDay.length > 0) {
          this.customersOfDay[0].routeToCustomer.start = this.startAddress;
          this.distanceService.calculateRoute(this.customersOfDay[0].routeToCustomer, this.distanceCallback, 0);
        }
        this.isDaySaved = false;

      }
    })
    modal.present();
  }

   getEndAddress(): string {
    return this.endAddress.toString();
  }

  changeEndAddress(): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.endAddress = data.address;
        if (this.customersOfDay.length > 0) {
          this.lastRoute.end = this.endAddress;
          this.distanceService.calculateRoute(this.lastRoute, this.distanceCallback, this.customersOfDay.length);          
        }
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
        let newCustomer = new CustomerAtWorkday(<TTrackCustomer> data);
        newCustomer.invoice = new TTrackIncome();
        newCustomer.routeToCustomer = new TTrackRoute();
        newCustomer.routeToCustomer.end = newCustomer.address;
        this.customersOfDay.push(newCustomer);
        if (this.customersOfDay.length == 1) { // this is the first customer
          newCustomer.routeToCustomer.start = this.startAddress;
        }
        else {
          newCustomer.routeToCustomer.start = this.customersOfDay[this.customersOfDay.length - 2].address;
        }

        this.distanceService.calculateRoute(newCustomer.routeToCustomer, this.distanceCallback, this.customersOfDay.length-1);
        this.lastRoute.start = newCustomer.address;
        this.lastRoute.end = this.endAddress;
        this.distanceService.calculateRoute(this.lastRoute, this.distanceCallback, this.customersOfDay.length);
        this.isDayEmpty = false;
        this.isDaySaved = false;     
      }
    });
    modal.present();
  }

  removeCustomer(idx: number): void {
    this.customersOfDay.splice(idx, 1);
    if (this.customersOfDay.length == 0) {
      this.isDayEmpty = true;
      this.lastRoute.lengthInKm = 0;
    }
    else {
      if (idx == 0) {
        this.customersOfDay[idx].routeToCustomer.start = this.startAddress;
        this.distanceService.calculateRoute(this.customersOfDay[idx].routeToCustomer, this.distanceCallback, idx);
      }
      else if (idx == this.customersOfDay.length) {
        this.lastRoute.start = this.customersOfDay[idx-1].address;
        console.log(this.lastRoute);
        this.distanceService.calculateRoute(this.lastRoute, this.distanceCallback, idx);
      }
      else {
        this.customersOfDay[idx].routeToCustomer.start = this.customersOfDay[idx-1].address;
        this.distanceService.calculateRoute(this.customersOfDay[idx].routeToCustomer, this.distanceCallback, idx);
      }
    }
    this.isDaySaved = false;
  }

  changeCustomerAddress(idx: number): void {
    let modal = this.modalCtrl.create(ChangeAddressModalPage, 
                  { addresses: this.addressList });
    modal.onDidDismiss(data => {
      if (data)
      {
        this.customersOfDay[idx].address = data.address;
        this.customersOfDay[idx].routeToCustomer.end = data.address;
        this.distanceService.calculateRoute(this.customersOfDay[idx].routeToCustomer, this.distanceCallback, idx);
        if (idx == this.customersOfDay.length - 1) {
          this.lastRoute.start = data.address;
          this.distanceService.calculateRoute(this.lastRoute, this.distanceCallback, this.customersOfDay.length);
        }
        else {
          this.customersOfDay[idx+1].routeToCustomer.start = data.address;
          this.distanceService.calculateRoute(this.customersOfDay[idx+1].routeToCustomer, this.distanceCallback, idx+1);
        }
        this.isDaySaved = false;        
      }
    });
    modal.present();
  }

  changeInvoice(idx: number): void {
    if (this.customersOfDay[idx].invoice == null || this.customersOfDay[idx].invoice.value === undefined) {
      this.customersOfDay[idx].invoice = new TTrackIncome();
      this.customersOfDay[idx].invoice.value = this.customersOfDay[idx].invoiceConfiguration.value;
      this.customersOfDay[idx].invoice.textForReport = this.customersOfDay[idx].invoiceConfiguration.textForReport;
    }
    else {
      this.customersOfDay[idx].invoice.value = undefined;
    }
    this.isDaySaved = false;
  }

  hasInvoice(idx: number): boolean {
    console.log(this.customersOfDay[idx].invoice);
    return (this.customersOfDay[idx].invoice != null && this.customersOfDay[idx].invoice.value !== undefined);
  }

  getInvoiceValue(idx: number): number {
    return this.customersOfDay[idx].invoice.value;
  }

  setInvoiceValue(idx: number) {
    let alert = this.alertCtrl.create({
      title: 'Honorarnote',
      inputs: [
        {
          name: 'value',
          placeholder: 'Betrag'
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: data => {           
          }
        },
        {
          text: 'Speichern',
          handler: data => {
            let newValue = Number(data['value']);
            if (! isNaN(newValue))
            {
              this.customersOfDay[idx].invoice.value = newValue;
              this.isDaySaved = false;
            }
            else {
              let toast = this.toastCtrl.create({
                message: 'Eingabe ungültig!',
                duration: 1000,
                position: 'bottom'
              })
              toast.present();
            }
          }
        }
      ]
    });
    alert.present();
  }

  saveWorkday(): void {
    var workday = new Workday();
    workday.therapyDate = this.therapyDate;
    workday.milage = this.milage;
    workday.customersOfDay = this.customersOfDay;
    workday.startAddress = this.startAddress;
    workday.endAddress = this.endAddress;
    workday.lastRoute = this.lastRoute;
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
    workday.lastRoute = this.lastRoute;
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
    console.log(this.lastRoute);
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
      this.startAddress = this.addressService.getDefaultStartAddress();
    }
    else if (workday.startAddress.street === undefined) {
      this.startAddress = this.addressService.getDefaultStartAddress();
    }
    else {
      this.startAddress = workday.startAddress;
    }
    if (workday.endAddress === undefined) {
      this.endAddress = this.addressService.getDefaultEndAddress();
    }
    else if (workday.endAddress.street === undefined) {
      this.endAddress = this.addressService.getDefaultEndAddress();
    }
    else {
      this.endAddress = workday.endAddress;
    }
    if (this.customersOfDay.length == 0) {
      this.lastRoute.start = this.startAddress;
      this.lastRoute.end = this.endAddress;
      this.lastRoute.lengthInKm = 0;
    }
    else {
      this.lastRoute.start = this.customersOfDay[this.customersOfDay.length-1].address;
      this.lastRoute.end = this.endAddress;
      this.distanceService.calculateRoute(this.lastRoute, this.distanceCallback, this.customersOfDay.length);
    }
    this.content.resize();    
  }

  private observeSettingsChange(defaultStartAddress: TTrackAddress,
    defaultEndAddress: TTrackAddress): void {
    this.startAddress = defaultStartAddress;
    this.endAddress = defaultEndAddress;
  }

  private distanceCallback(idx: number, distance: number): void {
    this.zone.run( () => {
      var distanceInKm = Math.round(distance / 10) / 100;
      if (idx == this.customersOfDay.length) {
        this.lastRoute.lengthInKm = distanceInKm;
      }
      else {
        this.customersOfDay[idx].routeToCustomer.lengthInKm = distanceInKm;
      }
    });
  }

}
