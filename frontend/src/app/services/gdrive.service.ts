import { Injectable } from '@angular/core';

declare var gapi;

class GdriveWrapper {
    // Client ID and API key from the Developer Console
    public CLIENT_ID = '452487708050-b3fl6dukhcr59ta22ku9el2mo5b4jl9q.apps.googleusercontent.com';
    public API_KEY = 'AIzaSyALBVbo66dGGIjA8bI-_xPXX6dULV1G8WA';
    // Array of API discovery doc URLs for APIs
    public DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    //public SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
    public SCOPES = 'https://www.googleapis.com/auth/drive';
    public googleAuth;

    public updateSigninStatus(isSignedIn: Boolean): void {
        if (isSignedIn) {
            console.log('Client signed in');
        }
        else {
            console.log('Client not signed in');
        }
    }
}

var gdriveWrapper = new GdriveWrapper();

@Injectable()
export class GdriveService {

    public constructor() {
        console.log('constructor called');
        this.loginToGoogle();
    }

    private loginToGoogle(): void {
        gapi.load('client:auth2', this.initClient);
    }

    private initClient() {
        gapi.client.init({
            apiKey: gdriveWrapper.API_KEY,
            clientId: gdriveWrapper.CLIENT_ID,
            discoveryDocs: gdriveWrapper.DISCOVERY_DOCS,
            scope: gdriveWrapper.SCOPES
        }).then(() => {
            gdriveWrapper.googleAuth = gapi.auth2.getAuthInstance();
            gdriveWrapper.googleAuth.isSignedIn.listen(gdriveWrapper.updateSigninStatus);            
            console.log('Already signed in? ' + gdriveWrapper.googleAuth.isSignedIn.get());
            if (!gdriveWrapper.googleAuth.isSignedIn.get())  {
                gdriveWrapper.googleAuth.signIn();
            }
        });
    }


    public printFileList(): void {
        if (gdriveWrapper.googleAuth == null) {
            console.log('gdrive not ready yet');
            return;
        }
        if (gdriveWrapper.googleAuth.isSignedIn.get()) {
            gapi.client.drive.files.list({
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name)"
            }).then(response => {
            console.log('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log(file.name + ' (' + file.id + ')');
                }
            } else {
                console.log('No files found.');
            }
            });
        }     
    
    }     

    public uploadFile(fileName: string, data: string): void {
        if (gdriveWrapper.googleAuth == null) {
            console.log('gdrive not ready yet');
            return;
        }
        if (gdriveWrapper.googleAuth.isSignedIn.get()) {
            
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
          
            const contentType = 'application/json';
            
            var metadata = {
                'name': fileName,
                'mimeType': contentType
              };
          
            var multipartRequestBody =
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n' +
                data +
                close_delim;
        
            var request = gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody});
            
            var callback = function(file) {
                console.log(file)
            };
            
            request.execute(callback);
        } 
    }
}