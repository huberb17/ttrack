import { Injectable } from '@angular/core';

import { TTrackAddress } from '../domain-model/domain-model';
import { ADDRESSES, ADDR_ZIEGELFELD } from '../domain-model/mock-addresses';

@Injectable()
export class AddressService {
    
    getAddresses(): TTrackAddress[] {
        return ADDRESSES;
    }

    getHomeAddress(): TTrackAddress {
        return ADDR_ZIEGELFELD;
    }
}