from backend.ttrack.utils.ttrack_decryptor import TTrackDecryptor
import unittest
import os

class TTrackDecryptorTest(unittest.TestCase):

    def testFake(self):
        pass

    def testEncryptionDecryptionChain(self):
        message = '{My dummy string}'
        encrypted = TTrackDecryptor.encrypt(message.encode('utf-8'))
        with open('tmpfile', 'wb') as f:
            f.write(encrypted)
        decrypted = TTrackDecryptor.decrypt('tmpfile').decode('utf-8')
        self.assertEqual(message, decrypted)
        os.remove('tmpfile')
    

if __name__ == "__main__":
    unittest.main()