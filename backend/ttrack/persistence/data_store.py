
import sqlite3


class DataStore:
    def __init__(self, config):
        self._changed = False
        self._conn = None
        try:
            self._dbname = config.dbname
        except:
            # TODO: errorhandling
            pass

    def connect(self):
        try:
            self._conn = sqlite3.connect(self._dbname)
        except:
            # TODO: errorhandling
            pass
