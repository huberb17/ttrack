# coding=utf-8
import uuid
from Tkinter import *
from ttk import *

class AddressesFrame(Frame):
    def __init__(self, parent, controller, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.parent = parent
        self._controller = controller

        # flag for the UI state of this frame
        self.change_in_progress = False
        # members for holding the address data
        self.sorted_addresses = []
        self.address_display = ()
        # populate the members
        self.load_addresses()

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1, pad=5)
        self.columnconfigure(1, weight=1, pad=5)
        self.rowconfigure(0, weight=1,  pad=5)

        ##############################################################################################################
        # definition of frame for address list
        ##############################################################################################################
        lf = Labelframe(self, text='Adressen')
        lf.grid(column=0, row=0, sticky=(N))
        self.addressesVar = StringVar(value=self.address_display)
        self.addressList = Listbox(lf, listvariable=self.addressesVar, width=50)
        self.addressList.grid(column=0, row=0, columnspan=2)
        s = Scrollbar(lf, orient=VERTICAL, command=self.addressList.yview)
        s.grid(column=2, row=0, sticky=(N, S))
        self.addressList['yscrollcommand'] = s.set

        self.addressList.bind('<<ListboxSelect>>', self.show_address_details)

        self.new_button = Button(lf, text='Neu', command=self.new_address)
        self.new_button.grid(column=0, row=1)

        self.delete_button = Button(lf, text='Löschen', command=self.delete_address)
        self.delete_button.grid(column=1, row=1)
        self.delete_button.state(['disabled'])

        ##############################################################################################################
        # definition of frame for address details
        ##############################################################################################################
        dlf = LabelFrame(self, text='Adressdetails')
        dlf.grid(column=1, row=0, sticky=(N))

        Label(dlf, text='id:').grid(column=1, row=1, sticky=(E))
        self.id_var = StringVar()
        self.id_entry = Entry(dlf, textvariable=self.id_var)
        self.id_entry.state(['readonly'])
        self.id_entry.grid(column=2, row=1, sticky=(W))

        Label(dlf, text='Straße:').grid(column=1, row=2, sticky=(E))
        self.street_var = StringVar()
        self.street_entry = Entry(dlf, textvariable=self.street_var)
        self.street_entry.state(['readonly'])
        self.street_entry.grid(column=2, row=2, sticky=(W))

        Label(dlf, text='Hausnummer:').grid(column=1, row=3, sticky=(E))
        self.streetnumber_var = StringVar()
        self.streetnumber_entry = Entry(dlf, textvariable=self.streetnumber_var)
        self.streetnumber_entry.state(['readonly'])
        self.streetnumber_entry.grid(column=2, row=3, sticky=(W))

        Label(dlf, text='Türnummer:').grid(column=1, row=4, sticky=(E))
        self.doornumber_var = StringVar()
        self.doornumber_entry = Entry(dlf, textvariable=self.doornumber_var)
        self.doornumber_entry.state(['readonly'])
        self.doornumber_entry.grid(column=2, row=4, sticky=(W))

        Label(dlf, text='PLZ:').grid(column=1, row=5, sticky=(E))
        self.zipcode_var = StringVar()
        self.zipcode_entry = Entry(dlf, textvariable=self.zipcode_var)
        self.zipcode_entry.state(['readonly'])
        self.zipcode_entry.grid(column=2, row=5, sticky=(W))

        Label(dlf, text='Ort:').grid(column=1, row=6, sticky=(E))
        self.city_var = StringVar()
        self.city_entry = Entry(dlf, textvariable=self.city_var)
        self.city_entry.state(['readonly'])
        self.city_entry.grid(column=2, row=6, sticky=(W))

        Label(dlf, text='Notiz:').grid(column=1, row=7, sticky=(E))
        self.note_var = StringVar()
        self.note_entry = Entry(dlf, textvariable=self.note_var)
        self.note_entry.state(['readonly'])
        self.note_entry.grid(column=2, row=7, sticky=(W))

        Label(dlf, text='Aktiv').grid(column=1, row=8, sticky=(E))
        self.active_var = IntVar()
        self.active_check = Checkbutton(dlf, text='', variable=self.active_var)
        self.active_check.state(['disabled'])
        self.active_check.grid(column=2, row=8, sticky=(W))

        self.button_change = Button(dlf, text='Ändern', command=self.change_address)
        self.button_change.grid(column=1, row=9, sticky=(W))
        self.button_change.state(['disabled'])

        self.button_store = Button(dlf, text='Speichern', command=self.store_address)
        self.button_store.grid(column=2, row=9, sticky=(W))
        self.button_store.state(['disabled'])

        self.button_abort = Button(dlf, text='Abbrechen', command=self.abort)
        self.button_abort.grid(column=3, row=9, sticky=(W))
        self.button_abort.state(['disabled'])


    def show_address_details(self, *args):
        if len(self.addressList.curselection()) > 0 and not self.change_in_progress:
            self.delete_button.state(['!disabled'])
            self.button_change.state(['!disabled'])
            self.id_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['id'])
            self.street_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['street'])
            self.streetnumber_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['streetNumber'])
            self.doornumber_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['doorNumber'])
            self.zipcode_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['zipCode'])
            self.city_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['city'])
            self.note_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['note'])
            self.active_var.set(self.sorted_addresses[self.addressList.curselection()[0]]['isActive'])

    def change_address(self):
        self.set_change_in_progress()

    def store_address(self):
        address = {}
        address['id'] = self.id_var.get()
        address['street'] = self.street_var.get()
        address['streetNumber'] = self.streetnumber_var.get()
        address['doorNumber'] = self.doornumber_var.get()
        address['zipCode'] = self.zipcode_var.get()
        address['city'] = self.city_var.get()
        address['note'] = self.note_var.get()
        address['isActive'] = self.active_var.get()
        print address

        self.addressList.selection_clear(ACTIVE)
        self._controller.store_address(address)
        self.load_addresses()
        self.addressesVar.set(self.address_display)
        self.unset_change_in_progress()

    def abort(self):
        self.unset_change_in_progress()

    def set_change_in_progress(self):
        self.change_in_progress = True
        self.addressList.config(state=DISABLED)
        self.new_button.state(['disabled'])
        self.delete_button.state(['disabled'])
        self.button_change.state(['disabled'])
        self.button_store.state(['!disabled'])
        self.button_abort.state(['!disabled'])
        self.id_entry.state(['readonly'])
        self.street_entry.state(['!readonly'])
        self.streetnumber_entry.state(['!readonly'])
        self.doornumber_entry.state(['!readonly'])
        self.zipcode_entry.state(['!readonly'])
        self.city_entry.state(['!readonly'])
        self.note_entry.state(['!readonly'])
        self.active_check.state(['!disabled'])

    def unset_change_in_progress(self):
        self.change_in_progress = False
        self.addressList.config(state=NORMAL)
        self.new_button.state(['!disabled'])
        self.button_change.state(['!disabled'])
        self.button_store.state(['disabled'])
        self.button_abort.state(['disabled'])
        self.id_entry.state(['readonly'])
        self.street_entry.state(['readonly'])
        self.streetnumber_entry.state(['readonly'])
        self.doornumber_entry.state(['readonly'])
        self.zipcode_entry.state(['readonly'])
        self.city_entry.state(['readonly'])
        self.note_entry.state(['readonly'])
        self.active_check.state(['disabled'])

    def load_addresses(self):
        self.address_display, self.sorted_addresses = self._controller.get_addresses()

    def new_address(self):
        self.id_var.set(str(uuid.uuid4()))
        self.street_var.set("")
        self.streetnumber_var.set("")
        self.doornumber_var.set("")
        self.zipcode_var.set("")
        self.city_var.set("")
        self.note_var.set("")
        self.active_var.set(1)

        self.set_change_in_progress()

    def delete_address(self):
        self._controller.remove_address(self.id_var.get())
        self.load_addresses()
        self.addressList.selection_clear(ACTIVE)
        self.addressesVar.set(self.address_display)
