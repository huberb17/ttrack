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
from tkinter import *

import utils.custom_logger as cl
from cloud.ftp_connector import FtpConnector
from ui.main_window import MainApplication
from ui.view_controller import ViewController
from utils.config_reader import ConfigReader
from utils.errors import ConfigReaderError, FtpConnectorError, DataStoreError
from export.excel_writer import ExcelWriter
from persistence.data_store import DataStore


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

    file_id, data = gd_conn.get_next_workday()
    while file_id is not None:
        workdays = json.loads(data)
        ds.try_add(workdays)
        file_id, data = gd_conn.get_next_workday()

def build_ui(main_window):
    pass

def main():
    """The main function for the ttrack module."""

    logger = cl.initialize_logging()
    logger.info('**************** main function called ****************')
    ds = None

    try:
        # read the configuration file
        config = ConfigReader('./resources/config.json')
        # initialize the helper classes
        ftp_conn = FtpConnector(config)
        ds = DataStore(config)
        excel_writer = ExcelWriter(config)

        # connect to FTP server and get the current list of files
        ftp_conn.connect()

        root = Tk()
        root.title("TTrack Desktop")
        controller = ViewController(ftp_conn, ds, excel_writer)
        MainApplication(root, controller, padding="3 3 12 12").grid(row=0, column=0)

        root.mainloop()

    except (ConfigReaderError, FtpConnectorError, DataStoreError) as err:
        logger.error(str(err.message))
    except BaseException as e:
        logger.error(str(e))
    finally:
        if ds is not None:
            ds.disconnect()

        for handler in logger.handlers:
            handler.close()
            logger.removeFilter(handler)

    #         # update the DB state by replaying all actions done at the frontend (address and customer)
    # #        process_actions(gd_conn, ds)
    #         # update the DB state by adding all workdays created at the frontend
    #         process_workdays(gd_conn, ds)
    #


if __name__ == '__main__':
    main()
