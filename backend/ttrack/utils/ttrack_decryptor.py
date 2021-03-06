import base64
import logging
from Crypto import Random
from Crypto.Cipher import AES

logger = logging.getLogger(__name__)

class TTrackDecryptor:

    @staticmethod
    def decrypt(filename):
        logger.info('decrypt file: {0}'.format(filename))
        file_in = open(filename, "rb")
        iv, ciphertext = [file_in.read(x) for x in (32, -1)]
        file_in.close()
        iv = iv.decode('hex')
        # let's assume that the key is somehow available again
        key = '1234567890123456'
        cipher = AES.new(key, AES.MODE_CBC, iv)
        data = cipher.decrypt(base64.b64decode(ciphertext))
        # remove trailing invalid data
        last_curled = str(data).rfind('}')
        last_square = str(data).rfind(']')
        last_index = -1
        if last_curled >= last_square:
            last_index = last_curled + 1
        else:
            last_index = last_square + 1
        data = data[:last_index]
        return data

    @staticmethod
    def encrypt(msg):
        key = '1234567890123456'
        iv = '1234567890123456'
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padding = 16 - (len(msg) % 16)
        msg += '{' * padding + '{' * 256 # add some additional padding to get correct encryption on the other side
        ciphertext = iv.encode('hex') + base64.b64encode(cipher.encrypt(msg))

        return ciphertext