import logging

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
            self._file_list = self._drive.ListFile({'q': "'{0}' in parents".format(self._share_id),
                                                    'orderBy': 'title'}).GetList()
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
        except:
            # TODO: log error
            return None, None

    def delete_action(self, file_id):
        """Delete the specified action from Google Drive.
        
        :param file_id: the id of the file to be deleted.
        """
        try:
            # TODO: delete action in _share at _drive
            return file_id
        except:
            # TODO: log error
            return None

    def _get_next_action(self):
        """Internal method that retrieves and decrypts the next action from Google Drive."""
        # TODO: look up in _share at _drive an return oldest file
        file_id = ''
        encrypted_action = ''
        # TODO: decrypt the action
        action = ActionDecryptor.decrypt(encrypted_action)
        return file_id, action






