import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class DistanceService {
    private distanceMatrixUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    private mode = 'car';
    private language = 'de-AT';
    private apiKey = 'AIzaSyD8u_XcuipbTtyFCx_eRcuyUeeo9bOVyJU';

    constructor (private http: Http) { }

    getDistance(origin: string, destination: string): Promise<any> {
        let searchParams = new URLSearchParams();
        searchParams.append('origins', origin);
        searchParams.append('destinations', destination);
        searchParams.append('mode', this.mode);
        searchParams.append('language', this.language);
        searchParams.append('key', this.apiKey);
        return this.http.get(this.distanceMatrixUrl,
            { search: searchParams })
            .toPromise()
            .then(response => response.json().rows[0].elements[0].distance)
            .catch(this.logError);
    }

    private logError(err: any): Promise<any> {
        console.error('Error while fetching API data: ' + err);
        return Promise.reject(err.message || err);
    }
}