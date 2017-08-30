from openpyxl import load_workbook

wb = load_workbook('test.xlsx')
print wb.get_sheet_names()
ws = wb.get_sheet_by_name('Blatt1')
ws['B1'] = 'This is another test string'
wb.save('test.xlsx')