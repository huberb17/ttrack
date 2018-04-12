# coding=utf-8
from Tkinter import *
from ttk import *

import operator


class WorkdaysFrame(Frame):
    def __init__(self, parent, controller, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.root = self._root()
        self.parent = parent
        self._controller = controller

        self.sorted_workdays = [ ]
        self.workday_dates = ( )
        self.sorted_db_workdays = [ ]
        self.workday_db_dates = ( )

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1, pad=5)
        self.columnconfigure(1, weight=1, pad=5)
        self.rowconfigure(0, weight=1, pad=5)
        self.rowconfigure(1, weight=1, pad=5)

        lf = Labelframe(self, text='Arbeitsage')
        lf.grid(column=0, row=0, sticky=(N))

        ##############################################################################################################
        # definition of frame for workday list
        ##############################################################################################################
        self.workday_load_button_cloud = Button(lf, text='von Cloud laden',
                                                command=self.load_workdays_cloud)
        self.workday_load_button_cloud.grid(column=0, row=0)

        self.workday_show_button_db = Button(lf, text='aus DB anzeigen', command=self.show_workdays_db)
        self.workday_show_button_db.grid(column=2, row=0)

        self.workdayVar = StringVar(value=self.workday_dates)
        self.workday_list = Listbox(lf, listvariable=self.workdayVar, width=15)
        self.workday_list.grid(column=0, row=1, sticky=(W))
        s = Scrollbar(lf, orient=VERTICAL, command=self.workday_list.yview)
        s.grid(column=1, row=1, sticky=(N, S))
        self.workday_list['yscrollcommand'] = s.set

        self.workday_list.bind('<<ListboxSelect>>', self.show_workday_details)

        self.workdayDbVar = StringVar(value=self.workday_db_dates)
        self.workday_db_list = Listbox(lf, listvariable=self.workdayDbVar, width=15)
        self.workday_db_list.grid(column=2, row=1, sticky=(W))
        s2 = Scrollbar(lf, orient=VERTICAL, command=self.workday_db_list.yview)
        s2.grid(column=3, row=1, sticky=(N, S))
        self.workday_db_list['yscrollcommand'] = s2.set

        self.workday_db_list.bind('<<ListboxSelect>>', self.show_workday_db_details)

        ##############################################################################################################
        # definition of frame for workday detail
        ##############################################################################################################
        dlf = LabelFrame(self, text='Arbeitstagdetails')
        dlf.grid(column=1, row=0, sticky=(N))

        Label(dlf, text='Datum:').grid(column=0, row=0, sticky=(W))
        self.workdayDateVar = StringVar()
        self.date_entry = Entry(dlf, textvariable=self.workdayDateVar, width=12)
        self.date_entry.state(['readonly'])
        self.date_entry.grid(column=1, row=0, sticky=(W))

        Label(dlf, text='km-Stand:').grid(column=0, row=1, sticky=(W))
        self.workdayMilageVar = IntVar()
        self.milage_entry = Entry(dlf, textvariable=self.workdayMilageVar, width=12)
        self.milage_entry.state(['readonly'])
        self.milage_entry.grid(column=1, row=1, sticky=(W))

        self.workdayDetailVar = StringVar()
        self.workday_detail_list = Listbox(dlf, listvariable=self.workdayDetailVar, width=25)
        self.workday_detail_list.grid(column=0, row=2, columnspan=2, sticky=(W))

        self.workday_store_button = Button(dlf, text='Arbeitstag übernehmen', command=self.store_workday)
        self.workday_store_button.grid(column=0, row=3, columnspan=2, sticky=(W))
        self.workday_store_button.state(['disabled'])

    def load_workdays_cloud(self):
        self.root.config(cursor="wait")
        self.root.update_idletasks()
        self.root.after(500, self.do_load_cloud)

    def do_load_cloud(self):
        self.workday_store_button.state(['disabled'])
        self._controller.load_workdays_cloud()
        self.workday_dates = ()
        self.sorted_workdays = sorted(self._controller.workday_list.items(), key=lambda x: x[1]['therapyDate'])
        for item in self.sorted_workdays:
            self.workday_dates += ( item[1]['therapyDate'][:10], )
        self.workdayVar.set(self.workday_dates)
        self.workday_load_button_cloud.state(['disabled'])
        self.root.config(cursor="")

    def show_workdays_db(self):
        self.root.config(cursor="wait")
        self.root.update_idletasks()
        self.root.after(500, self.do_load_db)

    def do_load_db(self):
        self.workday_store_button.state(['disabled'])
        self._controller.show_workdays_db()
        self.workday_db_dates = ()
        self.sorted_db_workdays = sorted(self._controller.workday_list_db.items(), key=lambda x: x[1]['therapyDate'])
        for item in self.sorted_db_workdays:
            self.workday_db_dates += (item[1]['therapyDate'][:10],)
        self.workdayDbVar.set(self.workday_db_dates)
        self.root.config(cursor="")

    def show_workday_details(self, *args):
        self.clear_workday_details()
        self.workday_db_list.select_clear(0, END)
        if (self.workday_list.curselection()):
            workday = self.sorted_workdays[self.workday_list.curselection()[0]]
            self.display_workday_details(workday)
            self.workday_store_button.state(['!disabled'])

    def show_workday_db_details(self, *args):
        self.clear_workday_details()
        self.workday_list.select_clear(0, END)
        if (self.workday_db_list.curselection()):
            self.workday_store_button.state(['disabled'])
            workday = self.sorted_db_workdays[self.workday_db_list.curselection()[0]]
            self.display_workday_details(workday)

    def display_workday_details(self, workday):
        customers = ()
        self.workdayDateVar.set(workday[1]['therapyDate'][:10])
        self.workdayMilageVar.set(workday[1]['milage'])
        for customer in workday[1]['customersOfDay']:
            if 'firstName' in customer:
                customers += (customer['firstName'] + " " + customer['lastName'],)
            else:
                customers += (customer['lastName'],)
        self.workdayDetailVar.set(customers)

    def store_workday(self):
        workday = self.sorted_workdays[self.workday_list.curselection()[0]][1]
        self._controller.store_workday(workday)

    def clear_workday_details(self):
        self.workdayDateVar.set('')
        self.workdayMilageVar.set('')
        self.workdayDetailVar.set( () )

