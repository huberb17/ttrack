import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TTrackCustomer, TTrackAddress } from '../domain-model/domain-model';

@Injectable()
export class CustomerService {
    private customerList: TTrackCustomer[];
    private storage: Storage;

    public constructor() {
        this.storage = new Storage();
        this.refreshCustomerList(); 
    }

    getCustomers(): TTrackCustomer[] {
        return this.customerList;
    }

    deleteCustomer(customer: TTrackCustomer): TTrackCustomer[] {
        let index = this.customerList.indexOf(customer);
        if  (index > -1) {
            this.customerList.splice(index, 1);
        }
        this.storeCustomers();
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
        var custList: TTrackCustomer[] = [];

        this.storage.get('customers').then((data) => {
            console.log('customer retrieval successful: ' + data);
            if (data) {
                for (var serCust of data) {
                    var cust = new TTrackCustomer();
                    cust.title = serCust['title'];
                    cust.firstName = serCust['firstName'];
                    cust.lastName = serCust['lastName'];
                    cust.isActive = serCust['active'];
                    cust.address = new TTrackAddress();
                    cust.address.id = serCust['address'];
                    custList.push(cust);
                }
            }
            this.customerList = custList;
        }, (error) => {
            console.log(error.err);
            this.customerList = custList;
        });
    }

    private newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}