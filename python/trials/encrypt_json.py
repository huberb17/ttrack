import json

from Crypto.Cipher import AES

json_data = { 'attr1': True,
              'attr2': None,
              'attr3': {
                  'attr4': 'test',
                  'attr5': [1, 2, 3]
              }}

def encrypt_data(msg):
    key = b'1234567890123456'
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(msg.encode())

    file_out = open("encrypted.bin", "wb")
    [ file_out.write(x) for x in (cipher.nonce, tag, ciphertext) ]

def decrypt_data():
    file_in = open("encrypted.bin", "rb")
    nonce, tag, ciphertext = [file_in.read(x) for x in (16, 16, -1)]

    # let's assume that the key is somehow available again
    key = b'1234567890123456'
    cipher = AES.new(key, AES.MODE_EAX, nonce)
    data = cipher.decrypt_and_verify(ciphertext, tag)
    json_object = json.loads(data)
    print(json_object)

encrypt_data(json.dumps(json_data))
decrypt_data()