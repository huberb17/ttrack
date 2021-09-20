import ftplib
import logging
from ftplib import FTP

from backend.ttrack.utils.ttrack_decryptor import TTrackDecryptor
from backend.ttrack.utils.errors import FtpConnectorError

logger = logging.getLogger(__name__)

class FtpConnector:
    """Handle the access to the FTP storage."""

    def __init__(self, config):
        """The initializer of the class.
         
        :param config: a valid configuration object of type ConfigReader 
        """
        self._ftp = None
        self._file_list = None
        self._action_files = None
        self._customer_data_files = None
        self._address_data_files = None
        self._workday_data_files = None
        self._share = config.share
        self._host = config.host
        self._user = config.user
        self._passwd = config.passwd
        logger.info(f'initialized object with share: {self._share}')

    def connect(self):
        """Connect to the FTP storage and retrieve file list.
        """
        try:
            self._ftp = FTP(self._host, self._user, self._passwd)
            self._ftp.cwd(self._share)
            logger.info(f'connection to FTP host {self._host} and share {self._share} established')
            self._file_list = self._ftp.nlst()
            self._action_files = filter(lambda x: x.rfind('actions') > 0, self._file_list)
            self._customer_data_files = filter(lambda x: x.rfind('customers') > 0, self._file_list)
            self._address_data_files = filter(lambda x: x.rfind('addresses') > 0, self._file_list)
            self._workday_data_files = list(filter(lambda x: x.rfind('workdays') > 0, self._file_list))
            # logger.info('found files in share "{0}": {1}'.format(self._share, title_list))
        except IOError as io_err:
            logger.info(f'received IOError exception: {io_err.message}')
            msg = 'Unable to connect to FTP.'
            raise FtpConnectorError(msg)
        except ftplib.all_errors as e:
            logger.warn(f'received exception: ' + str(e))
            msg = 'Unable to connect to FTP.'
            raise FtpConnectorError(msg)

    def get_next_action(self):
        """Get the next action from FTP share (if available)."""
        try:
            file_id, action = self._get_next_action()
            return  file_id, action
        except Exception as e:
            logger.error(f'Error on getting next action: {str(e)}')
            return None, None

    def get_next_workday(self):
        """Get the next workday file from FTP share (if available)."""
        try:
            file_id, workday = self._get_next_workday()
            return file_id, workday
        except Exception as e:
            logger.error(f'Error on getting next workday file: {str(e)}')
            return None, None

    def delete_action(self, file_id):
        """Delete the specified action from FTP share.
        
        :param file_id: the id of the file to be deleted.
        """
        try:
            for f in self._action_files:
                if f == file_id:
                    self._action_files.remove(f)
                    logger.info(f'removed file "{f}" from list.')
                    self._ftp.delete(f)
                    logger.info(f'removed file "{f}".')
                    return file_id
            logger.info(f'file "{file_id} not found.')
            return None
        except:
            logger.error(f'Failed to remove file "{file_id}.')
            return None

    def _get_next_action(self):
        """Internal method that retrieves and decrypts the next action from FTP."""
        if len(self._action_files) == 0:
            logger.info('file list is empty')
            self._update_file_list()
            if len(self._action_files) == 0:
                return None, None
        next_file = self._action_files[0]
        file_id = next_file
        logger.info(f'got file "{file_id} from list.')
        self._ftp.retrbinary("RETR " + file_id, open('tmpfile', 'wb').write)
        action = TTrackDecryptor.decrypt('tmpfile')
        return file_id, action

    def _get_next_workday(self):
        """Internal method that retrieves and decrypts the next workday file from FTP."""
        if len(self._workday_data_files) == 0:
            return None, None
        next_file = self._workday_data_files.pop(0)
        file_id = next_file
        logger.info(f'got file "{file_id} from list.')
        self._ftp.retrbinary("RETR " + file_id, open('tmpfile', 'wb').write)
        workday = TTrackDecryptor.decrypt('tmpfile')
        return file_id, workday

    def _update_file_list(self):
        logger.info('retrieve file list from FTP')
        self._file_list = self._ftp.nlst()
        self._action_files = filter(lambda x: x.rfind('actions') > 0, self._file_list)

    def get_last_address_data_file(self):
        """Get the last address data file from FTP (if available)."""
        try:
            file_id, data = self._get_last_data_file(self._address_data_files)
            return file_id, data
        except Exception as e:
            logger.error(f'Error on getting last address data file: {e.message}')
            return None, None

    def get_last_customer_data_file(self):
        """Get the last customer data file from FTP (if available)."""
        try:
            file_id, data = self._get_last_data_file(self._customer_data_files)
            return file_id, data
        except Exception as e:
            logger.error(f'Error on getting last customer data file: {e.message}')
            return None, None

    def _get_last_data_file(self, file_list):
        """Internal method that retrieves and decrypts the address data file with the largest date (the newest)
        from FTP."""
        count = len(file_list)
        if  count == 0:
            logger.info('address data file list is empty')
            return None, None
        last_file = file_list[count-1]
        file_id = last_file
        logger.info(f'got file "{file_id} from list.')
        self._ftp.retrbinary("RETR " + file_id, open('tmpfile', 'wb').write)
        data = TTrackDecryptor.decrypt('tmpfile')
        return file_id, data

    def encrypt_and_upload_data(self, filename, data):
        """Method to enrypt the given data and store it on Google Drive with the given name."""
        try:
            encrypted = TTrackDecryptor.encrypt(data)
            self._ftp.storbinary('STOR ' + filename, encrypted)
        except Exception as e:
            logger.error(f'Error uploading file: {e.message}')
            raise FtpConnectorError(e.message)
