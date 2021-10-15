from datetime import datetime
from backend.ttrack.utils.errors import FtpConnectorError
import unittest
from unittest import mock
from backend.ttrack.cloud.ftp_connector import FtpConnector

class FtpConnectorTest(unittest.TestCase):

    def testFake(self):
        pass

    def testInit(self):
        config = mock.Mock()
        config.share = 'ttrack'
        config.user = 'user'
        config.passwd = 'pass'
        config.host = '1.2.3.4'
        ftp_conn = FtpConnector(config)
        self.assertEqual('ttrack', ftp_conn._share)
        self.assertEqual('user', ftp_conn._user)
        self.assertEqual('pass', ftp_conn._passwd)
        self.assertEqual('1.2.3.4', ftp_conn._host)

    def testBadConnection(self):
        ftp_conn = FtpConnector(TestUtils.get_bad_config())
        with self.assertRaises(FtpConnectorError):
            ftp_conn.connect()

    def testConnection(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        self.assertIsNone(ftp_conn._customer_data_files)
        self.assertIsNone(ftp_conn._workday_data_files)
        self.assertIsNone(ftp_conn._address_data_files)
        ftp_conn.connect()
        self.assertIsNotNone(ftp_conn._customer_data_files)
        self.assertIsNotNone(ftp_conn._workday_data_files)
        self.assertIsNotNone(ftp_conn._address_data_files)

    def testGetWorkday(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        ftp_conn.connect()
        id, wd = ftp_conn.get_next_workday()
        self.assertIsNotNone(id)
        self.assertIsNotNone(wd)

    def testGetCustomer(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        ftp_conn.connect()
        id, cust = ftp_conn.get_last_customer_data_file()
        self.assertIsNotNone(id)
        self.assertIsNotNone(cust)

    def testGetAddress(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        ftp_conn.connect()
        id, addr = ftp_conn.get_last_address_data_file()
        self.assertIsNotNone(id)
        self.assertIsNotNone(addr)

    def testGetAction(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        ftp_conn.connect()
        id, action = ftp_conn.get_next_action()
        self.assertIsNone(id)
        self.assertIsNone(action)

    def testEncryptAndUploadData(self):
        ftp_conn = FtpConnector(TestUtils.get_config())
        ftp_conn.connect()
        ftp_conn.encrypt_and_upload_data('my_test_file' + datetime.now().strftime("%Y%m%d_%H%M%S"), b'{ "msg": "my test data" }')

class TestUtils:
    @staticmethod
    def get_bad_config():
        config = mock.Mock()
        config.share = 'ttrack'
        config.user = 'user'
        config.passwd = 'pass'
        config.host = '192.168.0.47'
        return config

    @staticmethod
    def get_config():
        config = mock.Mock()
        config.share = 'ttrack'
        config.user = 'ttrack'
        import os
        sepp = os.path.dirname(os.path.realpath('__file__'))
        config.passwd = open('pass.txt', 'r').readline()
        config.host = '192.168.0.47'
        return config

if __name__ == "__main__":
    unittest.main()