import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TTrackCustomer, TTrackAddress } from '../domain-model/domain-model';
import { AddressService } from "../../app/services/address.service";

@Injectable()
export class CustomerService {
    private customerList: TTrackCustomer[];
    private storage: Storage;

    public constructor(private addrService: AddressService) {
        this.storage = new Storage();
        this.refreshCustomerList(); 
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

    updateCustomer(customer: TTrackCustomer, idx: number) {
        console.log('update custoer with idx' + idx);
        if (this.customerList.length > idx) {
            this.customerList[idx] = customer;
            console.log('overwrite customer');
            this.storeCustomers();   
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
            console.log('customer storage successfull ' + data);
            this.refreshCustomerList();
        }, (error) => {
            console.log('customer storage failed: ' + error);
        });
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
                    cust.address = new TTrackAddress();
                    cust.address.id = serCust['address'];
                    // for (var item of addrList) {
                    //     if (item.id == cust.address.id) {
                    //         cust.address = item;
                    //     }
                    // }
                    custList.push(cust);
                }
            }
            this.customerList = custList;
        }, (error) => {
            console.log(error.err);
            this.customerList = custList;
        });
        console.log('leave refresh customer list');
    }

    private newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}