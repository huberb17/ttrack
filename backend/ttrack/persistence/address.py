import json

from backend.ttrack.utils.errors import DataStoreError


class Address:
    """Implements the Address object."""
    def __init__(self, json_data):
        """The initializer method of the class."""
        self._data = json_data
        if 'id' in json_data:
            self._id = json_data['id'].encode('utf-8')
        else:
            self._id = 'None'
        if 'street' in json_data:
            self._street = json_data['street'].encode('utf-8')
        else:
            self._street = 'None'
        if 'streetNumber' in json_data:
            self._street_number = json_data['streetNumber'].encode('utf-8')
        else:
            self._street_number = 'None'
        if 'doorNumber' in json_data:
            self._door_number = json_data['doorNumber'].encode('utf-8')
        else:
            self._door_number = 'None'
        if 'city' in json_data:
            self._city = json_data['city'].encode('utf-8')
        else:
            self._city = 'None'
        if 'zipCode' in json_data:
            self._zip_code = json_data['zipCode'].encode('utf-8')
        else:
            self._zip_code = 'None'
        if 'note' in json_data:
            self._note = json_data['note'].encode('utf-8')
        else:
            self._note = 'None'
        if 'isActive' in json_data:
            if json_data['isActive'] == 'true' or json_data['isActive'] == 'True':
                self._is_active = 1
            else:
                self._is_active = 0
        else:
            self._is_active = 0

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'street': self._street,
            'street_number': self._street_number,
            'door_number': self._door_number,
            'city': self._city,
            'zip_code': self._zip_code,
            'note': self._note,
            'is_active': self._is_active
        }
        return data

