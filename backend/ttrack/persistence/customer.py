from __future__ import annotations
class Customer:
    """Implements the Customer object."""

    _data = ''
    _id = 'None'
    _title = ''
    _first_name = 'None'
    _last_name = 'None'
    _address = 'None'
    _active = 0
    _report_text = ''
    _default_invoice = 0

    @staticmethod
    def build_from_json(json_data) -> Customer:
        """Build object from json data."""
        customer = Customer()
        customer._data = json_data
        if 'id' in json_data:
            customer._id = json_data['id']
        if 'title' in json_data:
            customer._title = json_data['title']
        if 'firstName' in json_data:
            customer._first_name = json_data['firstName']
        if 'lastName' in json_data:
            customer._last_name = json_data['lastName']
        if 'address' in json_data:
            address = json_data['address']
            if type(address) is dict:
                customer._address = json_data['address']['id']
            else:
                customer._address = json_data['address']
        if 'isActive' in json_data:
            if json_data['isActive'] == 'true' or json_data['isActive'] == 'True' or json_data['isActive'] == True:
                customer._active = 1
            else:
                customer._active = 0
        if 'invoiceConfiguration' in json_data:
            invConf = json_data['invoiceConfiguration']
            if 'textForReport' in invConf:
                customer._report_text = invConf['textForReport']
            if 'value' in invConf:
                customer._default_invoice = invConf['value']
        return customer

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'title': self._title,
            'first_name': self._first_name,
            'last_name': self._last_name,
            'address_id': self._address,
            'active': self._active,
            'report_text': self._report_text,
            'default_invoice': self._default_invoice
        }
        return data

