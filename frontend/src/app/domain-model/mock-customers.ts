import { TTrackCustomer } from './domain-model';
 
import { ADDR_WICKI, ADDR_SCHLUMPFHAUSEN, ADDR_EDLA } from './mock-addresses';

export const CUSTOMERS: TTrackCustomer[] = [
    {
        title: "Hr.",
        firstName: "Papa",
        lastName: "Schlumpf",
        address: ADDR_SCHLUMPFHAUSEN,
        prescriptions: [],
        isActive: true
    },
    {
    title: "",
    firstName: "Wicki",
    lastName: "Vikinger",
    address: ADDR_WICKI,
    prescriptions: [],
    isActive: true
},
{
    title: "",
    firstName: "Max",
    lastName: "Mustermann",
    address: ADDR_EDLA,
    prescriptions: [],
    isActive: true
    } 
]