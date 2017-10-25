# coding=utf-8
import json
import os
import sqlite3

import logging
import datetime

from backend.ttrack.persistence.address import Address
from backend.ttrack.persistence.customer import Customer
from backend.ttrack.persistence.driven_route import DrivenRoute
from backend.ttrack.persistence.work_day import WorkDay
from backend.ttrack.utils.errors import DataStoreError

logger = logging.getLogger(__name__)

class DataStore:
    """Implements the data store of ttrack. Uses sqlite3 as data base."""
    def __init__(self, config):
        """The initializer method of the class - also connects to the data base."""
        self._changed = False
        self._conn = None
        try:
            self._dbname = config.dbname
            self._backup_path = config.db_backup_path
            self._conn = sqlite3.connect(self._dbname)
        except Exception as e:
            logger.info('received sqlite exception: {0}'.format(e.message))
            msg = 'Error connecting to database: {0}'.format(e.message)
            raise DataStoreError(msg)

    def disconnect(self):
        """Disconnect the database connection and commit unsaved data."""
        if not self._conn is None:
            self._conn.close()

    def update(self, action):
        """Persist the action in the data store."""
        try:
            type = action['type']
            self._check_action_type(type)
            command = action['command']
            data = action['data']
            sql_string = self._create_sql_string(command, data, type)
            c = self._conn.cursor()
            c.execute(sql_string)
            if (c.lastrowid != 0 and c.lastrowid != None) or (c.rowcount != 0 and c.rowcount != None):
                self._conn.commit()
                self._changed = True
        except DataStoreError:
            raise DataStoreError
        except Exception as err:
            raise DataStoreError(err.message)

    def force_data_storage(self, type, data):
        """Backups the current DB content and then replaces the content of table 'type' with data."""
        try:
            self.backup_db_content()
            if type == 'address':
                self._fore_address_data_storage(data)
            elif type == 'customer':
                self._force_customer_data_storage(data)
            elif type == 'workday':
                self._force_workday_data_storage(data)
            else:
                raise DataStoreError('Wrong type detected: {0}'.format(type))
        except DataStoreError:
            raise DataStoreError
        except Exception as err:
            raise DataStoreError(err.message)

    def _create_sql_string(self, command, data, type):
        if command == 'create':
            sql_string = self._sql_create_command(data, type)
        elif command == 'update':
            sql_string = self._sql_update_command(data, type)
        elif command == 'delete':
            sql_string = self._sql_delete_command(data, type)
        else:
            logger.info('unknown command received: {0}'.format(command))
            msg = 'Unknown command found in action: {0}'.format(command)
            raise DataStoreError(msg)
        return sql_string

    def _sql_create_command(self, data, type):
        if type == 'customer':
            data = Customer(data).convert_to_db_object()
            sql_string = '''INSERT OR IGNORE INTO customers VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}', {5})'''.format(
                data['id'], data['title'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            data = Address(data).convert_to_db_object()
            sql_string = '''INSERT OR IGNORE INTO addresses VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}', '{5}', '{6}', {7})'''.format(
                data['id'], data['street'], data['street_number'], data['door_number'], data['zip_code'], data['city'],
                data['note'], data['is_active']
            )
        elif type == 'driven_route':
            data = DrivenRoute(data).convert_to_db_object()
            sql_string = '''INSERT OR IGNORE INTO driven_routes VALUES ('{0}', '{1}', {2}, 
                                '{3}', '{4}', {5}, '{6}', '{7}')'''.format(
                data['id'], data['date'], data['start_km'], data['start_address_id'], data['end_address_id'],
                data['route_km'], data['invoice_ref'], data['comment']
            )
        elif type == 'expense':
            sql_string = '''INSERT OR IGNORE INTO expenses VALUES ('{0}', '{1}', {2}, {3}, '{4}')'''.format(
                data['id'], data['date'], data['text_for_report'], data['value'], data['category']
            )
        elif type == 'income':
            sql_string = '''INSERT OR IGNORE INTO incomes VALUES ('{0}', '{1}', {2}, {3})'''.format(
                data['id'], data['date'], data['text_for_report'], data['value']
            )
        return sql_string

    def _check_action_type(self, type):
        if type not in ['customer', 'address', 'driven_route', 'expense', 'income']:
            logger.info('unknown data type received: {0}'.format(type))
            msg = 'Unknown data type found in action: {0}'.format(type)
            raise DataStoreError(msg)

    def _sql_update_command(self, data, type):
        if type == 'customer':
            data = Customer(data).convert_to_db_object()
            sql_string = '''UPDATE customers SET id='{0}', title='{1}', first_name='{2}', 
                    last_name='{3}', address_id='{4}', is_active={5} WHERE id = '{0}' '''.format(
                data['id'], data['title'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            data = Address(data).convert_to_db_object()
            sql_string = '''UPDATE addresses SET id='{0}', street='{1}', street_number='{2}', 
                    door_number='{3}', zip_code='{4}', city='{5}', note='{6}', 
                    is_active={7} WHERE id = '{0}' '''.format(
                data['id'], data['street'], data['street_number'], data['door_number'], data['zip_code'], data['city'],
                data['note'], data['is_active']
            )
        elif type == 'driven_route':
            data = DrivenRoute(data).convert_to_db_object()
            sql_string = '''UPDATE driven_routes SET id='{0}', date='{1}', start_km={2}, 
                                start_address_id='{3}', end_address_id='{4}', route_km={5}, 
                                invoice_ref='{6}'  WHERE id = '{0}'  '''.format(
                data['id'], data['date'], data['start_km'], data['start_address_id'], data['end_address_id'],
                data['route_km'], data['invoice_ref']
            )
        elif type == 'expense':
            sql_string = '''UPDATE expenses SET id='{0}', date='{1}', text_for_report={2}, value={3}, 
            category='{4}'  WHERE id = '{0}' '''.format(
                data['id'], data['date'], data['text_for_report'], data['value'], data['category']
            )
        elif type == 'income':
            sql_string = '''UPDATE incomes SET id='{0}', date='{1}', text_for_report={2}, 
            value={3}  WHERE id = '{0}' '''.format(
                data['id'], data['date'], data['text_for_report'], data['value']
            )
        return sql_string

    def _sql_delete_command(self, data, type):
        if 'id' in data:
            id = data['id']
        else:
            id = data
        if type == 'customer':
            sql_string = '''DELETE FROM customers WHERE id = '{0}' '''.format(id)
        elif type == 'address':
            sql_string = '''DELETE FROM addresses WHERE id = '{0}' '''.format(id)
        elif type == 'driven_route':
            sql_string = '''DELETE FROM driven_routes VALUES WHERE id = '{0}'  '''.format(id)
        elif type == 'expense':
            sql_string = '''DELETE FROM expenses WHERE id = '{0}' '''.format(id)
        elif type == 'income':
            sql_string = '''DELETE FROM incomes WHERE id = '{0}' '''.format(id)
        return sql_string

    def get_milage_data(self, month, year):
        query_string = '''SELECT date, 
	                            start_km, 
                                (start_addr.street || ' ' || start_addr.street_number || ', ' || start_addr.zip_code || ' ' || start_addr.city) as start_address, 
                                (end_addr.street || ' ' || end_addr.street_number || ', ' || end_addr.zip_code || ' ' || end_addr.city) as end_address, 
                                route_km, 
                                comment, 
                                strftime('%m', date) as month, 
                                strftime('%Y', date) as year
                        FROM driven_routes 
	                        JOIN addresses as start_addr ON start_addr.id = driven_routes.start_address_id 
	                        JOIN addresses as end_addr ON end_addr.id = driven_routes.end_address_id
                        WHERE month = '{0:02d}' and year = '{1}' '''.format(month, year)

        c = self._conn.cursor()
        c.execute(query_string)
        data = []
        for row in c:
            data_row = ('generated',)
            index = 1
            for field in row:
                if index == 1:
                    # convert date
                    converted_field = datetime.datetime.strptime(field.strip(), "%Y-%m-%d")
                    data_row = data_row + (converted_field,)
                elif index > 6:
                    # skip those fields
                    pass
                else:
                    data_row = data_row + (field,)
                index += 1
            data.append(data_row)

        return data

    def backup_db_content(self):
        current_time = datetime.datetime.now()
        name = current_time.strftime("%Y-%m-%d_%H%M%S") + str(current_time.microsecond) + '.sql'
        filename = os.path.join(self._backup_path, name)
        with open(filename, 'w') as f:
            for line in self._conn.iterdump():
                f.write('{0}\n'.format(line.encode('utf-8')))

    def _fore_address_data_storage(self, data):
        addresses = json.loads(data)
        self._drop_table_content('addresses')
        for address_obj in addresses:
            address = Address(address_obj)
            self.update({'type': 'address',
                       'command': 'create',
                       'data': address.convert_to_db_object()
                       })

    def _force_customer_data_storage(self, data):
        customers = json.loads(data)
        self._drop_table_content('customers')
        for customer_obj in customers:
            customer = Customer(customer_obj)
            self.update({'type': 'customer',
                       'command': 'create',
                       'data': customer.convert_to_db_object()
                       })

    def _force_workday_data_storage(self, data):
        workdays = json.loads(data)
        self._drop_table_content('driven_routes')
        for workday_obj in workdays:
            workday = WorkDay(workday_obj)
            driven_routes = workday.get_driven_routes()
            for route in driven_routes:
                self.update({'type': 'driven_route',
                           'command': 'create',
                           'data': route.convert_to_db_object()})

    def _drop_table_content(self, table_name):
        try:
            sql_string = "DELETE FROM {0}".format(table_name)
            c = self._conn.cursor()
            c.execute(sql_string)
            self._conn.commit()
            self._changed = True
        except DataStoreError:
            raise DataStoreError
        except Exception as err:
            raise DataStoreError(err.message)

    def process(self, actions):
        for action in actions:
            self.update(action)


