from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

from backend.ttrack.utils.action_decryptor import ActionDecryptor


class GdriveConnector:
    """Handle the access to Google Drive."""

    def __init__(self, config):
        """The initializer of the class.
         
        :param config: a valid configuration object of type ConfigReader 
        """
        self._drive = None
        self._share = config.share

    def connect(self):
        """Perform the oauth2 authentication for Google Drive.
        
        To connect to Google Drive an oauth2 authentication needs to be performed. For this purpose the
        settings.yaml file is used. After a first successful authentication (which requires manual input
        by the user, the credentials are stored in credential.json and are reused for all further logins.
        """
        try:
            gauth = GoogleAuth()
            self._drive = GoogleDrive(gauth)
        except:
            # TODO: error handling
            pass

    def disconnect(self):
        if not self._drive is None:
            # TODO: disconnect from gdrive (if necessary at all)
            pass

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






