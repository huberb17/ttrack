
from __future__ import annotations
class Address:
    """Implements the Address object."""
    
    _data = 'none'
    _id = 'None'
    _street = 'None'
    _street_number = 'None'
    _door_number = 'None'
    _city = 'None'
    _zip_code = 'None'
    _note = 'None'
    _is_active = 0

    @staticmethod
    def build_from_json(json_data) -> Address:
        """Build object from json data."""
        addr = Address()
        addr._data = json_data
        if 'id' in json_data:
            addr._id = json_data['id']
        if 'street' in json_data:
            addr._street = json_data['street']
        if 'streetNumber' in json_data:
            addr._street_number = json_data['streetNumber']
        if 'doorNumber' in json_data:
            addr._door_number = json_data['doorNumber']
        if 'city' in json_data:
            addr._city = json_data['city']
        if 'zipCode' in json_data:
            addr._zip_code = json_data['zipCode']
        if 'note' in json_data:
            addr._note = json_data['note']
        if 'isActive' in json_data:
            if json_data['isActive'] == 'true' or json_data['isActive'] == 'True':
                addr._is_active = 1
            else:
                addr._is_active = 0
        return addr        

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

