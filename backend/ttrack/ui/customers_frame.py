from Tkinter import *
from ttk import *

class CustomersFrame(Frame):
    def __init__(self, parent, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.parent = parent

        # some mock data
        self.mock_customers = [
            {'id': 1, 'title': 'Herr', 'firstName': 'Papa', 'lastName': 'Schlumpf', 'address': '1', 'isActive': True},
            {'id': 2, 'title': 'Frau', 'firstName': 'Mama', 'lastName': 'Schlumpf', 'address': '1', 'isActive': True},
            {'id': 3, 'title': 'Dr.', 'firstName': 'Gagamel', 'lastName': 'Zauberer', 'address': '2', 'isActive': True}
        ]

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1, pad=5)
        self.columnconfigure(1, weight=1, pad=5)
        self.rowconfigure(0, weight=1, pad=5)

        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        lf = Labelframe(self, text='Kunden')
        lf.grid(column=0, row=0)
        self.customerList = Listbox(lf)
        self.customerList.pack()

        for item in self.mock_customers:
            self.customerList.insert(END, item['firstName'] + ' ' + item['lastName'])

        dlf = LabelFrame(self, text='Kundendetails')
        dlf.grid(column=1, row=0, sticky=(N))
        Label(dlf, text='id:').grid(column=1, row=1, sticky=(E))
        self.id_var = StringVar()
        id_entry = Entry(dlf, textvariable=self.id_var)
        id_entry.grid(column=2, row=1, sticky=(W))

        Label(dlf, text='Anrede:').grid(column=1, row=2, sticky=(E))
        self.title_var = StringVar()
        title_entry = Entry(dlf, textvariable=self.title_var)
        title_entry.grid(column=2, row=2, sticky=(W))

        Label(dlf, text='Vorname:').grid(column=1, row=3, sticky=(E))
        self.firstname_var = StringVar()
        firstname_entry = Entry(dlf, textvariable=self.firstname_var)
        firstname_entry.grid(column=2, row=3, sticky=(W))

        Label(dlf, text='Nachname:').grid(column=1, row=4, sticky=(E))
        self.lastname_var = StringVar()
        lastname_entry = Entry(dlf, textvariable=self.lastname_var)
        lastname_entry.grid(column=2, row=4, sticky=(W))

        Label(dlf, text='Adresse:').grid(column=1, row=5, sticky=(E))
        self.address_var = StringVar()
        address_entry = Entry(dlf, textvariable=self.address_var)
        address_entry.grid(column=2, row=5, sticky=(W))

        Label(dlf, text='Aktiv').grid(column=1, row=6, sticky=(E))
        self.active_var = IntVar()
        active_check = Checkbutton(dlf, text='', variable=self.active_var)
        active_check.grid(column=2, row=6, sticky=(W))

        self.customerList.bind('<<ListboxSelect>>', self.showCustomerDetails)

    def showCustomerDetails(self, *args):
            self.id_var.set(self.mock_customers[self.customerList.curselection()[0]]['id'])
            self.title_var.set(self.mock_customers[self.customerList.curselection()[0]]['title'])
            self.firstname_var.set(self.mock_customers[self.customerList.curselection()[0]]['firstName'])
            self.lastname_var.set(self.mock_customers[self.customerList.curselection()[0]]['lastName'])
            self.address_var.set(self.mock_customers[self.customerList.curselection()[0]]['address'])
            self.active_var.set(self.mock_customers[self.customerList.curselection()[0]]['isActive'])


