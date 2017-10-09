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
        this.storage = new Storage();
        this.refreshCustomerList(); 
        this.stateObservers = [];
        this.customerObservers = [];
        this.state = this.getStateFromStorage();
        
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
                console.log('delete customer');
                console.log(this.customerList[idx]);
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
        console.log('update customer with id ' + id);
        console.log('new customer');
        console.log(customer);
        var idx = 0;
        for (var item of this.customerList) {
            if (item.id == id) {
                this.customerList[idx] = customer;
                console.log('new customer');
                console.log(this.customerList[idx]);
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
            console.log('customer storage successfull!');
            console.log(data);
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
        console.log('enter refresh customer list');
        var custList: TTrackCustomer[] = [];
        var addrList: TTrackAddress[] = this.addrService.getAddresses();
        this.storage.get('customers').then((data) => {
            console.log('customer retrieval successful');
            console.log(data);
            if (data) {
                for (var serCust of data) {
                    console.log('customer');
                    console.log(serCust);
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
        console.log('leave refresh customer list');
    }

    private getStateFromStorage(): CustomerServiceState {
        var state: CustomerServiceState = new CustomerServiceState;
        state.initializeState();
        this.storage.get('customerServiceState').then((data) => {
            console.log('successful access to customerServiceState');
            if (data) {
                state.needsUpload = data['needsUpload'];
                console.log('needs upload: ' + state.needsUpload);
            }
        }, (error) => {
            console.log(error.err);
        })
        console.log('customerServiceState: ');
        console.log(state);
        return state;
    }

    private storeStateToStorage(): void {
        this.notifyStateObservers();
        this.storage.set('customerServiceState', this.state).then((data) => {
            console.log('customerServiceState storage successfull');
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
        console.log('notify customer change');
        console.log(this.customerObservers);
        console.log(this);
        for (var observer of this.customerObservers) {
            observer(this.customerList);
            console.log('observer called: ' + observer.toString());
        }
    }

    private notifyStateObservers(): void {
        if (this.state.needsUpload) {
            console.log('notify all state obervers');
            for (var observer of this.stateObservers) {
                observer();
            }
        }
    }
}