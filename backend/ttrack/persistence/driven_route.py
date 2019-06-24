from backend.ttrack.utils.id_mapper import IdMapper

class DrivenRoute:
    """Implements the DrivenRoute object."""

    def __init__(self, id, date, start_km, start_id, end_id, route_distance, comment, id_mappings):
        """The initializer method of the class."""
        self._id = id.encode('utf-8')
        self._date = date.encode('utf-8')
        self._start_km = start_km
        idMapper = IdMapper(id_mappings)
        self._start_id = idMapper.map(start_id).encode('utf-8')
        self._end_id = idMapper.map(end_id).encode('utf-8')
        self._route_distance = route_distance
        self._comment = comment.encode('utf-8')

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'date': self._date,
            'start_km': self._start_km,
            'start_address_id': self._start_id,
            'end_address_id': self._end_id,
            'route_km': self._route_distance,
            'invoice_ref': None,
            'comment': self._comment
        }
        return data



