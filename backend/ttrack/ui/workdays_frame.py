# coding=utf-8
from Tkinter import *
from ttk import *

import operator


class WorkdaysFrame(Frame):
    def __init__(self, parent, controller, *args, **kwargs):
        Frame.__init__(self, parent, *args, **kwargs)
        self.parent = parent
        self._controller = controller

        self.sorted_workdays = [ ]
        self.workday_dates = ( )

        self.grid(column=0, row=0, sticky=(N, W, E, S))
        self.columnconfigure(0, weight=1, pad=5)
        self.columnconfigure(1, weight=1, pad=5)
        self.rowconfigure(0, weight=1, pad=5)
        self.rowconfigure(1, weight=1, pad=5)

        lf = Labelframe(self, text='Arbeitsage')
        lf.grid(column=0, row=0)

        self.workday_load_button = Button(lf, text='Arbeitstage laden', command=self.load_workdays)
        self.workday_load_button.grid(column=0, row=0)

        self.workdayVar = StringVar(value=self.workday_dates)
        self.workday_list = Listbox(lf, listvariable=self.workdayVar)
        self.workday_list.grid(column=0, row=1)

        dlf = LabelFrame(self, text='Arbeitstagdetails')
        dlf.grid(column=1, row=0, sticky=(N))

        Label(dlf, text='Datum:').grid(column=0, row=0, sticky=(E))
        self.workdayDateVar = StringVar()
        date_entry = Entry(dlf, textvariable=self.workdayDateVar)
        date_entry.grid(column=1, row=0, sticky=(W))

        Label(dlf, text='km-Stand:').grid(column=0, row=1, sticky=(E))
        self.workdayMilageVar = IntVar()
        milage_entry = Entry(dlf, textvariable=self.workdayMilageVar)
        milage_entry.grid(column=1, row=1, sticky=(W))

        self.workdayDetailVar = StringVar()
        self.workday_detail_list = Listbox(dlf, listvariable=self.workdayDetailVar)
        self.workday_detail_list.grid(column=0, row=2, columnspan=2)

        self.workday_store_button = Button(dlf, text='Arbeitstag speichern', command=self.store_workday)
        self.workday_store_button.grid(column=0, row=3)

        self.workday_list.bind('<<ListboxSelect>>', self.show_workday_details)

    def load_workdays(self):
        self._controller.load_workdays()
        self.workday_dates = ()
        self.sorted_workdays = sorted(self._controller.workday_list.items(), key=lambda x: x[1]['therapyDate'])
        for item in self.sorted_workdays:
            self.workday_dates += ( item[1]['therapyDate'], )
        self.workdayVar.set(self.workday_dates)

    def show_workday_details(self, *args):
        customers = ()
        workday = self.sorted_workdays[self.workday_list.curselection()[0]]
        self.workdayDateVar.set(workday[1]['therapyDate'])
        self.workdayMilageVar.set(workday[1]['milage'])
        for customer in workday[1]['customersOfDay']:
            customers += ( customer['firstName'] + " " + customer['lastName'], )
        self.workdayDetailVar.set(customers)

    def store_workday(self):
        workday = self.sorted_workdays[self.workday_list.curselection()[0]][1]
        self._controller.store_workday(workday)