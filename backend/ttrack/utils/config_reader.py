import json
import logging

from utils.errors import ConfigReaderError

logger = logging.getLogger(__name__)

class ConfigReader:
    """Read the specified configuration and provide the values as attributes."""
    def __init__(self, file_name):
        """The initializer of the class.
        
        :type file_name: str
        :param file_name: the name of the configuration file (in JSON format).
        """
        try:
            logger.info('open and parse config file: {0}'.format(file_name))
            with open(file_name, 'rb') as json_file:
                config = json.load(json_file)
            self.dbname = config['dbName']
            self.db_backup_path = config['dbBackupPath']
            self.share = config['shareName']
            self.oaut_settings = config['oauthSettingsFile']
            self.export_milage = config['exportMilage']
            self.export_income = config['exportIncome']
            self.export_path = config['exportBackup']
            self.user = config['userName']
            self.passwd = config['passwd']
            self.host = config['host']
            self.id_mappings = dict()
            for id_mapping in config['idMappings']:
                self.id_mappings[id_mapping['original']] = id_mapping['new']
            logger.info('successfully read config file')
        except IOError as io_err:
            logger.info('received IO exception: {0}'.format(io_err.strerror))
            msg = 'Unable to open configuration file {0}: {1}'.format(file_name, io_err.strerror)
            raise ConfigReaderError(msg)
        except KeyError as key_err:
            logger.info('key not found in configuration: {0}'.format(key_err.message))
            msg = 'Missing key "{1}" in configuration file "{0}".'.format(file_name, key_err.message)
            raise ConfigReaderError(msg)

