# coding=utf-8
import uuid
from Tkinter import *
from ttk import *

class CustomersFrame(Frame):
    def __init__(self, parent, controller, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.parent = parent
        self._controller = controller

        # flag for the UI state of this frame
        self.change_in_progress = False
        # members for holding the customer data
        self.sorted_customers = []
        self.customer_display = ()
        # populate the members
        self.load_customers()

        #members for holding the address data
        self.sorted_addresses = []
        self.address_display = ()
        self.load_addresses()


        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1, pad=5)
        self.columnconfigure(1, weight=1, pad=5)
        self.rowconfigure(0, weight=1, pad=5)

        ##############################################################################################################
        # definition of frame for customer list
        ##############################################################################################################
        lf = Labelframe(self, text='Kunden')
        lf.grid(column=0, row=0, sticky=(N))
        self.customersVar = StringVar(value=self.customer_display)
        self.customerList = Listbox(lf, listvariable=self.customersVar, width=30)
        self.customerList.grid(column=0, row=0, columnspan=2)
        s = Scrollbar(lf, orient=VERTICAL, command=self.customerList.yview)
        s.grid(column=2, row=0, sticky=(N, S))
        self.customerList['yscrollcommand'] = s.set

        self.customerList.bind('<<ListboxSelect>>', self.showCustomerDetails)

        self.new_button = Button(lf, text='Neu', command=self.new_customer)
        self.new_button.grid(column=0, row=1)

        self.delete_button = Button(lf, text='Löschen', command=self.delete_customer)
        self.delete_button.grid(column=1, row=1)
        self.delete_button.state(['disabled'])

        ##############################################################################################################
        # definition of frame for customer details
        ##############################################################################################################
        dlf = LabelFrame(self, text='Kundendetails')
        dlf.grid(column=1, row=0, sticky=(N))

        Label(dlf, text='id:').grid(column=1, row=1, sticky=(E))
        self.id_var = StringVar()
        self.id_entry = Entry(dlf, textvariable=self.id_var)
        self.id_entry.state(['readonly'])
        self.id_entry.grid(column=2, row=1, sticky=(W))

        Label(dlf, text='Anrede:').grid(column=1, row=2, sticky=(E))
        self.title_var = StringVar()
        self.title_entry = Entry(dlf, textvariable=self.title_var)
        self.title_entry.state(['readonly'])
        self.title_entry.grid(column=2, row=2, sticky=(W))

        Label(dlf, text='Vorname:').grid(column=1, row=3, sticky=(E))
        self.firstname_var = StringVar()
        self.firstname_entry = Entry(dlf, textvariable=self.firstname_var)
        self.firstname_entry.state(['readonly'])
        self.firstname_entry.grid(column=2, row=3, sticky=(W))

        Label(dlf, text='Nachname:').grid(column=1, row=4, sticky=(E))
        self.lastname_var = StringVar()
        self.lastname_entry = Entry(dlf, textvariable=self.lastname_var)
        self.lastname_entry.state(['readonly'])
        self.lastname_entry.grid(column=2, row=4, sticky=(W))

        Label(dlf, text='Adresse:').grid(column=1, row=5, sticky=(E))
        self.address_var = StringVar()
        self.address_combo = Combobox(dlf, textvariable=self.address_var, width=40)
        self.address_combo.state(['readonly'])
        self.address_combo.state(['disabled'])
        self.address_combo['values'] = self.address_display
        self.address_combo.grid(column=2, row=5, sticky=(W))
        self.address_combo.bind('<<ComboboxSelected>>', self.address_combo.selection_clear())

        Label(dlf, text='Aktiv').grid(column=1, row=6, sticky=(E))
        self.active_var = IntVar()
        self.active_check = Checkbutton(dlf, text='', variable=self.active_var)
        self.active_check.state(['disabled'])
        self.active_check.grid(column=2, row=6, sticky=(W))

        self.button_change = Button(dlf, text='Ändern', command=self.change_customer)
        self.button_change.grid(column=1, row=7, sticky=(W))
        self.button_change.state(['disabled'])

        self.button_store = Button(dlf, text='Speichern', command=self.store_customer)
        self.button_store.grid(column=2, row=7, sticky=(W))
        self.button_store.state(['disabled'])

        self.button_abort = Button(dlf, text='Abbrechen', command=self.abort)
        self.button_abort.grid(column=3, row=7, sticky=(W))
        self.button_abort.state(['disabled'])

    def showCustomerDetails(self, *args):
        if len(self.customerList.curselection()) > 0 and not self.change_in_progress:
            self.delete_button.state(['!disabled'])
            self.button_change.state(['!disabled'])
            self.id_var.set(self.sorted_customers[self.customerList.curselection()[0]]['id'])
            self.title_var.set(self.sorted_customers[self.customerList.curselection()[0]]['title'])
            self.firstname_var.set(self.sorted_customers[self.customerList.curselection()[0]]['firstName'])
            self.lastname_var.set(self.sorted_customers[self.customerList.curselection()[0]]['lastName'])
            self.address_var.set(self.address_lookup(self.sorted_customers[self.customerList.curselection()[0]]['address']))
            self.active_var.set(self.sorted_customers[self.customerList.curselection()[0]]['isActive'])

    def address_lookup(self, addr_id):
        idx = 0
        for addr in self.sorted_addresses:
            if addr['id'] == addr_id:
                return self.address_display[idx]
            idx += 1
        return 'None'

    def addr_id_lookup(self, addr_display_string):
        idx = 0
        for addr in self.address_display:
            if addr == addr_display_string:
                return self.sorted_addresses[idx]['id']
            idx += 1
        return 'None'

    def change_customer(self):
        self.set_change_in_progress()

    def store_customer(self):
        customer = {}
        customer['id'] = self.id_var.get()
        customer['title'] = self.title_var.get()
        customer['firstName'] = self.firstname_var.get()
        customer['lastName'] = self.lastname_var.get()
        customer['address'] = self.addr_id_lookup(self.address_var.get())
        customer['isActive'] = self.active_var.get()
        print customer

        self.customerList.selection_clear(ACTIVE)
        self._controller.store_customer(customer)
        self.load_customers()
        self.customersVar.set(self.customer_display)
        self.unset_change_in_progress()

    def abort(self):
        self.unset_change_in_progress()

    def set_change_in_progress(self):
        self.change_in_progress = True
        self.customerList.config(state=DISABLED)
        self.new_button.state(['disabled'])
        self.delete_button.state(['disabled'])
        self.button_change.state(['disabled'])
        self.button_store.state(['!disabled'])
        self.button_abort.state(['!disabled'])
        self.id_entry.state(['readonly'])
        self.title_entry.state(['!readonly'])
        self.firstname_entry.state(['!readonly'])
        self.lastname_entry.state(['!readonly'])
        self.address_combo.state(['!disabled'])
        self.active_check.state(['!disabled'])

    def unset_change_in_progress(self):
        self.change_in_progress = False
        self.customerList.config(state=NORMAL)
        self.new_button.state(['!disabled'])
        self.button_change.state(['!disabled'])
        self.button_store.state(['disabled'])
        self.button_abort.state(['disabled'])
        self.id_entry.state(['readonly'])
        self.title_entry.state(['readonly'])
        self.firstname_entry.state(['readonly'])
        self.lastname_entry.state(['readonly'])
        self.address_combo.state(['disabled'])
        self.active_check.state(['disabled'])

    def load_customers(self):
        self.customer_display, self.sorted_customers = self._controller.get_customers()

    def load_addresses(self):
        self.address_display, self.sorted_addresses = self._controller.get_addresses()

    def new_customer(self):
        self.id_var.set(str(uuid.uuid4()))
        self.title_var.set("")
        self.firstname_var.set("")
        self.lastname_var.set("")
        self.address_var.set("")
        self.active_var.set(1)

        self.set_change_in_progress()

    def delete_customer(self):
        self._controller.remove_customer(self.id_var.get())
        self.load_customers()
        self.customerList.selection_clear(ACTIVE)
        self.customersVar.set(self.customer_display)

