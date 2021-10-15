# coding=utf-8
import tkinter.messagebox as TkMessageBox
from tkinter import *
from tkinter.ttk import *

from ui.addresses_frame import AddressesFrame
from ui.customers_frame import CustomersFrame
from ui.workdays_frame import WorkdaysFrame

class MainApplication(Frame):
    def __init__(self, parent, controller, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.parent = parent

        # store the helper classes
        self._controller = controller

        # add menubar at top level (= parent) window
        self.parent.option_add('*tearOff', FALSE)
        menubar = Menu(self.parent)
        menu_file = Menu(menubar)
        menu_file.add_command(label='Beenden', command=self.exit_app)
        menu_gdrive = Menu(menubar)
        menu_gdrive.add_command(label='Adressen von Cloud laden', command=self.cloud_download_addresses)
        menu_gdrive.add_command(label='Kunden von Cloud laden', command=self.cloud_download_customers)
        menu_gdrive.add_separator()
        menu_gdrive.add_command(label='Adressen in Cloud hochladen', command=self.cloud_upload_addresses)
        menu_gdrive.add_command(label='Kunden in Cloud hochladen', command=self.cloud_upload_customers)
        menu_report = Menu(menubar)
        menu_report.add_command(label='Fahrtenbuch erstellen', command=self.create_milage_report)
        menu_report.add_command(label='Einnahmen-/Ausgabenbericht erstellen', command=self.create_income_report)
        menubar.add_cascade(menu=menu_file, label='Datei')
        menubar.add_cascade(menu=menu_gdrive, label='Google Drive')
        menubar.add_cascade(menu=menu_report, label='Berichte')
        self.parent['menu'] = menubar

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        self.notebook = Notebook(self.parent)
        self.notebook.grid(column=0, row=0, sticky=(N, W, E, S))
        self.notebook.columnconfigure(0, weight=1)
        self.notebook.rowconfigure(0, weight=1)

        self.workdays_frame = WorkdaysFrame(self.notebook, self._controller, padding="5 5 5 5")
        self.customers_frame = CustomersFrame(self.notebook, self._controller, padding="5 5 5 5")
        self.addresses_frame = AddressesFrame(self.notebook, self._controller, padding="5 5 5 5")

        self.notebook.add(self.workdays_frame, text='Arbeitstage')
        self.notebook.add(self.customers_frame, text='Kundendaten')
        self.notebook.add(self.addresses_frame, text='Adressdaten')
        self.notebook.pack()

    def exit_app(self):
        self.parent.quit()

    def cloud_download_addresses(self):
        self._controller.download_latest_addresses()

    def cloud_upload_addresses(self):
        self._controller.upload_current_addresses()

    def cloud_download_customers(self):
        self._controller.download_latest_customers()

    def cloud_upload_customers(self):
        self._controller.upload_current_customers()

    def create_milage_report(self):
        self.parent.config(cursor="wait")
        self.parent.update_idletasks()
        self.parent.after(500, self.do_create_milage_report)

    def do_create_milage_report(self):
        success = self._controller.create_milage_report()
        if success:
            tkMessageBox.showinfo('Fahrtenbuch erzeugt', 'Das Fahrtenbuch wurde erfolgreich angelegt.')
        else:
            tkMessageBox.showinfo('Fahrtenbuch Fehler', 'Das Fahrtenbuch konnte nicht erfolgreich angelegt werden. Siehe Log-Files für mehr Information')
        self.parent.config(cursor="")

    def create_income_report(self):
        self.parent.config(cursor="wait")
        self.parent.update_idletasks()
        self.parent.after(500, self.do_create_income_report)

    def do_create_income_report(self):
        success = self._controller.create_income_report()
        if success:
            tkMessageBox.showinfo('Einnahmen/Ausgaben erzeugt', 'Der Einnahmen-/Ausgabenbericht wurde erfolgreich angelegt.')
        else:
            tkMessageBox.showinfo('Einnahmen/Ausgaben Fehler',
                                  'Der Einnahmen-/Ausgabenbericht konnte nicht erfolgreich angelegt werden. Siehe Log-Files für mehr Information')
        self.parent.config(cursor="")