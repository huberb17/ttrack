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

def main():
    """The main function for the ttrack module."""

    logger = cl.initialize_logging()
    logger.info('**************** main function called ****************')
    ds = None

    try:
        config = ConfigReader('./resources/config.json')
#        gd_conn = GdriveConnector(config)
        ds = DataStore(config)
        excel_writer = ExcelWriter(config)

#        gd_conn.connect()
        # gd_conn.populate_drive() # remove this after tests are finished
        # the following is some kind of admin functionality - is not done in every
        # months usage
        # file_id, data = gd_conn.get_last_address_data_file()
        # ds.force_data_storage('address', data)
        # file_id, data = gd_conn.get_last_customer_data_file()
        # ds.force_data_storage('customer', data)
        # file_id, data = gd_conn.get_last_workday_data_file()
        # ds.force_data_storage('workday', data)

#        process_actions(gd_conn, ds)
#        process_workdays(gd_conn, ds)

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
