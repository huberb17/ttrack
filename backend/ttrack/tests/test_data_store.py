import unittest

from backend.ttrack.persistence.data_store import DataStore
from backend.ttrack.utils.config_reader import ConfigReader


class DataStoreTest(unittest.TestCase):

    def test_create_address(self):
        config = ConfigReader('../resources/config.json')
        ds = DataStore(config)
        action = { 'type': 'address',
                   'command': 'create',
                   'data': { 'id': '12345',
                             'street': 'Ziegelfeld',
                             'number': '35',
                             'door': '1/3',
                             'zip_code': '3071',
                             'city': 'Boeheimkirchen',
                             'note': 'Heimatadresse',
                             'active': 1
                   }
                }
        ds.update(action)
        ds.disconnect()

    def test_update_address(self):
        config = ConfigReader('../resources/config.json')
        ds = DataStore(config)
        action = { 'type': 'address',
                   'command': 'update',
                   'data': { 'id': '12345',
                             'street': 'Ziegelfeld',
                             'number': '36',
                             'door': '',
                             'zip_code': '3071',
                             'city': 'Boeheimkirchen',
                             'note': 'Heimatadresse',
                             'active': 1
                   }
                }
        ds.update(action)
        ds.disconnect()

    def test_delete_address(self):
        config = ConfigReader('../resources/config.json')
        ds = DataStore(config)
        action = { 'type': 'address',
                   'command': 'delete',
                   'data': { 'id': '12345'
                   }
                }
        ds.update(action)
        ds.disconnect()


if __name__ == '__main__':
    unittest.main()
