// This file defines the domain-model of the application.
// Eventually this file is split into multiple files if 
// the model evolves.

export class TTrackCustomer {
    public id: string;
    public title: string;
    public firstName: string;
    public lastName: string;
    public address: TTrackAddress;
    public invoiceConfiguration: TTrackIncome;
    public isActive: boolean;

    public static serialize(customer: TTrackCustomer): any {
        var serCustomer = {};
        serCustomer['id'] = customer.id;
        serCustomer['title'] = customer.title;
        serCustomer['firstName'] = customer.firstName;
        serCustomer['lastName'] = customer.lastName;
        serCustomer['address'] = customer.address.id;
        serCustomer['invoiceConfig'] = TTrackIncome.serialize(customer.invoiceConfiguration);
        serCustomer['isActive'] = customer.isActive;
        return serCustomer;
    }

    public static deserialize(serCustomer: any): TTrackCustomer {
        var customer = new TTrackCustomer();
        customer.id = serCustomer['id'];
        customer.title = serCustomer['title'];
        customer.firstName = serCustomer['firstName'];
        customer.lastName = serCustomer['lastName'];
        customer.address = new TTrackAddress();
        customer.address.id = serCustomer['address'];
        customer.invoiceConfiguration = TTrackIncome.deserialize['invoiceConfig'];
        customer.isActive = serCustomer['isActive'];
        return customer;
    }
}

export class CustomerAtWorkday extends TTrackCustomer {
    public routeToCustomer: TTrackRoute;
    public invoice: TTrackIncome;
    constructor(customer: TTrackCustomer) {
        super();
        this.id = customer.id;
        this.title = customer.title;
        this.firstName = customer.firstName;
        this.lastName = customer.lastName;
        this.address = customer.address;
        this.invoiceConfiguration = customer.invoiceConfiguration;
        this.isActive = customer.isActive;
        this.routeToCustomer = null;
        this.invoice = null;
    }
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

export class TTrackExpense {
    public date: string;
    public textForReport: string;
    public value: number;
	public category: string;
}

export class TTrackKilometreExpense extends TTrackExpense {
    public category = "KilometreExpense";
}

export class TTrackIncome {
    public textForReport: string;
    public value: number;

    public static serialize(income: TTrackIncome): any {
        var serIncome = {};
        serIncome['text'] = income.textForReport;
        serIncome['value'] = income.value;
        return serIncome;
    }

    public static deserialize(serIncome: any): TTrackIncome {
        var income = new TTrackIncome();
        income.textForReport = serIncome['text'];
        income.value = serIncome['value'];
        return income;
    }
}

export class TTrackConfiguration {
    public feePerKm: number;
}