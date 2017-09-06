
import sqlite3

import logging
import datetime

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
            self._conn.commit()
            self._changed = True
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
            sql_string = '''INSERT INTO customers VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}, {5})'''.format(
                data['id'], data['title'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            sql_string = '''INSERT INTO addresses VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}', '{5}', '{6}', {7})'''.format(
                data['id'], data['street'], data['number'], data['door'], data['zip_code'], data['city'],
                data['note'], data['active']
            )
        elif type == 'driven_route':
            sql_string = '''INSERT INTO driven_routes VALUES ('{0}', '{1}', {2}, 
                                '{3}', '{4}', {5}, '{6}')'''.format(
                data['id'], data['date'], data['start_km'], data['start_address_id'], data['end_address_id'],
                data['route_km'], data['invoice_ref']
            )
        elif type == 'expense':
            sql_string = '''INSERT INTO expenses VALUES ('{0}', '{1}', {2}, {3}, '{4}')'''.format(
                data['id'], data['date'], data['text_for_report'], data['value'], data['category']
            )
        elif type == 'income':
            sql_string = '''INSERT INTO incomes VALUES ('{0}', '{1}', {2}, {3})'''.format(
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
            sql_string = '''UPDATE customers SET id='{0}', title='{1}', first_name='{2}', 
                    last_name='{3}', address_id='{4}, is_active={5} WHERE id = '{0}' '''.format(
                data['id'], data['title'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            sql_string = '''UPDATE addresses SET id='{0}', street='{1}', street_number='{2}', 
                    door_number='{3}', zip_code='{4}', city='{5}', note='{6}', 
                    is_active={7} WHERE id = '{0}' '''.format(
                data['id'], data['street'], data['number'], data['door'], data['zip_code'], data['city'],
                data['note'], data['active']
            )
        elif type == 'driven_route':
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
        if type == 'customer':
            sql_string = '''DELETE FROM customers WHERE id = '{0}' '''.format(data['id'])
        elif type == 'address':
            sql_string = '''DELETE FROM addresses WHERE id = '{0}' '''.format(data['id'])
        elif type == 'driven_route':
            sql_string = '''DELETE FROM driven_routes VALUES WHERE id = '{0}'  '''.format(data['id'])
        elif type == 'expense':
            sql_string = '''DELETE FROM expenses WHERE id = '{0}' '''.format(data['id'])
        elif type == 'income':
            sql_string = '''DELETE FROM incomes WHERE id = '{0}' '''.format(data['id'])
        return sql_string

    def get_milage_data(self, month, year):
        query_string = '''SELECT date, start_km, start_addr.street as start_street, end_addr.street as end_street,
	                        route_km, comment, strftime('%m', date) as month, strftime('%Y', date) as year
                            FROM driven_routes JOIN addresses as start_addr JOIN addresses as end_addr 
                            WHERE start_addr.id = driven_routes.start_address_id and 
                            end_addr.id = driven_routes.end_address_id and month = '{0:02d}' and 
                            year = '{1}'  '''.format(month, year)

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