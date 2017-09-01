import logging
from Crypto import Random
from Crypto.Cipher import AES

logger = logging.getLogger(__name__)

class ActionDecryptor:

    @staticmethod
    def decrypt(filename):
        file_in = open(filename, "rb")
        iv, ciphertext = [file_in.read(x) for x in (16, -1)]
        file_in.close()
        # let's assume that the key is somehow available again
        key = b'1234567890123456'
        cipher = AES.new(key, AES.MODE_CFB, iv)
        data = cipher.decrypt(ciphertext)
        logger.info('decrypt file: {0}'.format(filename))
        return data

    @staticmethod
    def encrypt(msg, filename):
        key = b'1234567890123456'
        iv = Random.new().read(AES.block_size)
        cipher = AES.new(key, AES.MODE_CFB, iv)
        ciphertext = iv + cipher.encrypt(msg.encode())

        file_out = open(filename, "wb")
        file_out.write(ciphertext)
        file_out.close()
        logger.info('encrypt file: {0}'.format(filename))