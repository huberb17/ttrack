import { Injectable } from '@angular/core';

import { TTrackCustomer } from '../domain-model/domain-model';
import { CUSTOMERS } from '../domain-model/mock-customers';

@Injectable()
export class CustomerService {
    private customerList: TTrackCustomer[];

    public constructor() {
        this.customerList = Object.create(CUSTOMERS);
    }
    getCustomers(): TTrackCustomer[] {
        return this.customerList;
    }

    deleteCustomer(customer: TTrackCustomer): TTrackCustomer[] {
        let index = this.customerList.indexOf(customer);
        if  (index > -1) {
            this.customerList.splice(index, 1);
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
    }

    saveCustomer(customer: TTrackCustomer) {
        let index = this.customerList.indexOf(customer);
        if (index > -1) {
            this.customerList[index] = customer;
        }
        else {
            this.customerList.push(customer);
        }
    }
}