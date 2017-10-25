# coding=utf-8
import json

from backend.ttrack.persistence.driven_route import DrivenRoute
from backend.ttrack.utils.errors import DataStoreError


class WorkDay:
    """Implements the WorkDay object."""
    def __init__(self, json_data):
        """The initializer method of the class."""
        self._data = json_data
        self._driven_routes = []

    def get_driven_routes(self):
        try:
            workday = self._data
            date = workday['therapyDate'][:10]
            start_km = int(workday['milage'])
            last_id = 0
            workday_id = workday['id']
            count = 0
            for customer in workday['customersOfDay']:
                route = customer['routeToCustomer']
                route_distance = int(route['lengthInKm'])
                start_id = route['start']['id']
                end_id = customer['address']['id']
                comment = customer['firstName'] + ' ' + customer['lastName']
                dr_id = '{0}_dr_{1}'.format(workday_id, count)
                self._driven_routes.append(DrivenRoute(dr_id, date, start_km, start_id, end_id, route_distance, comment))
                start_km += int(route_distance)
                last_id = end_id
                count = count + 1
            # TODO: add when uploaded data is fixed: last_route = workday['lastRoute']
            end_id = '1' # last_route['end']['id']
            route_distance = 17 # last_route['lengthInKm']
            comment = u'Rückfahrt'
            dr_id = '{0}_dr_{1}'.format(workday_id, count)
            self._driven_routes.append(DrivenRoute(dr_id, date, start_km, last_id, end_id, route_distance, comment))
        except (ValueError, KeyError) as err:
            raise DataStoreError('Error decoding WorkDay object: {}'.format(err.message))

        return self._driven_routes


