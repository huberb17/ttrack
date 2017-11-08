import { Injectable } from '@angular/core';
import { Http } from '@angular/http'
import { TTrackRoute, TTrackAddress } from '../domain-model/domain-model';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

declare var google;

@Injectable()
export class DistanceService {
    
    constructor (private http: Http) { }

    public calculateRoute(route: TTrackRoute, callback: any, param: any): void {
        var startAddrString = TTrackAddress.toString(route.start);
        var endAddrString = TTrackAddress.toString(route.end);
        console.log(startAddrString);
        console.log(endAddrString);
        this.getDistance(startAddrString, endAddrString, callback, param);        
    }

    private getDistance(origin: string, destination: string, callback: any, param: any): void {

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