
class ConfigReaderError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000001

class GdriveConnectorError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000002

class DataStoreError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000004

class ExcelWriterError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000008

class FtpConnectorError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000010