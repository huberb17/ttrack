from __future__ import annotations
try:
    from utils.id_mapper import IdMapper
except:
    from backend.ttrack.utils.id_mapper import IdMapper

class DrivenRoute:
    """Implements the DrivenRoute object."""

    _id = ''
    _date = ''
    _start_km = 0
    _start_id = ''
    _end_id = ''
    _route_distance = 0
    _comment = ''

    @staticmethod
    def build_from_values(id, date, start_km, start_id, end_id, route_distance, comment, id_mappings) -> DrivenRoute:
        """Build object from distinct values."""
        dr = DrivenRoute()
        dr._id = id
        dr._date = date
        dr._start_km = start_km
        idMapper = IdMapper(id_mappings)
        dr._start_id = idMapper.map(start_id)
        dr._end_id = idMapper.map(end_id)
        dr._route_distance = route_distance
        dr._comment = comment
        return dr

    @staticmethod
    def build_from_json(json_data, id_mappings) -> DrivenRoute:
        """Build object from json data."""
        dr = DrivenRoute()
        dr._id = json_data['id']
        dr._date = json_data['date']
        dr._start_km = json_data['start_km']
        idMapper = IdMapper(id_mappings)
        dr._start_id = idMapper.map(json_data['start_address'])
        dr._end_id = idMapper.map(json_data['end_address'])
        dr._route_distance = json_data['route_distance']
        dr._comment = json_data['comment']
        return dr

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