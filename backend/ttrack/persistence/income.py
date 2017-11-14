class Income:
    """Implements the Income object."""

    def __init__(self, id, date, text, value):
        """The initializer method of the class."""
        self._id = id.encode('utf-8')
        self._date = date.encode('utf-8')
        self._text = text.encode('utf-8')
        self._value = value

    def convert_to_db_object(self):
        data = {
            'id': self._id,
            'date': self._date,
            'text_for_report': self._text,
            'value': self._value
        }
        return data


