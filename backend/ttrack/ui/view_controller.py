import json
from  operator import itemgetter


class ViewController:

    def __init__(self, gd, ds, ew):
        self._gdrive = gd
        self._datastore = ds
        self._excel_writer = ew
        self.workday_list = { }
        self.address_list = [ ]

    def load_workdays(self):
        file_id, data = self._gdrive.get_next_workday()
        self.workday_list = { }
        while file_id is not None:
            workdays = json.loads(data)
            for workday in workdays:
                if (workday['id'] in self.workday_list):
                    continue
                self.workday_list[workday['id']] = workday
            file_id, data = self._gdrive.get_next_workday()

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

    def remove_customer(self, customer_id):
        self._datastore.remove_customer(customer_id)

    def upload_current_addresses(self):
        """This function retrieves the address data from the DB and uploads it with
        the constant name 'addressFile.bin'."""
        data = self._datastore.get_addresses()
        self._gdrive.encrypt_and_upload_data('addressFile.bin', json.dumps(data))

    def upload_current_customers(self):
        """This function retrieves the customer data from the DB and uploads it with
        the constant name 'customerFile.bin'."""
        data = self._datastore.get_customers()
        self._gdrive.encrypt_and_upload_data('customerFile.bin', json.dumps(data))

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

    def create_excel_reports(self):
        """This functions backups and re-creates the excel reports."""
        self._excel_writer.backup_and_create(self._datastore)


