import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http'
import { TTrackAddress, TTrackRoute } from '../domain-model/domain-model';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

declare var google;

@Injectable()
export class DistanceService {
    private distanceMatrixUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    private mode = 'car';
    private language = 'de-AT';
    //private apiKey = 'AIzaSyD8u_XcuipbTtyFCx_eRcuyUeeo9bOVyJU';
    private apiKey = 'AIzaSyALBVbo66dGGIjA8bI-_xPXX6dULV1G8WA';
    
    constructor (private http: Http) { }

    public calculateRoute(route: TTrackRoute, callback: any, param: any): void {
        var startAddrString = route.start.toString();
        var endAddrString = route.end.toString();
        this.getDistance(startAddrString, endAddrString, callback, param);        
    }

    private getDistance(origin: string, destination: string, callback: any, param: any): void {

        // let searchParams = new URLSearchParams();
        // searchParams.append('origins', origin);
        // searchParams.append('destinations', destination);
        // searchParams.append('mode', this.mode);
        // searchParams.append('language', this.language);
        // searchParams.append('key', this.apiKey);
        // this.http.get(this.distanceMatrixUrl,
        //     { search: searchParams })
        //     .toPromise()
        //     .then(response => {
        //         var distance = response.json().rows[0].elements[0].distance;
        //         callback(param, distance.value);
        //     })
        //     .catch((err) => console.log('Error: %s', JSON.stringify(err)));

        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        }, function(response, status) {
          if (status !== 'OK') {
            alert('Error was: ' + status);
          } else {
              console.log(response);
              var distance = response.rows[0].elements[0].distance;
              callback(param, distance['value']);
              console.log(distance['value']);
          }    
        });        
    }   
}