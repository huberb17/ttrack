from __future__ import annotations
class Income:
    """Implements the Income object."""

    _id = 0
    _date = ''
    _text = ''
    _value = 0

    @staticmethod
    def build_from_values(id, date, text, value) -> Income:
        """Build object from distinct values."""
        income = Income()
        income._id = id
        income._date = date
        income._text = text
        income._value = value
        return income

    @staticmethod
    def build_from_json(json_data)->Income:
        """Build object from json data."""
        income = Income()
        income._id = json_data['id']
        income._date = json_data['date']
        income._text = json_data['text_for_report']
        income._value = json_data['value']
        return income

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'date': self._date,
            'text_for_report': self._text,
            'value': self._value
        }
        return data


