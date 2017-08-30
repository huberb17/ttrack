import sqlite3

def create_db():
    conn = sqlite3.connect('test.db3')
    c = conn.cursor()

    c.execute('''CREATE TABLE customers
                    (name text, adress_ref text)''')
    c.execute('''INSERT INTO customers VALUES ('mini', '@home')''')

    conn.commit()
    conn.close()

def read_db():
    conn = sqlite3.connect('test.db3')
    c = conn.cursor()
    c.execute('SELECT * FROM customers')
    print c.fetchone()

read_db()