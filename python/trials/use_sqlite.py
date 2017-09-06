import sqlite3

conn = sqlite3.connect('ttrack.db3')
c = conn.cursor()
c.execute('''SELECT date, start_km, start_addr.street as start_street, end_addr.street as end_street,
	route_km, comment, strftime('%m', date) as month, strftime('%Y', date) as year
FROM
driven_routes JOIN addresses as start_addr JOIN addresses as end_addr 
WHERE 
start_addr.id = driven_routes.start_address_id and end_addr.id = driven_routes.end_address_id and month = '09' and year = '2017' ''')

data = []
print 'from DB'
for row in c:
    print row
    data_row = ('generated',)
    index = 1
    for field in row:
        if index == 1:
            # convert date
            converted_field = sqlite3.datetime.datetime.strptime(field.strip(), "%Y-%m-%d")
            data_row = data_row + (converted_field,)
        elif index > 6:
            # skip those fields
            pass
        else:
            data_row = data_row + (field,)
        index += 1
    data.append(data_row)

print 'after processing'
for row in data:
    print row

