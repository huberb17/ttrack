import unittest

from backend.ttrack.persistence.data_store import DataStore
from backend.ttrack.utils.config_reader import ConfigReader


class DataStoreTest(unittest.TestCase):

    ds: DataStore

    def setUp(self) -> None:
        config = ConfigReader('backend/ttrack/resources/config.json')
        self.ds = DataStore(config)
        with open("backend/ttrack/tests/ttrack_schema.sql", "r") as f:
            sqlstring = f.read().replace('\n', '')
        sql_cmds = sqlstring.split(';')
        for cmd in sql_cmds:
            self.ds.raw_execute(cmd)
        
    def tearDown(self) -> None:
        self.ds.disconnect()

    def test_get_addresses(self):
        addr_list = self.ds.get_addresses()
        self.assertEqual(1, len(addr_list))
        self.assertEqual('123', addr_list[0]['id'])
        self.assertEqual('MyStreet', addr_list[0]['street'])
        self.assertEqual('123', addr_list[0]['streetNumber'])
        self.assertEqual('1a', addr_list[0]['doorNumber'])
        self.assertEqual('1010', addr_list[0]['zipCode'])
        self.assertEqual('HomeTown', addr_list[0]['city'])
        self.assertEqual('My Home Address', addr_list[0]['note'])
        self.assertEqual(1, addr_list[0]['isActive'])

    def test_remove_address(self):
        addr_list = self.ds.get_addresses()
        self.assertEqual(1, len(addr_list))
        self.ds.remove_address('123')
        addr_list = self.ds.get_addresses()
        self.assertEqual(0, len(addr_list))

    def test_create_address(self):
        addr_list = self.ds.get_addresses()
        self.assertEqual(1, len(addr_list))
        action = { 'type': 'address',
                   'command': 'create',
                   'data': { 'id': '12345',
                             'street': 'Ziegelfeld',
                             'streetNumber': '35',
                             'doorNumber': '1/3',
                             'zipCode': '3071',
                             'city': 'Böheimkirchen',
                             'note': 'Heimatadresse',
                             'isActive': 'True'
                   }
                }
        self.ds.update(action)
        addr_list = self.ds.get_addresses()
        self.assertEqual(2, len(addr_list))     

    def test_update_address(self):
        addr_list = self.ds.get_addresses()
        self.assertEqual('MyStreet', addr_list[0]['street'])
        action = { 'type': 'address',
                   'command': 'update',
                   'data': { 'id': '123',
                             'street': 'Ziegelfeld',
                             'streetNumber': '36',
                             'doorNumber': '',
                             'zipCode': '3071',
                             'city': 'Böheimkirchen',
                             'note': 'Heimatadresse',
                             'isActive': 'True'
                   }
                }
        self.ds.update(action)
        addr_list = self.ds.get_addresses()
        self.assertEqual('Ziegelfeld', addr_list[0]['street'])        

    def test_delete_address(self):
        action = { 'type': 'address',
                   'command': 'delete',
                   'data': { 'id': '123'
                   }
                }
        self.ds.update(action)
        addr_list = self.ds.get_addresses()
        self.assertEqual(0, len(addr_list))

    def test_set_addresses(self):
        addr_list = self.ds.get_addresses()
        self.assertEqual(1, len(addr_list))
        data = { 'id': '123', 'street': 'Ziegelfeld', 'streetNumber': '36', 'doorNumber': '', 'zipCode': '3071',
                    'city': 'Böheimkirchen', 'note': 'Heimatadresse', 'isActive': 'True' }
        self.ds.set_address(data)
        addr_list = self.ds.get_addresses()
        self.assertEqual(1, len(addr_list))
        data = { 'id': '1234', 'street': 'Ziegelfeld', 'streetNumber': '36', 'doorNumber': '', 'zipCode': '3071',
                    'city': 'Böheimkirchen', 'note': 'Heimatadresse', 'isActive': 'True' }
        self.ds.set_address(data)
        addr_list = self.ds.get_addresses()
        self.assertEqual(2, len(addr_list))
        
    def test_get_customers(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))

    def test_remove_customer(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        self.ds.remove_customer('1')
        cust_list = self.ds.get_customers()
        self.assertEqual(0, len(cust_list))

    def test_remove_customer_not_exists(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        self.ds.remove_customer('123')
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))        

    def test_create_customer(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        action = { 'type': 'customer',
                   'command': 'create',
                   'data': { 'id': '123', 
                                'title': 'Mr.', 
                                'firstName': 'Nice', 
                                'lastName': 'Guy', 
                                'address': '123', 
                                'isActive': 1, 
                                'invoiceConfiguration': { 'textForReport': 'text123', 'value': '1000' }
                   }
                }
        self.ds.update(action)
        cust_list = self.ds.get_customers()
        self.assertEqual(2, len(cust_list))     

    def test_update_customer(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        self.assertEqual('1000', cust_list[0]['invoiceConfiguration'])
        action = { 'type': 'customer',
                   'command': 'update',
                   'data': { 'id': '1', 
                                'title': 'Mr.', 
                                'firstName': 'Nice', 
                                'lastName': 'Guy', 
                                'address': '123', 
                                'isActive': 1, 
                                'invoiceConfiguration': { 'textForReport': 'text123', 'value': '5000' }
                   }
                }
        self.ds.update(action)
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))     
        self.assertEqual('5000', cust_list[0]['invoiceConfiguration'])

    def test_delete_customer(self):
        action = { 'type': 'customer',
                   'command': 'delete',
                   'data': { 'id': '1'
                   }
                }
        self.ds.update(action)
        cust_list = self.ds.get_customers()
        self.assertEqual(0, len(cust_list))

    def test_set_customer(self):
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        data = { 'id': '1', 'title': 'Mr.', 'firstName': 'Nice', 'lastName': 'Guy', 
                    'addressId': '123', 'isActive': 1, 'reportText': 'myReport', 'defaultInvoice': '1000' }
        self.ds.set_customer(data)
        cust_list = self.ds.get_customers()
        self.assertEqual(1, len(cust_list))
        data = { 'id': '12', 'title': 'Mr.', 'firstName': 'Nice', 'lastName': 'Guy', 
                    'addressId': '123', 'isActive': 1, 'reportText': 'myReport', 'defaultInvoice': '1000' }
        self.ds.set_customer(data)
        cust_list = self.ds.get_customers()
        self.assertEqual(2, len(cust_list))

    def test_force_data_storage(self):
        config = ConfigReader('backend/ttrack/resources/config.json')
        ds = DataStore(config)
        data = """[{ "id": "123", "street": "Ziegelfeld", "streetNumber": "36", "doorNumber": "", "zipCode": "3071",
                     "city": "Böheimkirchen", "note": "Heimatadresse", "isActive": "True" }]"""
        ds.force_data_storage('address', data)
        ds.disconnect()

    def test_create_driven_route(self):
        action = { 'type': 'driven_route',
                   'command': 'create',
                   'data': { 'id': '123', 
                                'date': '2021-10-19', 
                                'start_km': '12345', 
                                'start_address': '123', 
                                'end_address': '123', 
                                'route_distance': '100', 
                                'invoice_ref': '1',
                                'comment': 'no comment' }
                }
        self.ds.update(action)

    def test_update_driven_route(self):
        action = { 'type': 'driven_route',
                   'command': 'update',
                   'data': { 'id': '1', 
                                'date': '2021-10-19', 
                                'start_km': '12345', 
                                'start_address': '123', 
                                'end_address': '123', 
                                'route_distance': '100', 
                                'invoice_ref': '1',
                                'comment': 'there is a comment' }
                }
        self.ds.update(action)

    def test_delete_driven_route(self):
        action = { 'type': 'driven_route',
                   'command': 'delete',
                   'data': { 'id': '1' }
                }
        self.ds.update(action)

    def test_create_income(self):
        action = { 'type': 'income',
                   'command': 'create',
                   'data': { 'id': '123', 
                                'date': '2021-10-19', 
                                'text_for_report': 'Income 1', 
                                'value': 200 }
                }
        self.ds.update(action)

    def test_update_income(self):
        action = { 'type': 'income',
                   'command': 'update',
                   'data': { 'id': '1', 
                                'date': '2021-10-19', 
                                'text_for_report': 'Income 1 - Updated', 
                                'value': 200 }
                }
        self.ds.update(action)

    def test_delete_income(self):
        action = { 'type': 'income',
                   'command': 'delete',
                   'data': { 'id': '1' }
                }
        self.ds.update(action)

    def test_create_expense(self):
        action = { 'type': 'expense',
                   'command': 'create',
                   'data': { 'id': '123', 
                                'date': '2021-10-20', 
                                'text_for_report': 'Expense km 1', 
                                'value': 20,
                                'category': 'km' }
                }
        self.ds.update(action)
    
    def test_update_expense(self):
        action = { 'type': 'expense',
                   'command': 'update',
                   'data': { 'id': '1', 
                                'date': '2021-10-20', 
                                'text_for_report': 'Expense km 1', 
                                'value': 20,
                                'category': 'km' }
                }
        self.ds.update(action)

    def test_delete_expense(self):
        action = { 'type': 'expense',
                   'command': 'delete',
                   'data': { 'id': '1' }
                }
        self.ds.update(action)

    def test_get_milage_data(self):
        milage = self.ds.get_milage_data('10', '2021')
    
    def test_get_expense_data(self):
        self.assertFalse(True)

    def test_try_add(self):
        self.assertFalse(True)

    def test_process(self):
        self.assertFalse(True)

    def test_get_customers_with_address(self):
        self.assertFalse(True)

    def test_get_workdays(self):
        self.assertFalse(True)


if __name__ == '__main__':
    unittest.main()
