// This file defines the domain-model of the application.
// Eventually this file is split into multiple files if 
// the model evolves.

export class TTrackCustomer {
    public id: string;
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
    public id: string;
    public street: string;
    public streetNumber: string;
    public doorNumber: string;
    public zipCode: string;
    public city: string;
    public note: string;
    public isActive: boolean;

    public static deserialize(serAddress: any): TTrackAddress {
        var address = new TTrackAddress();
        if (serAddress === undefined) 
            return address;
        address.id = serAddress['id'];
        address.street = serAddress['street'];
        address.streetNumber = serAddress['streetNumber'];
        address.doorNumber = serAddress['doorNumber'];
        address.zipCode = serAddress['zipCode'];
        address.city = serAddress['city'];
        address.note = serAddress['note'];
        address.isActive = serAddress['isActive'];
        return address;        
    }

    public static serialize(address: TTrackAddress): any {
        var serAddress = {};
        serAddress['id'] = address.id;
        serAddress['street'] = address.street;
        serAddress['streetNumber'] = address.streetNumber;
        serAddress['doorNumber'] = address.doorNumber;
        serAddress['zipCode'] = address.zipCode;
        serAddress['city'] = address.city;
        serAddress['note'] = address.note;
        serAddress['isActive'] = address.isActive;
        return serAddress;
    }

    public toString(): string {
        return this.street + ' ' + this.streetNumber +
              ', ' + this.zipCode + ' ' + this.city;
    }
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