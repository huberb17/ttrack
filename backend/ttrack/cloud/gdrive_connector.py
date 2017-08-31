import logging
import os

from googleapiclient.errors import HttpError
from pydrive.auth import GoogleAuth, AuthenticationRejected, AuthError
from pydrive.drive import GoogleDrive
from pydrive.settings import InvalidConfigError

from backend.ttrack.utils.action_decryptor import ActionDecryptor
from backend.ttrack.utils.errors import GdriveConnectorError

logger = logging.getLogger(__name__)

class GdriveConnector:
    """Handle the access to Google Drive."""

    def __init__(self, config):
        """The initializer of the class.
         
        :param config: a valid configuration object of type ConfigReader 
        """
        self._drive = None
        self._file_list = None
        self._share = config.share
        self._settings = config.oaut_settings
        logger.info('initialized object with share: {0} and settings: {1}'.format(self._share, self._settings))

    def connect(self):
        """Perform the oauth2 authentication for Google Drive.
        
        To connect to Google Drive an oauth2 authentication needs to be performed. For this purpose the
        settings.yaml file is used. After a first successful authentication (which requires manual input
        by the user, the credentials are stored in credential.json and are reused for all further logins.
        """
        try:
            gauth = GoogleAuth(settings_file=self._settings)
            self._drive = GoogleDrive(gauth)
            query_string = "'root' in parents and trashed=false and title = 'frontend'"
            result_list = self._drive.ListFile({'q': query_string}).GetList()
            self._share_id = result_list[0]['id']
            logger.info('connection to Google Drive established')
            self._update_file_list()
            title_list = map(lambda x: x['title'], self._file_list)
            logger.info('found files in share "{0}": {1}'.format(self._share, title_list))
        except IOError as io_err:
            logger.info('received InvalidConfigError exception: {0}'.format(io_err.message))
            msg = 'Unable to connect to GoogleDrive.'
            raise GdriveConnectorError(msg)
        except AuthError as auth_err:
            logger.info('received AuthError exception: {0}'.format(auth_err.message))
            msg = 'Authentication to GoogleDrive failed.'
            raise GdriveConnectorError(msg)
        except HttpError as err:
            logger.info('received HttpError exception: {0}'.format(err.content))
            msg = 'Access to Google Drive failed.'
            raise GdriveConnectorError(msg)

    def get_next_action(self):
        """Get the next action from Google Drive (if available)."""
        try:
            file_id, action = self._get_next_action()
            return  file_id, action
        except Exception as e:
            logger.error('Error on getting next action: {0}'.format(e.message))
            return None, None

    def delete_action(self, file_id):
        """Delete the specified action from Google Drive.
        
        :param file_id: the id of the file to be deleted.
        """
        try:
            # TODO: delete action in _share at _drive
            for f in self._file_list:
                if f['id'] == file_id:
                    self._file_list.remove(f)
                    logger.info('removed file with id "{0} from list.'.format(file_id))
                    f.Trash()
                    logger.info('moved file with id "{0} to trash on Google Drive.'.format(file_id))
                    return file_id
            logger.info('file with id "{0} not found.'.format(file_id))
            return None
        except:
            logger.error('Failed to remove file with id "{0}.'.format(file_id))
            return None

    def _get_next_action(self):
        """Internal method that retrieves and decrypts the next action from Google Drive."""
        if len(self._file_list) == 0:
            logger.info('file list is empty')
            self._update_file_list()
            if len(self._file_list) == 0:
                return None, None
        next_file = self._file_list[0]
        file_id = next_file['id']
        logger.info('got file with id "{0} from list.'.format(file_id))
        next_file.GetContentFile('tmpfile')
        action = ActionDecryptor.decrypt('tmpfile')
        return file_id, action

    def _update_file_list(self):
        logger.info('retrieve file list from Google Drive')
        self._file_list = self._drive.ListFile({'q': "'{0}' in parents and trashed=false".format(self._share_id),
                                                'orderBy': 'title'}).GetList()


    def populate_drive(self):
        """Function to populate the drive first - will be removed."""
        self._populate_helper('./resources/20170831-140610.json')
        self._populate_helper('./resources/20170831-140630.json')
        self._populate_helper('./resources/20170831-140730.json')

    def _populate_helper(self, filename):
        with open(filename, 'rb') as json_file:
            data = json_file.read()
            bin_name = os.path.basename(filename).split('.')[0] + '.bin'
            ActionDecryptor.encrypt(data, bin_name)
        tmpfile = self._drive.CreateFile({"parents": [{"kind": "drive#fileLink", "id": self._share_id}]})
        tmpfile.SetContentFile(bin_name)
        tmpfile.Upload()


