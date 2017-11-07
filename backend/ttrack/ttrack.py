"""Get the updates from the cloud and persist it locally (in data store and human readable).
 
The purpose of this module is to check the cloud storage (GoogleDrive at the moment) for new actions,
update the data store (sqlite3 data base at the moment) according to the found actions and export the
updated data into a human readable format (MS Excel at the moment).
Actions are one of:
-- create
-- update
-- delete
"""

import json
import backend.ttrack.utils.custom_logger as cl
from backend.ttrack.cloud.gdrive_connector import GdriveConnector
from backend.ttrack.utils.config_reader import ConfigReader
from backend.ttrack.utils.errors import ConfigReaderError, GdriveConnectorError, DataStoreError
from backend.ttrack.export.excel_writer import ExcelWriter
from backend.ttrack.persistence.data_store import DataStore
from backend.ttrack.utils.ttrack_decryptor import TTrackDecryptor


def process_actions(gd_conn, ds):
    """This function creates a backup of the database and processes all update
    actions on Google Drive and delete them on success."""
    ds.backup_db_content()

    file_id, data = gd_conn.get_next_action()
    while file_id is not None:
        actions = json.loads(data)
        ds.process(actions)
        gd_conn.delete_action(file_id)
        file_id, data = gd_conn.get_next_action()


def process_workdays(gd_conn, ds):
    """This function creates a backup of the database and processes all workday
    files on Google Drive (they remain there)."""
    ds.backup_db_content()

    # file_id, data = gd_conn.get_next_workday()
    # while file_id is not None:
    #     workdays = json.loads(data)
    #     ds.try_add(workdays)
    #     file_id, data = gd_conn.get_next_workday()
    data = TTrackDecryptor.decrypt('2017-10-25T14_41_57.885Z_workdays.bin')
    workdays = json.loads(data)
    ds.try_add(workdays)


def upload_current_customers(data_store, google_drive):
    """This function retrieves the customer data from the DB and uploads it with
    the constant name 'customerFile.bin'."""
    data = data_store.get_customers()
    google_drive.encrypt_and_upload_data('customerFile.bin', json.dumps(data))


def upload_current_addresses(data_store, google_drive):
    """This function retrieves the address data from the DB and uploads it with
    the constant name 'addressFile.bin'."""
    data = data_store.get_addresses()
    google_drive.encrypt_and_upload_data('addressFile.bin', json.dumps(data))


def main():
    """The main function for the ttrack module."""

    logger = cl.initialize_logging()
    logger.info('**************** main function called ****************')
    ds = None

    try:
        # read the configuration file
        config = ConfigReader('./resources/config.json')
        # initialize the helper classes
        gd_conn = GdriveConnector(config)
        ds = DataStore(config)
        excel_writer = ExcelWriter(config)

        # connect to Google Drive and get the current list of files
        gd_conn.connect()

        # this is optional: upload the current customers and addresses to the drive
#        upload_current_customers(ds, gd_conn)
        upload_current_addresses(ds, gd_conn)

        # the following is some kind of admin functionality - is not done in every
        # months usage - it wipes the DB and stores only the last addresses, customers and
        # workdays
        # file_id, data = gd_conn.get_last_address_data_file()
        # ds.force_data_storage('address', data)
        # file_id, data = gd_conn.get_last_customer_data_file()
        # ds.force_data_storage('customer', data)
        # file_id, data = gd_conn.get_last_workday_data_file()
        # ds.force_data_storage('workday', data)

        # update the DB state by replaying all actions done at the frontend (address and customer)
#        process_actions(gd_conn, ds)
        # update the DB state by adding all workdays created at the frontend
#        process_workdays(gd_conn, ds)

        # re-create the excel reports
        excel_writer.backup_and_create(ds)

    except (ConfigReaderError, GdriveConnectorError, DataStoreError) as err:
        logger.error(err.message)
    except Exception as e:
        logger.error(e.message)
    finally:
        if ds is not None:
            ds.disconnect()

        for handler in logger.handlers:
            handler.close()
            logger.removeFilter(handler)

if __name__ == '__main__':
    main()
