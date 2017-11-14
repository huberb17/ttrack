from Tkinter import *
from ttk import *

from backend.ttrack.ui.addresses_frame import AddressesFrame
from backend.ttrack.ui.customers_frame import CustomersFrame
from backend.ttrack.ui.workdays_frame import WorkdaysFrame

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
        menu_gdrive.add_command(label='Adressen von Cloud laden', command=self.cloud_load_addresses)
        menu_gdrive.add_command(label='Adressen in Cloud hochladen', command=self.cloud_upload_addresses)
        menubar.add_cascade(menu=menu_file, label='Datei')
        menubar.add_cascade(menu=menu_gdrive, label='Google Drive')
        self.parent['menu'] = menubar

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        self.notebook = Notebook(self.parent)
        self.notebook.grid(column=0, row=0, sticky=(N, W, E, S))
        self.notebook.columnconfigure(0, weight=1)
        self.notebook.rowconfigure(0, weight=1)

        self.workdays_frame = WorkdaysFrame(self.notebook, self._controller, padding="5 5 5 5")
        self.customers_frame = CustomersFrame(self.notebook, padding="5 5 5 5")
        self.addresses_frame = AddressesFrame(self.notebook, self._controller, padding="5 5 5 5")

        self.notebook.add(self.workdays_frame, text='Arbeitstage')
        self.notebook.add(self.customers_frame, text='Kundendaten')
        self.notebook.add(self.addresses_frame, text='Adressdaten')
        self.notebook.pack()

    def exit_app(self):
        print 'exit clicked'
        self.parent.quit()

    def cloud_load_addresses(self):
        print 'clicked download'

    def cloud_upload_addresses(self):
        self._controller.upload_current_addresses()


