// This file defines the domain-model of the application.
// Eventually this file is split into multiple files if 
// the model evolves.

export class TTrackCustomer {
    public title: string;
    public firstName: string;
    public lastName: string;
    public address: TTrackAddress;
    public prescriptions: TTrackPrescription[];
    public isActive: boolean;
}

export class CustomerAtWorkday extends TTrackCustomer {
    public routeToCustomer: TTrackRoute = null;
    constructor(customer: TTrackCustomer) {
        super();
        this.title = customer.title;
        this.firstName = customer.firstName;
        this.lastName = customer.lastName;
        this.address = customer.address;
        this.prescriptions = customer.prescriptions;
        this.isActive = customer.isActive;
        this.routeToCustomer = null;
    }
}

export class TTrackPrescription {
    public date: string;
    public customer: TTrackCustomer;
    public numTherapyItems: number;
    public ratePerItem: number;
    public itemsTillPayment: number;
    public itemsTillInvoice: number;
    public textForReport: string;
    public therapyItems: TTrackTherapyItem[];
    public invoices: TTrackInvoice[];
    public isActive: boolean;
}

export class TTrackTherapyItem {
    public date: string;
    public routeStart: TTrackAddress;
    public routeEnd: TTrackAddress;
    public drivenKm: number;
    public partOfInvoice: TTrackInvoice; 
}

export class TTrackAddress {
    public street: string;
    public streetNumber: string;
    public doorNumber: string;
    public zipCode: string;
    public city: string;
    public note: string;
    public isActive: boolean;
}

export class TTrackRoute {
    public start: TTrackAddress;
    public end: TTrackAddress;
    public lengthInKm: number;    
}

export class TTrackInvoice {
    public date: string;
    public partOfPrescription: TTrackPrescription;
    public value: number;
    public therapyItems: TTrackTherapyItem[];
}

export class TTrackExpense {
    public date: string;
    public textForReport: string;
    public value: number;
}

export class TTrackKilometreExpense extends TTrackExpense {
    public category = "KilometreExpense";
}

export class TTrackIncome {
    public date: string;
    public textForReport: string;
    public value: number;
    public invoice: TTrackInvoice;
}

export class TTrackConfiguration {
    public feePerKm: number;
}