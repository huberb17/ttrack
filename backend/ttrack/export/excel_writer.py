# -*- coding: utf-8 -*-

import logging
import os

import shutil

import datetime

from openpyxl import load_workbook
from openpyxl.worksheet import Worksheet

from backend.ttrack.utils.errors import ExcelWriterError

logger = logging.getLogger(__name__)

class ExcelWriter:
    def __init__(self, config):
        self._milage_filename = config.export_milage
        self._income_filename = config.export_income
        self._export_path = config.export_path

    def backup_and_create(self, data_store):
        try:
            self._backup_files()
            self._create_export(data_store)
        except IOError as io_err:
            logger.info('IO error received: {0}'.format(io_err.strerror))
            msg = 'Error during IO operation: {0}'.format(io_err.strerror)
            raise ExcelWriterError(msg)
        except ExcelWriterError:
            raise ExcelWriterError
        except Exception as err:
            logger.info('unexpected error received: {0}'.format(err.message))
            msg = 'Reveived unexpected error: {0}'.format(err.message)
            raise ExcelWriterError(msg)

    def _backup_files(self):
        try:
            backup_prefix = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_")
            if not os.path.exists(self._export_path):
                os.makedirs(self._export_path)
            if os.path.exists(self._milage_filename):
                backup_name = os.path.join(self._export_path, backup_prefix + os.path.basename(self._milage_filename))
                shutil.copy(self._milage_filename, backup_name)
            if os.path.exists(self._income_filename):
                backup_name = os.path.join(self._export_path, backup_prefix + os.path.basename(self._income_filename))
                shutil.copy(self._income_filename, backup_name)
        except (OSError, IOError) as err:
            logger.info('os error received: {0}, {1}'.format(err.strerror, err.filename))
            msg = 'Unable to backup file: {0}, {1}'.format(err.strerror, err.filename)
            raise ExcelWriterError(msg)

    def _create_export(self, data_store):
            self._create_milage_export(data_store)
            # self._create_income_export(data_store)

    def _create_milage_export(self, data_store):
        try:
            wb = load_workbook(self._milage_filename)
            #wb = self._initialize_milage_workbook(wb)
            wb = self._generate_milage_rows(wb, data_store)
            wb.save(self._milage_filename)
        except Exception as err:
            raise ExcelWriterError(err.message)

    def _create_income_export(self, data_store):
        try:
            wb = load_workbook(self._income_filename)
            wb = self._initialize_income_workbook(wb)
            wb = self._generate_income_rows(wb, data_store)
            wb.save(self._income_filename)
        except Exception as err:
            raise ExcelWriterError(err.message)

    def _initialize_milage_workbook(self, wb):
        template_ws = wb.get_sheet_by_name('Vorlage')
        # check if for every month a sheet is avaiable
        for month_num, month_name in [(1, u'Jänner'), (2, u'Februar'), (3, u'März'), (4, u'April'), (5, u'Mai'),
                                    (6, u'Juni'), (7, u'Juli'), (8, u'August'), (9, u'September'),
                                    (10, u'Oktober'), (11, u'November'), (12, u'Dezember')]:
            # if sheet is not found, just copy the template and set the date
            if not month_name in wb.sheetnames:
                template_sheet = wb.copy_worksheet(template_ws)
                self._create_milage_header(month_name, template_sheet)
                template_sheet.title = month_name
            else:
                # copy all manually entered values and remove the rest
                old_sheet = wb.get_sheet_by_name(month_name)
                max_row = old_sheet.max_row
                max_col = old_sheet.max_column

                new_sheet = wb.copy_worksheet(template_ws)
                self._create_milage_header(month_name, new_sheet)

                old_start_row = self._find_start_marker(max_row, old_sheet)
                new_start_row = self._find_start_marker(max_row, new_sheet)

                next_row = new_start_row + 1
                for row_num in range(old_start_row+1, max_row):
                    cell_name = 'A{0}'.format(row_num)
                    if old_sheet[cell_name].value == 'generated':
                        # skip this row
                        pass
                    else:
                        # copy this row
                        for col_num in range(1, max_col+1):
                            new_sheet.cell(row=next_row, column=col_num).value = old_sheet.cell(row=row_num,
                                                                                                column=col_num).value
                        next_row = next_row + 1
                # rename the sheet
                wb.remove(old_sheet)
                new_sheet.title = month_name

        return wb

    def _find_start_marker(self, max_row, sheet):
        start_row = 0
        for row_num in range(1, max_row):
            cell_name = 'A{0}'.format(row_num)
            if sheet[cell_name].value == 'start_generated':
                start_row = row_num
                break
        if start_row == 0:
            logger.info('start_generated marker not found')
            msg = 'Invalid worksheet: no start_generated marker found'
            raise ExcelWriterError(msg)
        return start_row

    def _create_milage_header(self, month_name, sheet):
        sheet['E2'].value = month_name + ' ' + '2017'

    def _generate_milage_rows(self, wb, data_store):

        template_ws = wb.get_sheet_by_name('Vorlage')
        # check if for every month a sheet is avaiable
        for month_num, month_name in [(1, u'Jänner'), (2, u'Februar'), (3, u'März'), (4, u'April'), (5, u'Mai'),
                                      (6, u'Juni'), (7, u'Juli'), (8, u'August'), (9, u'September'),
                                      (10, u'Oktober'), (11, u'November'), (12, u'Dezember')]:

            # TODO replace mock by real data
            data = [('generated', datetime.datetime(2017, 1, 1), 123, 'Start1', 'Ziel1', 15.2, 'Comment1'),
                    ('generated', datetime.datetime(2017, 1, 5), 223, 'Start2', 'Ziel2', 25.2, 'Comment2'),
                    ('generated', datetime.datetime(2017, 1, 8), 823, 'Start3', 'Ziel3', 35.2, 'Comment3'),
                    ]

            # if sheet is not found, just copy the template and set the date
            if not month_name in wb.sheetnames:
                template_sheet = wb.copy_worksheet(template_ws)
                self._create_milage_header(month_name, template_sheet)
                template_sheet.title = month_name

            # copy all manually entered values and remove the rest
            old_sheet = wb.get_sheet_by_name(month_name)
            max_row = old_sheet.max_row
            max_col = old_sheet.max_column

            new_sheet = wb.copy_worksheet(template_ws)
            self._create_milage_header(month_name, new_sheet)

            old_start_row = self._find_start_marker(max_row, old_sheet)
            for row_num in range(old_start_row + 1, max_row+1):
                cell_name = 'A{0}'.format(row_num)
                if old_sheet[cell_name].value == 'generated':
                    # skip this row
                    pass
                else:
                    # save the values
                    manual_value = ()
                    for col_num in range(1, max_col + 1):
                        manual_value = manual_value + (old_sheet.cell(row=row_num, column=col_num).value,)
                    if not manual_value[1] is None:
                        data.append(manual_value)

            data = sorted(data, key=lambda value: value[1])

            new_start_row = self._find_start_marker(max_row, new_sheet)
            next_row = new_start_row + 1
            for row_num in range(0, len(data)):
                # copy this row
                for col_num in range(1, max_col + 1):
                    new_sheet.cell(row=next_row, column=col_num).value = data[row_num][col_num-1]
                next_row = next_row + 1
            # rename the sheet
            wb.remove(old_sheet)
            new_sheet.title = month_name

        return wb

    def _generate_income_rows(self, wb, data_store):
        # get list of income and expense entries for the current year, sorted by date
        # loop over all sheets and then for each sheet
        # look at B of start_row, if there is a date -> this is manually entered data
        # compare the date with the first date of the list and add it on the appropriate place
        return wb

    def _initialize_income_workbook(self, wb):
        pass
