import json
from  operator import itemgetter

import logging

from backend.ttrack.export.excel_writer import ExcelWriter

logger = logging.getLogger(__name__)

class ViewController:

    def __init__(self, gd, ds, ew):
        self._gdrive = gd
        self._datastore = ds
        self._excel_writer = ew
        self.workday_list = { }
        self.workday_list_db = { }
        self.address_list = [ ]

    def load_workdays_cloud(self):
        file_id, data = self._gdrive.get_next_workday()
        self.workday_list = { }
        while file_id is not None:
            workdays = json.loads(data)
            for workday in workdays:
                if (workday['id'] in self.workday_list):
                    continue
                self.workday_list[workday['id']] = workday
            file_id, data = self._gdrive.get_next_workday()

    def show_workdays_db(self):
        workdays = self._datastore.get_workdays()
        self.workday_list_db = { }
        for workday in workdays:
            self.workday_list_db[workday['id']] = workday


    def store_workday(self, workday):
        self._datastore.backup_db_content()
        self._datastore.try_add([workday])

    def get_addresses(self):
        self.address_list = self._datastore.get_addresses()
        sorted_list = sorted(self.address_list, key=itemgetter('city', 'street'))
        display_name = ()
        for item in sorted_list:
            display_name += (item['city'] + ', ' + item['street'],)

        return display_name, sorted_list

    def get_customers(self):
        self.customer_list = self._datastore.get_customers()
        sorted_list = sorted(self.customer_list, key=itemgetter('lastName', 'firstName'))
        display_name = ()
        for item in sorted_list:
            display_name += (item['lastName'] + ' ' + item['firstName'],)

        return display_name, sorted_list

    def store_address(self, address):
        self._datastore.set_address(address)

    def store_customer(self, customer):
        self._datastore.set_customer(customer)

    def remove_address(self, addr_id):
        self._datastore.remove_address(addr_id)

    def remove_customer(self, customer_id):
        self._datastore.remove_customer(customer_id)

    def upload_current_addresses(self):
        """This function retrieves the address data from the DB and uploads it with
        the constant name 'addressFile.bin'."""
        data = self._datastore.get_addresses()
        str_data = json.dumps(data)
        str_data = str_data.replace('None', '')
        self._gdrive.encrypt_and_upload_data('addressFile.bin', str_data)

    def upload_current_customers(self):
        """This function retrieves the customer data from the DB and uploads it with
        the constant name 'customerFile.bin'."""
        data = self._datastore.get_customers_with_address()
        str_data = json.dumps(data)
        str_data = str_data.replace('None', '')
        self._gdrive.encrypt_and_upload_data('customerFile.bin', str_data)

    def download_latest_addresses(self):
        """This function retrieves the latest address file from the cloud and overwrites the
        DB data with its content - directly, no safety net."""
        file_id, data = self._gdrive.get_last_address_data_file()
        self._datastore.force_data_storage('address', data)

    def download_latest_customers(self):
        """This function retrieves the latest customer file from the cloud and overwrites the
        DB data with its content - directly, no safety net."""
        file_id, data = self._gdrive.get_last_customer_data_file()
        self._datastore.force_data_storage('customer', data)

    def create_milage_report(self):
        """This function backups and re-creates the milage excel report."""
        try:
            self._excel_writer.backup_and_create(self._datastore, ExcelWriter.REPORT_MILAGE)
            return True
        except Exception as err:
            logger.error('failed to write milage report: {0}'.format(err.message))
            return False


    def create_income_report(self):
        """This function backups and re-creates the income excel report."""
        try:
            self._excel_writer.backup_and_create(self._datastore, ExcelWriter.REPORT_INCOME)
            return True
        except Exception as err:
            logger.error('failed to write income report: {0}'.format(err.message))
            return False
