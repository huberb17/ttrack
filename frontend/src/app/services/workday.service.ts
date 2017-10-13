import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CustomerAtWorkday, TTrackCustomer, TTrackAddress, TTrackRoute } from '../domain-model/domain-model';

class WorkdayServiceState {
    public needsUpload: boolean;
    public constructor() {
        this.needsUpload = false;
    }
    public initializeState() {
        this.needsUpload = false;
    }
}

export class Workday {
    public therapyDate: string;
    public milage: number;
    public startAddress: TTrackAddress;
    public endAddress: TTrackAddress;
    public customersOfDay: CustomerAtWorkday[];
    public constructor() {
        this.customersOfDay = [];
        this.startAddress = new TTrackAddress();
        this.endAddress = new TTrackAddress();
    }   
}

@Injectable()
export class WorkdayService {
    private workday: Workday;
    private workdayHistory: Workday[];
    private storage: Storage;
    private stateObservers;
    private workdayObservers;
    private workdayHistoryObservers;
    private state: WorkdayServiceState;
    
    public constructor() {
        this.workday = new Workday();
        this.workdayHistory = [];
        this.storage = new Storage();
        this.stateObservers = [];
        this.workdayObservers = [];
        this.workdayHistoryObservers = [];
        this.state = this.getStateFromStorage();    
    }

    registerStateCallback(callback): void {
        this.stateObservers.push(callback);

    }

    registerWorkdayCallback(callback): void {
        this.workdayObservers.push(callback);
    }

    registerWorkdayHistoryCallback(callback): void {
        this.workdayHistoryObservers.push(callback);
    }

    reloadWorkday(): void {
        this.refreshWorkday();
    }

    reloadHistory(): void {
        this.refreshWorkdayHistory();
    }

    getSyncState(): boolean {
        this.notifyStateObservers();
        return this.state.needsUpload;
    }

    getWorkday(): Workday {
        return this.workday;
    }

    getWorkdayHistory(): Workday[] {
        return this.workdayHistory;
    }

    saveWorkday(workday: Workday) {
        this.storeWorkday(workday);
    }

    submitWorkday(workday: Workday) {
        this.addWorkdayToHistory(workday);
        this.workday = new Workday();
        this.storeWorkday(this.workday);
    }

    markUploadCompleted(): void {
        if (this.state.needsUpload) {
            this.state.needsUpload = false;
            this.storeStateToStorage();
        }
    }

    private addWorkdayToHistory(workday: Workday): void {
        this.workdayHistory.push(workday);
        this.storeWorkdayHistory();
    }

    private storeWorkday(workday: Workday) {
        this.workday = workday;
        console.log(workday);
        var serWorkday = this.serializeWorkday(workday);
        console.log(serWorkday);
        this.storage.set('workday', serWorkday).then((data) => {
            this.notifyWorkdayChange();
        }, (error) => {
            console.log('customer storage failed: ' + error);
        });

        if (!this.state.needsUpload) {
            this.state.needsUpload = true;
            this.storeStateToStorage();
        }
    }

    private storeWorkdayHistory() {
        var serWorkdayHistory = [];
        for (var workday of this.workdayHistory) {
            var serWorkday = this.serializeWorkday(workday);
            serWorkdayHistory.push(serWorkday);
        }
        
        this.storage.set('workdayHistory', serWorkdayHistory).then((data) => {
            this.notifyWorkdayHistoryChange();
        }, (error) => {
            console.log('customer storage failed: ' + error);
        });

        if (!this.state.needsUpload) {
            this.state.needsUpload = true;
            this.storeStateToStorage();
        } 
    }

    private refreshWorkday() {
        var workday = new Workday();
        this.storage.get('workday').then((data) => {
            if (data) {
               workday = this.deserializeWorkday(data); 
            }
            this.workday = workday;
            this.notifyWorkdayChange();
        }, (error) => {
            console.log(error.err);
            this.workday = workday;
        });     
    }

    private refreshWorkdayHistory() {
        var workdayList: Workday[] = [];
        this.storage.get('workdayHistory').then((data) => {
            if (data) {
                for (var serWorkday of data) {
                    var workday = this.deserializeWorkday(serWorkday);                   
                    console.log(workday);
                    workdayList.push(workday);
                }
            }
            this.workdayHistory = workdayList;
            this.notifyWorkdayHistoryChange();
        }, (error) => {
            console.log(error.err);
            this.workdayHistory = workdayList;
        });     
    }

    private getStateFromStorage(): WorkdayServiceState {
        var state: WorkdayServiceState = new WorkdayServiceState;
        state.initializeState();
        this.storage.get('workdayServiceState').then((data) => {
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
        this.storage.set('workdayServiceState', this.state).then((data) => {
        }, (error) => {
            console.log('workdayServiceState storage failed: ' + error.err);
        });
    }

    private notifyWorkdayChange(): void {
        for (var observer of this.workdayObservers) {
            observer(this.workday);
        }
    }

    private notifyWorkdayHistoryChange(): void {
        for (var observer of this.workdayHistoryObservers) {
            observer(this.workdayHistory);
        }
    }

    private notifyStateObservers(): void {
        if (this.state.needsUpload) {
            for (var observer of this.stateObservers) {
                observer();
            }
        }
    }

    private serializeAddress(address: TTrackAddress): any {
        var serAddress = {};
        serAddress['street'] = address.street;
        serAddress['streetNumber'] = address.streetNumber;
        serAddress['doorNumber'] = address.doorNumber;
        serAddress['zipCode'] = address.zipCode;
        serAddress['city'] = address.city;
        serAddress['note'] = address.note;
        return serAddress;
    }

    private serializeRoute(route: TTrackRoute): any {
        var serRoute = {};
        serRoute['start'] = route.start;
        serRoute['end'] = route.end;
        serRoute['length'] = route.lengthInKm;
        return serRoute;
    }

    private serializeCustomer(customer: CustomerAtWorkday): any {
        var serCustomer = {};
        serCustomer['id'] = customer.id;
        serCustomer['title'] = customer.title;
        serCustomer['firstName'] = customer.firstName;
        serCustomer['lastName'] = customer.lastName;
        serCustomer['active'] = customer.isActive;
        serCustomer['address'] = this.serializeAddress(customer.address);
        serCustomer['route'] = this.serializeRoute(customer.routeToCustomer);
        return serCustomer;
    }

    private serializeWorkday(workday: Workday): any {
        var serWorkday = {};
        serWorkday['date'] = workday.therapyDate;
        serWorkday['milage'] = workday.milage;
        var serCustList = [];
        for (var cust of workday.customersOfDay) {
            var serCust = this.serializeCustomer(cust);
            serCustList.push(serCust);
        }
        serWorkday['customers'] = serCustList;
        serWorkday['startAddress'] = this.serializeAddress(workday.startAddress);
        serWorkday['endAddress'] = this.serializeAddress(workday.endAddress);
        return serWorkday;
    }

    private deserializeAddress(serAddress: any): TTrackAddress {
        var address = new TTrackAddress();
        if (serAddress === undefined) 
            return address;
        address.street = serAddress['street'];
        address.streetNumber = serAddress['streetNumber'];
        address.doorNumber = serAddress['doorNumber'];
        address.zipCode = serAddress['zipCode'];
        address.city = serAddress['city'];
        address.note = serAddress['note'];
        return address;
    }

    private deserializeRoute(serRoute: any): TTrackRoute {
        var route = new TTrackRoute();
        if (serRoute === undefined)
            return route;
        route.start = serRoute['start'];
        route.end = serRoute['end'];
        route.lengthInKm = serRoute['length'];
        return route;
    }

    private deserializeCustomer(serCustomer: any): CustomerAtWorkday {
        var customer = new CustomerAtWorkday(new TTrackCustomer());
        if (serCustomer === undefined)
            return customer;
        customer.id = serCustomer['id'];
        customer.title = serCustomer['title'];
        customer.firstName = serCustomer['firstName'];
        customer.lastName = serCustomer['lastName'];
        var serAddress = serCustomer['address']
        customer.address = this.deserializeAddress(serAddress);
        var serRoute = serCustomer['route'];
        customer.routeToCustomer = this.deserializeRoute(serRoute);
        return customer;
    }

    private deserializeWorkday(serWorkday: any): Workday {
        var workday = new Workday();
        if (serWorkday === undefined)
            return workday;
        workday.therapyDate = serWorkday['date'];
        workday.milage = serWorkday['milage']
        for (var serCust of serWorkday['customers']) {
            var customer = this.deserializeCustomer(serCust);
            workday.customersOfDay.push(customer);
        }
        workday.startAddress = this.deserializeAddress(serWorkday['startAddress']);
        workday.endAddress = this.deserializeAddress(serWorkday['endAddress']);
        return workday;
    }
}