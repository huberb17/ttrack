import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CustomerAtWorkday, TTrackCustomer, TTrackAddress, TTrackRoute } from '../domain-model/domain-model';
import { GdriveService } from './gdrive.service';

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
    public id: string;
    public therapyDate: string;
    public milage: number;
    public startAddress: TTrackAddress;
    public endAddress: TTrackAddress;
    public customersOfDay: CustomerAtWorkday[];
    public isUploaded: boolean;
    public constructor() {
        this.id = Workday.newGuid();
        this.customersOfDay = [];
        this.startAddress = new TTrackAddress();
        this.endAddress = new TTrackAddress();
        this.isUploaded = false;
    }
    
    public static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
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
    
    public constructor(private gdriveService: GdriveService) {
        this.workday = new Workday();
        this.workdayHistory = [];
        this.storage = new Storage();
        this.stateObservers = [];
        this.workdayObservers = [];
        this.workdayHistoryObservers = [];
        this.state = this.getStateFromStorage();    
        this.observeWorkdayUpload = this.observeWorkdayUpload.bind(this);
        this.gdriveService.registerUploadWorkdayCallback(this.observeWorkdayUpload);
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

    uploadWorkday(workday: Workday) {
        this.gdriveService.uploadWorkdays([workday]);
        this.updateHistory(workday);
    }

    uploadWorkdays(workdays: Workday[]) {
        this.gdriveService.uploadWorkdays(workdays);
        this.updateHistoryWorkdays(workdays);
    }

    public removeArchived(): void {
        var newHistory: Workday[] = [];
        for (var workday of this.workdayHistory) {
            if (!workday.isUploaded) {
                newHistory.push(workday);
            }
        }
        this.workdayHistory = newHistory;
        this.storeWorkdayHistory();
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

    private updateHistory(workday: Workday): void {
        for (var wd of this.workdayHistory) {
            if (wd.id == workday.id) {
                wd = workday;
                this.storeWorkdayHistory();
                return;
            }
        }
        console.log('workday ' + workday.id + ' not found');
    }

    private updateHistoryWorkdays(workdays: Workday[]): void {
        for (let workday of workdays) {
            for (var wd of this.workdayHistory) {
                if (wd.id == workday.id) {
                    wd = workday;
                    break;
                }
            }
        }
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

    private observeWorkdayUpload(workdayIds: string[]): void {
        console.log(workdayIds);
        if (workdayIds) {
          for (let workday of this.workdayHistory) {
              for (let workdayId of workdayIds) {
                  if (workday.id == workdayId) {
                      workday.isUploaded = true;
                      break;
                  }
              }
          }
          this.storeWorkdayHistory();
          this.notifyWorkdayHistoryChange();
        }
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
        serCustomer['address'] = TTrackAddress.serialize(customer.address);
        serCustomer['route'] = this.serializeRoute(customer.routeToCustomer);
        return serCustomer;
    }

    private serializeWorkday(workday: Workday): any {
        var serWorkday = {};
        serWorkday['id'] = workday.id;
        serWorkday['date'] = workday.therapyDate;
        serWorkday['milage'] = workday.milage;
        var serCustList = [];
        for (var cust of workday.customersOfDay) {
            var serCust = this.serializeCustomer(cust);
            serCustList.push(serCust);
        }
        serWorkday['customers'] = serCustList;
        serWorkday['startAddress'] = TTrackAddress.serialize(workday.startAddress);
        serWorkday['endAddress'] = TTrackAddress.serialize(workday.endAddress);
        serWorkday['isUploaded'] = workday.isUploaded;
        return serWorkday;
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
        customer.address = TTrackAddress.deserialize(serAddress);
        var serRoute = serCustomer['route'];
        customer.routeToCustomer = this.deserializeRoute(serRoute);
        return customer;
    }

    private deserializeWorkday(serWorkday: any): Workday {
        var workday = new Workday();
        if (serWorkday === undefined)
            return workday;
        workday.id = serWorkday['id'];
        if (workday.id === undefined)
            workday.id = Workday.newGuid();
        workday.therapyDate = serWorkday['date'];
        workday.milage = serWorkday['milage']
        for (var serCust of serWorkday['customers']) {
            var customer = this.deserializeCustomer(serCust);
            workday.customersOfDay.push(customer);
        }
        workday.startAddress = TTrackAddress.deserialize(serWorkday['startAddress']);
        workday.endAddress = TTrackAddress.deserialize(serWorkday['endAddress']);
        workday.isUploaded = serWorkday['isUploaded'];
        return workday;
    }

}