import json
import logging

logger = logging.getLogger(__name__)

class IdMapper:
    """Maps a given ID to a different one, based on a set of static id mappings."""
    def __init__(self, id_mappings):
        """The initializer of the class.
        
        :type id_mapping: array of string tuples
        :param id_mapping: mapping of one id to another
        """
        self._id_mappings = id_mappings

    def map(self, id):
        """Performs the actual mapping of the given id, if part of the id_mapping list."""
        new_id = id
        if id in self._id_mappings.keys():
            new_id = self._id_mappings[id]
        return new_id


