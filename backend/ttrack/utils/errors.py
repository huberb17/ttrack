
class ConfigReaderError(Exception):
    def __init__(self, msg):
        self.message = msg
        self.code = 0x00000001