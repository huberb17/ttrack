
import sqlite3

import logging

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
        except DataStoreError as ds_err:
            raise DataStoreError
        except Exception as err:
            raise DataStoreError(e.message)

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
                    '{3}', '{4})'''.format(
                data['id'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            sql_string = '''INSERT INTO address VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}', '{5}')'''.format(
                data['id'], data['street'], data['number'], data['zip_code'], data['city'],
                data['active']
            )
        elif type == 'workday':
            # TODO: design format of workday table
            pass
        return sql_string

    def _check_action_type(self, type):
        if type not in ['customer', 'address', 'workday']:
            logger.info('unknown data type received: {0}'.format(type))
            msg = 'Unknown data type found in action: {0}'.format(type)
            raise DataStoreError(msg)

    def _sql_update_command(self, data, type):
        if type == 'customer':
            sql_string = '''UPDATE customers VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}) WHERE 'id' = '{0}' '''.format(
                data['id'], data['first_name'], data['last_name'], data['address_id'],
                data['active']
            )
        elif type == 'address':
            sql_string = '''UPDATE address VALUES ('{0}', '{1}', '{2}', 
                    '{3}', '{4}', '{5}') WHERE 'id' = '{0}' '''.format(
                data['id'], data['street'], data['number'], data['zip_code'], data['city'],
                data['active']
            )
        elif type == 'workday':
            # TODO: design format of workday table
            pass
        return sql_string

    def _sql_delete_command(self, data, type):
        if type == 'customer':
            sql_string = '''DELETE FROM customers WHERE 'id' = '{0}' '''.format(data['id'])
        elif type == 'address':
            sql_string = '''DELETE FROM address WHERE 'id' = '{0}' '''.format(data['id'])
        elif type == 'workday':
            # TODO: design format of workday table
            pass
        return sql_string
