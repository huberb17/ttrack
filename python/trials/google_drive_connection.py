from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

def connect_to_google_drive():
    gauth = GoogleAuth()
    gauth.LocalWebserverAuth()

    drive = GoogleDrive(gauth)

connect_to_google_drive()
