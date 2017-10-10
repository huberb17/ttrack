import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TTrackCustomer, TTrackAddress } from '../domain-model/domain-model';
import { AddressService } from "../../app/services/address.service";

class CustomerServiceState {
    public needsUpload: boolean;
    public constructor() {
        this.needsUpload = false;
    }
    public initializeState() {
        this.needsUpload = false;
    }
}


@Injectable()
export class CustomerService {
    private customerList: TTrackCustomer[];
    private storage: Storage;
    private stateObservers;
    private customerObservers;
    private state: CustomerServiceState;
    
    public constructor(private addrService: AddressService) {
        this.customerList = [];
        this.storage = new Storage();
        this.refreshCustomerList(); 
        this.stateObservers = [];
        this.customerObservers = [];
        this.state = this.getStateFromStorage();
        this.observeAddressChange = this.observeAddressChange.bind(this);
        this.addrService.registerAddressCallback(this.observeAddressChange);
    }

    registerStateCallback(callback): void {
        this.stateObservers.push(callback);

    }

    registerCustomerCallback(callback): void {
        this.customerObservers.push(callback);
    }

    reloadCustomers(): void {
        this.refreshCustomerList();
    }

    getSyncState(): boolean {
        this.notifyStateObservers();
        return this.state.needsUpload;
    }


    getCustomers(): TTrackCustomer[] {
        return this.customerList;
    }

    deleteCustomer(customer: TTrackCustomer): TTrackCustomer[] {
        var idx = 0;
        for (var item of this.customerList) {
            if (item.id == customer.id) {
                this.customerList.splice(idx, 1);
                this.storeCustomers();
            }
        }      
        return this.customerList;
    }

    toggleCustomer(customer: TTrackCustomer) {
        if (customer.isActive) {
            customer.isActive = false;
        }
        else {
            customer.isActive = true;
        }
        this.storeCustomers();
    }

    addCustomer(customer: TTrackCustomer) {
        if (customer.id == undefined) {
            customer.id = this.newGuid();
        }
        this.customerList.push(customer);
        this.storeCustomers();
    }

    updateCustomer(customer: TTrackCustomer, id: string) {
        var idx = 0;
        for (var item of this.customerList) {
            if (item.id == id) {
                this.customerList[idx] = customer;
                this.storeCustomers();
                return;
            }
            idx++;
        }
    }

    markUploadCompleted(): void {
        if (this.state.needsUpload) {
            this.state.needsUpload = false;
            this.storeStateToStorage();
        }
    }

    private storeCustomers() {
        var serCustList = [];
        for (var cust of this.customerList) {
            var serCust = {};
            serCust['id'] = cust.id;
            serCust['title'] = cust.title;
            serCust['firstName'] = cust.firstName;
            serCust['lastName'] = cust.lastName;
            serCust['active'] = cust.isActive;
            serCust['address'] = cust.address.id;
            serCustList.push(serCust);
        }
        this.storage.set('customers', serCustList).then((data) => {
            this.refreshCustomerList();
        }, (error) => {
            console.log('customer storage failed: ' + error);
        });

        if (!this.state.needsUpload) {
            this.state.needsUpload = true;
            this.storeStateToStorage();
        }
    }

    private refreshCustomerList() {
        var custList: TTrackCustomer[] = [];
        var addrList: TTrackAddress[] = [];
        this.storage.get('customers').then((data) => {
            if (data) {
                addrList = this.addrService.getAddresses();
                for (var serCust of data) {
                    var cust = new TTrackCustomer();
                    cust.id = serCust['id'];
                    cust.title = serCust['title'];
                    cust.firstName = serCust['firstName'];
                    cust.lastName = serCust['lastName'];
                    cust.isActive = serCust['active'];
                    if (cust.isActive == undefined) cust.isActive = true;
                    cust.address = new TTrackAddress();
                    cust.address.id = serCust['address'];
                    if (addrList) {
                        for (var address of addrList) {
                            if (address.id == cust.address.id) {
                                cust.address = address;
                            }
                        }
                    }
                    custList.push(cust);
                }
            }
            this.customerList = custList;
            this.notifyCustomerChange();
        }, (error) => {
            console.log(error.err);
            this.customerList = custList;
        });     
    }

    private getStateFromStorage(): CustomerServiceState {
        var state: CustomerServiceState = new CustomerServiceState;
        state.initializeState();
        this.storage.get('customerServiceState').then((data) => {
            if (data) {
                state.needsUpload = data['needsUpload'];              
            }
        }, (error) => {
            console.log(error.err);
        })
        return state;
    }

    private storeStateToStorage(): void {
        this.notifyStateObservers();
        this.storage.set('customerServiceState', this.state).then((data) => {
        }, (error) => {
            console.log('customerServiceState storage failed: ' + error.err);
        });
    }

    private newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    private notifyCustomerChange(): void {
        for (var observer of this.customerObservers) {
            observer(this.customerList);
        }
    }

    private notifyStateObservers(): void {
        if (this.state.needsUpload) {
            for (var observer of this.stateObservers) {
                observer();
            }
        }
    }

    private observeAddressChange(addressList: TTrackAddress[]): void {
        for (var cust of this.customerList) {
          for (var addr of addressList) {
            if (cust.address) {
              if (cust.address.id == addr.id) {
                cust.address = addr;
              }
            }
          }
        }
    }
}