import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TTrackAddress } from '../domain-model/domain-model';
import { ADDR_ZIEGELFELD } from '../domain-model/mock-addresses';

@Injectable()
export class AddressService {
    private addressList: TTrackAddress[];
    private storage: Storage;

    public constructor() {
        this.storage = new Storage();
        this.refreshAddressList(); 
    }

    getAddresses(): TTrackAddress[] {
        return this.addressList;
    }

    getHomeAddress(): TTrackAddress {
        return ADDR_ZIEGELFELD;
    }

    deleteAddress(address: TTrackAddress): TTrackAddress[] {
        let index = this.addressList.indexOf(address);
        if  (index > -1) {
            this.addressList.splice(index, 1);
        }
        this.storeAddresses();
        return this.addressList;
    }

    addAddress(address: TTrackAddress) {
        if (address.id == undefined) {
            address.id = this.newGuid();
        }
        this.addressList.push(address);
        this.storeAddresses();
    }

    updateAddress(address: TTrackAddress, idx: number) {
        console.log('update address with idx ' + idx);
        if (this.addressList.length > idx) {
            this.addressList[idx] = address;
            console.log('overwrite address');
            this.storeAddresses();   
        }
    }

    private storeAddresses() {
        var serAddrList = [];
        for (var addr of this.addressList) {
            var serAddr = {};
            serAddr['id'] = addr.id;
            serAddr['street'] = addr.street;
            serAddr['streetNumber'] = addr.streetNumber;
            serAddr['doorNumber'] = addr.doorNumber;
            serAddr['zipCode'] = addr.zipCode;
            serAddr['city'] = addr.city;
            serAddr['note'] = addr.note;
            serAddr['isActive'] = addr.isActive;
            serAddrList.push(serAddr);
        }
        this.storage.set('addresses', serAddrList).then((data) => {
            console.log('address storage successfull');
            this.refreshAddressList();
        }, (error) => {
            console.log('address storage failed: ' + error);
        });
    }

    private refreshAddressList() {
        var addrList: TTrackAddress[] = [];

        this.storage.get('addresses').then((data) => {
            console.log('address retrieval successful');
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
        }, (error) => {
            console.log(error.err);
            this.addressList = addrList;
        });
    }

    private newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}