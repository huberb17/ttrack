from ftplib import FTP

ftp = FTP('192.168.0.47', 'ttrack', open('pass.txt', 'r').readline())
ftp.cwd('ttrack')
l = ftp.nlst()
print(l)
ftp.quit()
