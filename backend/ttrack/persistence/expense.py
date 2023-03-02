from __future__ import annotations
class Expense:
    """Implements the Expense object."""

    _id = 0
    _category = ''
    _date = ''
    _text = ''
    _value = 0

    @staticmethod
    def build_from_values(category, km_factor, route) -> Expense:
        """Build object from distinct values."""
        expense = Expense()
        expense._id = route._id
        expense._category = category
        expense._date = route._date
        expense._text = route._comment
        expense._value = float(route._route_distance) * km_factor
        return expense

    @staticmethod
    def build_from_json(json_data):
        """Build object from json data."""
        expense = Expense()
        expense._id = json_data['id']
        expense._category = json_data['category']
        expense._date = json_data['date']
        expense._text = json_data['text_for_report']
        expense._value = json_data['value']
        return expense

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'date': self._date,
            'text_for_report': self._text,
            'value': self._value,
            'category': self._category,
        }
        return data


