class Expense:
    """Implements the Expense object."""

    def __init__(self, category, km_factor, route):
        """The initializer method of the class."""
        self._id = route._id.encode('utf-8')
        self._category = category.encode('utf-8')
        self._date = route._date.encode('utf-8')
        self._text = route._comment
        self._value = float(route._route_distance) * km_factor

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'date': self._date,
            'text_for_report': self._text,
            'value': self._value,
            'category': self._category,
        }
        return data


