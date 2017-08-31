"""Get the updates from the cloud and persist it locally (in data store and human readable).
 
The purpose of this module is to check the cloud storage (GoogleDrive at the moment) for new actions,
update the data store (sqlite3 data base at the moment) according to the found actions and export the
updated data into a human readable format (MS Excel at the moment).
Actions are one of:
-- create
-- update
-- delete
"""

import backend.ttrack.utils.custom_logger as cl
from backend.ttrack.utils.config_reader import ConfigReader
from backend.ttrack.utils.errors import ConfigReaderError, GdriveConnectorError
from backend.ttrack.cloud.gdrive_connector import GdriveConnector
from backend.ttrack.export.excel_writer import ExcelWriter
from backend.ttrack.persistence.data_store import DataStore

def main():
    """The main function for the ttrack module."""

    logger = cl.initialize_logging()
    logger.info('**************** main function called ****************')
    ds = None

    try:
        config = ConfigReader('./resources/config.json')
        gd_conn = GdriveConnector(config)
        ds = DataStore(config)
        excel_writer = ExcelWriter(config)

        gd_conn.connect()
        file_id, action = gd_conn.get_next_action()
        while file_id is not None:
            # TODO persist the action
            gd_conn.delete_action(file_id)
            file_id, action = gd_conn.get_next_action()
        # TODO: backup and create new excel file
        excel_writer.backup_and_create(ds)
    except (ConfigReaderError, GdriveConnectorError) as err:
        logger.error(err.message)
    finally:
        if ds is not None:
            ds.disconnect()

        for handler in logger.handlers:
            handler.close()
            logger.removeFilter(handler)

if __name__ == '__main__':
    main()
