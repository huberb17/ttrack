# -*- coding: utf-8 -*-
"""Export the data of the data store into Excel reports while preserving manually entered data"""
import logging
import os

import shutil

import datetime

from openpyxl import load_workbook
from openpyxl.styles import Border, Side
from backend.ttrack.utils.errors import ExcelWriterError

logger = logging.getLogger(__name__)

class ExcelWriter:
    """Handle the data export to MS Excel."""
    def __init__(self, config):
        """The initializer of the class.
        
        :type config: backend.ttrack.utils.config_reader.ConfigReader
        :param config: the current configuration of ttrack 
        """
        self._milage_filename = config.export_milage
        self._income_filename = config.export_income
        self._export_path = config.export_path

    def backup_and_create(self, data_store):
        """Create a backup of the current reports and re-export the data.
        
        :type data_store: backend.ttrack.persistence.data_store.DataStore
        :param data_store: the current data to export
        :return: None
        """
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
        """Create a backup of the current reports."""
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
        """Export the current data of data_store into MS Excel reports.

               :type data_store: backend.ttrack.persistence.data_store.DataStore
               :param data_store: the data to be exported
               :return: None
       """
        self._create_milage_export(data_store)
        # TODO: add income_export
        # self._create_income_export(data_store)

    def _create_milage_export(self, data_store):
        """Create the milage report as MS Excel file.
        
        :type data_store: backend.ttrack.persistence.data_store.DataStore
        :param data_store: the data to be exported
        :return: None
        """
        try:
            wb = load_workbook(self._milage_filename)
            wb = self._generate_milage_rows(wb, data_store)
            wb.save(self._milage_filename)
        except Exception as err:
            raise ExcelWriterError(err.message)

    def _create_income_export(self, data_store):
        """Create the income/expense report as MS Excel file.
        
        :type data_store: backend.ttrack.persistence.data_store.DataStore
        :param data_store: the data to be exported
        :return: None
        """
        try:
            wb = load_workbook(self._income_filename)
            wb = self._generate_income_rows(wb, data_store)
            wb.save(self._income_filename)
        except Exception as err:
            raise ExcelWriterError(err.message)

    def _find_start_marker(self, max_row, sheet):
        """Find the row with the 'start_generated' marker. 
        
        :type max_row: int
        :param max_row: the maximum row number in the worksheet
        :type sheet: openpyxl.worksheet.worksheet.Worksheet
        :param sheet: the worksheet to be processed
        :return: number of row with start marker
        """
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

            data = data_store.get_milage_data(month_num, '2017')

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
                    if col_num == 2:
                        new_sheet.cell(row=next_row, column=col_num).number_format = 'dd.mm.yy'
                    if col_num != 1:
                        new_sheet.cell(row=next_row, column=col_num).border = Border(left=Side(border_style='thin',
                                                                                           color='FF000000'),
                                                                                 right=Side(border_style='thin',
                                                                                            color='FF000000'),
                                                                                 top=Side(border_style='thin',
                                                                                          color='FF000000'),
                                                                                 bottom=Side(border_style='thin',
                                                                                             color='FF000000'))
                next_row = next_row + 1
            # correct the sum forumlar
            new_sheet["E3"] = "=SUM(F{0}:F{1})".format(new_start_row + 1, new_sheet.max_row)
            # rename the sheet
            wb.remove(old_sheet)
            new_sheet.title = month_name
            new_sheet.column_dimensions['A'].hidden = True

        return wb

    def _generate_income_rows(self, wb, data_store):
        # get list of income and expense entries for the current year, sorted by date
        # loop over all sheets and then for each sheet
        # look at B of start_row, if there is a date -> this is manually entered data
        # compare the date with the first date of the list and add it on the appropriate place
        return wb
