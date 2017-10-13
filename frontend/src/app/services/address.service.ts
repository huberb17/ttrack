import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TTrackAddress } from '../domain-model/domain-model';
import { ADDR_ZIEGELFELD } from '../domain-model/mock-addresses';

class AddressServiceState {
    public needsUpload: boolean;
    public constructor() {
        this.needsUpload = false;
    }
    public initializeState() {
        this.needsUpload = false;
    }
}

class AddressServiceSettings {
    public defaultStartAddress: TTrackAddress;
    public defaultEndAddress: TTrackAddress;
    private storage: Storage;
    private observers;

    public constructor() {
        this.observers = [];
        this.defaultStartAddress = ADDR_ZIEGELFELD;
        this.defaultEndAddress = ADDR_ZIEGELFELD;
        this.storage = new Storage();
        this.reloadSettings();
    }

    public registerCallback(callback): void {
        this.observers.push(callback);
    }

    public reloadSettings() {
        this.storage.get('addressServiceSettings').then((data) => {
            if (data) {           
                this.defaultStartAddress = TTrackAddress.deserialize(data['defaultStartAddress']);
                this.defaultEndAddress = TTrackAddress.deserialize(data['defaultEndAddress']);                
                this.notify();
            }
        }, (error) => {
            console.log(error.err);
        });
    }
    
    public storeSettings() {
        var serSettings = {};
        serSettings['defaultStartAddress'] = this.defaultStartAddress;
        serSettings['defaultEndAddress'] = this.defaultEndAddress;
        this.storage.set('addressServiceSettings', serSettings).then((data) => {
            this.notify();
        }, (error) => {
            console.log(error.err);
        });
    }

    private notify() {
        for (var observer of this.observers) {
            observer(this.defaultStartAddress, this.defaultEndAddress);
        }
    }
}

@Injectable()
export class AddressService {
    private addressList: TTrackAddress[];
    private storage: Storage;
    private state: AddressServiceState;
    private stateObservers;
    private addressObservers;
    private settings: AddressServiceSettings;

    public constructor() {
        this.storage = new Storage();
        this.refreshAddressList(); 
        this.state = this.getStateFromStorage();
        this.stateObservers = [];
        this.addressObservers = [];
        this.settings = new AddressServiceSettings();
    }

    registSettingsCallback(callback): void {
        this.settings.registerCallback(callback);
    }
    
    registerStateCallback(callback): void {
        this.stateObservers.push(callback);

    }

    registerAddressCallback(callback): void {
        this.addressObservers.push(callback);
    }

    reloadAddresses(): void {
        this.refreshAddressList();
    }

    getSyncState(): boolean {
        this.notifyStateObservers();
        return this.state.needsUpload;
    }

    getAddresses(): TTrackAddress[] {
        return this.addressList;
    }

    getAddressById(id: string): TTrackAddress {
        for (var address of this.addressList) {
            if (address.id == id) {
                return address;
            }
        }
        return null;
    }

    getDefaultStartAddress(): TTrackAddress {
        return this.settings.defaultStartAddress;
    }

    setDefaultStartAddress(address: TTrackAddress): void {
        this.settings.defaultStartAddress = address;
        this.settings.storeSettings();
    }

    getDefaultEndAddress(): TTrackAddress {
        return this.settings.defaultEndAddress;
    }
    
    setDefaultEndAddress(address: TTrackAddress): void {
        this.settings.defaultEndAddress = address;
        this.settings.storeSettings();
    }

    deleteAddress(address: TTrackAddress): TTrackAddress[] {
        var idx = 0;
        for (var item of this.addressList) {
            if (item.id == address.id) {
                this.addressList.splice(idx, 1);
                this.storeAddresses();
                break;
            }
            idx++;
        }
        return this.addressList;
    }

    addAddress(address: TTrackAddress) {
        if (address.id == undefined) {
            address.id = this.newGuid();
        }
        this.addressList.push(address);
        this.storeAddresses();
    }

    updateAddress(address: TTrackAddress, id: string) {
        var idx = 0;
        for  (var item of this.addressList) {
            if (item.id == id) {
                this.addressList[idx] = address;
                this.storeAddresses();
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

    private storeAddresses() {
        var serAddrList = [];
        for (var addr of this.addressList) {
            var serAddr = TTrackAddress.serialize(addr);
            serAddrList.push(serAddr);
        }
        this.storage.set('addresses', serAddrList).then((data) => {
            this.refreshAddressList();
        }, (error) => {
            console.log('address storage failed: ' + error);
        });

        if (!this.state.needsUpload) {
            this.state.needsUpload = true;
            this.storeStateToStorage();
        }
    }

    private refreshAddressList() {
        var addrList: TTrackAddress[] = [];

        this.storage.get('addresses').then((data) => {
            if (data) {           
                for (var serAddr of data) {
                    var addr = new TTrackAddress();
                    addr.id = serAddr['id'];
                    addr.street = serAddr['street'];
                    addr.streetNumber = serAddr['streetNumber'];
                    addr.doorNumber = serAddr['doorNumber'];
                    addr.zipCode = serAddr['zipCode'];
                    addr.city = serAddr['city'];
                    addr.note = serAddr['note'];
                    addr.isActive = serAddr['isActive'];
                    addrList.push(addr);
                }
            }
            this.addressList = addrList;
            this.notifyAddressChange();
        }, (error) => {
            console.log(error.err);
            this.addressList = addrList;
        });
    }

    private getStateFromStorage(): AddressServiceState {
        var state: AddressServiceState = new AddressServiceState;
        state.initializeState();
        this.storage.get('addressServiceState').then((data) => {
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
        this.storage.set('addressServiceState', this.state).then((data) => {
        }, (error) => {
            console.log('addressServiceState storage failed: ' + error.err);
        });
    }

    private newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    private notifyAddressChange(): void {
        for (var observer of this.addressObservers) {
            observer(this.addressList);
        }
    }

    private notifyStateObservers(): void {
        if (this.state.needsUpload) {
            for (var observer of this.stateObservers) {
                observer();
            }
        }
    }

}