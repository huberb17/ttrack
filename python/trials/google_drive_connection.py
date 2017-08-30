from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

def connect_to_google_drive():
    gauth = GoogleAuth()
    #gauth.LocalWebserverAuth()

    drive = GoogleDrive(gauth)
    # print all files on the drive
    file_list = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()
    for file1 in file_list:
        print('title: %s, id: %s' % (file1['title'], file1['id']))
    # Create GoogleDriveFile instance with title 'Hello.txt'.
    file1 = drive.CreateFile({'title': 'Hello.txt'})
    file1.Upload()  # Upload the file.
    print('title: %s, id: %s' % (file1['title'], file1['id']))

connect_to_google_drive()
