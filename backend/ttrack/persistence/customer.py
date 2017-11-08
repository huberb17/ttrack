import json

from backend.ttrack.utils.errors import DataStoreError


class Customer:
    """Implements the Customer object."""
    def __init__(self, json_data):
        """The initializer method of the class."""
        self._data = json_data
        if 'id' in json_data:
            self._id = json_data['id'].encode('utf-8')
        else:
            self._id = 'None'
        if 'title' in json_data:
            self._title = json_data['title'].encode('utf-8')
        else:
            self._title = ''
        if 'firstName' in json_data:
            self._first_name = json_data['firstName'].encode('utf-8')
        else:
            self._first_name = 'None'
        if 'lastName' in json_data:
            self._last_name = json_data['lastName'].encode('utf-8')
        else:
            self._last_name = 'None'
        if 'address' in json_data:
            address = json_data['address']
            if type(address) is dict:
                self._address = json_data['address']['id'].encode('utf-8')
            else:
                self._address = json_data['address'].encode('utf-8')
        else:
            self._address = 'None'
        if 'isActive' in json_data:
            if json_data['isActive'] == 'true' or json_data['isActive'] == 'True' or json_data['isActive'] == True:
                self._active = 1
            else:
                self._active = 0
        else:
            self._active = 0
        if 'invoiceConfiguration' in json_data:
            invConf = json_data['invoiceConfiguration']
            if 'textForReport' in invConf:
                self._report_text = invConf['textForReport']
            else:
                self._report_text = ''
            if 'value' in invConf:
                self._default_invoice = invConf['value']
            else:
                self._default_invoice = 0
        else:
            self._report_text = ''
            self._default_invoice = 0

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

