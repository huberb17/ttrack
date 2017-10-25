import base64
import json
import string

from Crypto import Random
from Crypto.Cipher import AES

json_data = { 'attr1': True,
              'attr2': None,
              'attr3': {
                  'attr4': 'test',
                  'attr5': [1, 2, 3]
              }}

def encrypt_data(msg):
    #key = b'1234567890123456'
    key = '00112233445566778899aabbccddeeff'.decode('hex')
    print key
    enc_key = key.encode('hex')
    print enc_key
    #iv = Random.new().read(AES.block_size)
    iv = '00112233445566778899aabbccddeeff'.decode('hex')
    cipher = AES.new(key, AES.MODE_CFB, iv)
    ciphertext = iv + cipher.encrypt(msg.encode())
    print 'ciphertext ' + ciphertext.encode('hex')
    return ciphertext

def decrypt_data(ciphertext):
    iv = ciphertext[0:16]
    secret = ciphertext[16:]
    key = '00112233445566778899aabbccddeeff'.decode('hex')
    cipher = AES.new(key, AES.MODE_CFB, iv)
    data = cipher.decrypt(secret)
    print data

def decrypt_from_cryptojs():
    content = '31323334353637383930313233343536d7StSjcH34BSX2zhFkuI0wwQwsO+Vw24zwy5Y7dsAiO6xxB4xfo6ef+XcHXFauNW'
    iv = content[0:32].decode('hex')
    ciphertext = content[32:]
    key = '1234567890123456'
    cipher = AES.new(key, AES.MODE_CBC, iv)
    data = cipher.decrypt(base64.b64decode(ciphertext))
    myobj = json.loads(data)
    print myobj
    print myobj['name']

secret = encrypt_data("my test message")
decrypt_data(secret)
decrypt_from_cryptojs()