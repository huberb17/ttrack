import { TTrackAddress } from './domain-model';
 
export const ADDR_ZIEGELFELD: TTrackAddress = {
    street: "Ziegelfeld",
    streetNumber: "35",
    doorNumber: "",
    zipCode: "3071",
    city: "Böheimkirchen",
    note: "Home",
    isActive: true
}

export const ADDR_SCHLUMPFHAUSEN: TTrackAddress = {
    street: "Waldweg",
    streetNumber: "1",
    doorNumber: "08/15",
    zipCode: "1234",
    city: "Schlumpfhausen",
    note: "Schlumpfadresse",
    isActive: true
}

export const ADDR_WICKI: TTrackAddress = {
    street: "Fjord",
    streetNumber: "2",
    doorNumber: "3",
    zipCode: "666",
    city: "Hardanger",
    note: "Vikingeradresse",
    isActive: true
}

export const ADDR_EDLA: TTrackAddress = {
    street: "Edla",
    streetNumber: "9",
    doorNumber: "",
    zipCode: "3261",
    city: "Steinakirchen",
    note: "Testadresse",
    isActive: true
}

export const ADDRESSES: TTrackAddress[] = [
    ADDR_ZIEGELFELD,
    ADDR_SCHLUMPFHAUSEN,
    ADDR_WICKI
]