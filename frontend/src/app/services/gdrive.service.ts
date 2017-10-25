import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import CryptoJS from 'crypto-js'
import { ToastController, AlertController } from 'ionic-angular';
import { TTrackCustomer, TTrackAddress } from '../domain-model/domain-model';
import { Workday } from './workday.service';
import { GooglePlus } from 'ionic-native';

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
    public SECRET = '5lBDA9qk8nkfS2INMf8tQiOH';
    public googleAuth;
    public initOk;
    public isLocal;

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


class ChangeHistoryItem {
    public type: string;
    public command: string;
    public data: any;

    public constructor() {
        this.data = {};
    }

    public static serialize(historyItem: ChangeHistoryItem): any {
        let serHistoryItem = {};
        serHistoryItem['type'] = historyItem.type;
        serHistoryItem['command'] = historyItem.command;
        serHistoryItem['data'] = historyItem.data;
        return serHistoryItem;
    }

    public static deserialize(serHistoryItem: any): ChangeHistoryItem {
        let historyItem = new ChangeHistoryItem;
        historyItem.type = serHistoryItem['type'];
        historyItem.command = serHistoryItem['command'];
        historyItem.data = serHistoryItem['data'];
        return historyItem;
    }
}

@Injectable()
export class GdriveService {
    private changeHistory: ChangeHistoryItem[];
    private storage: Storage;
    private observers;
    private workdayUploadObservers;
    private pendingWorkdayUploads;
    private authToken: string;
    
    public constructor(private toastCtrl: ToastController, private alertCtrl: AlertController) {
        this.tryLogin = this.tryLogin.bind(this);
        this.loginToGoogle = this.loginToGoogle.bind(this);
        // this.loginToGoogle();
        this.uploadCallback = this.uploadCallback.bind(this);
        this.uploadChangeHistoryCallback = this.uploadChangeHistoryCallback.bind(this);
        this.uploadWorkdayCallback = this.uploadWorkdayCallback.bind(this);
        this.changeHistory = [];
        this.storage = new Storage();
        this.observers = [];
        this.workdayUploadObservers = [];
        this.pendingWorkdayUploads = [];
        this.refreshChangeHistory(); 
    }

    public login(is_local: boolean): void {
        if (is_local) {
            console.log('on the real devices');
            gdriveWrapper.isLocal = true;
            this.trySilentLogin();
          }
          else {
            console.log('emulating on browser');
            gdriveWrapper.isLocal = false;
            this.webLogin();
          }
    }

    private webLogin(): void {
        this.loginToGoogle();
    }

    private trySilentLogin() {
        if (typeof gapi === 'undefined') {
            let toast = this.toastCtrl.create({
                message: 'Zugriff auf Google aktuell nicht möglich. Laden Sie neu, sobald Internetverbindung vorhanden.',
                duration: 2000,
                position: 'bottom'
            })
            toast.present();
            return;
        }

        gapi.load('client', { callback: function() {
            GooglePlus.trySilentLogin({
                'scopes': gdriveWrapper.SCOPES,
                'webClientId': gdriveWrapper.CLIENT_ID,
                'offline': true
            })
            .then(res => {
                console.log(JSON.stringify(res));
                var auth_code = res['serverAuthCode'];
          
                gapi.client.request({
                  'path': '/oauth2/v4/token',
                  'method': 'POST',
                  'params': {'code': auth_code, 
                      'client_id': gdriveWrapper.CLIENT_ID,
                      'client_secret': gdriveWrapper.SECRET,
                      'redirect_uri': '',
                      'grant_type': 'authorization_code'
                  },
                    'headers': { },
                    'body': {}})
                .then( res => { 
                    console.log(JSON.stringify(res));
                    this.authToken = res['result']['access_token'];
                })
                .catch( err => {
                    console.log(JSON.stringify(err));
                });
            })
            .catch( err => {
                console.log(JSON.stringify(err));
            });
            },
            onerror: function () {
                console.log('failed to log google api library');
            }
        });
    }
    
    public tryLogin(callback) {
        GooglePlus.login({
            'scopes': gdriveWrapper.SCOPES,
            'webClientId': gdriveWrapper.CLIENT_ID,
            'offline': true
        })
        .then(res => {
            console.log(JSON.stringify(res));
            var auth_code = res['serverAuthCode'];
      
            gapi.client.request({
              'path': '/oauth2/v4/token',
              'method': 'POST',
              'params': {'code': auth_code, 
                  'client_id': gdriveWrapper.CLIENT_ID,
                  'client_secret': gdriveWrapper.SECRET,
                  'redirect_uri': '',
                  'grant_type': 'authorization_code'
              },
                'headers': { },
                'body': {}})
            .then( res => { 
                console.log(JSON.stringify(res));
                this.authToken = res['result']['access_token'];
                callback(true);
            })
            .catch( err => {
                console.log(JSON.stringify(err));
                callback(false);
            });
        })
        .catch( err => {
            console.log(JSON.stringify(err));
            callback(false);
        });
    }

    public logout(): void {
        if (!gapi) {
            return;
        }

        if (this.authToken) {
            GooglePlus.logout()
                .then(res => {
                    console.log(res);
                    this.authToken = undefined;
                })
                .catch(err => console.log(err));
        }
        else {
            if (gapi.auth2 && gdriveWrapper.googleAuth) {
                gdriveWrapper.googleAuth.signOut();
            }
        }
    }

    public registerUploadCallback(callback): void {
        this.observers.push(callback);
    }

    public registerUploadWorkdayCallback(callback): void {
        this.workdayUploadObservers.push(callback);
    }

    public reloadChangeHistory(): void {
        this.notify();
    }

    public addToChangeHistory(type: string, command: string, data: any): void {
        let historyItem: ChangeHistoryItem = new ChangeHistoryItem();
        historyItem.type = type;
        historyItem.command = command;
        historyItem.data = data;
        this.changeHistory.push(historyItem);
        this.storeChangeHistory();
    }

    public changeHistoryEmpty(): boolean {
        if (this.changeHistory.length <= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    public uploadChangeHistory(): void {
        let jsonHistory = JSON.stringify(this.changeHistory);
        let fileContent = this.encryptString(jsonHistory);
        let fileName = new Date().toISOString();
        this.uploadFile(fileName, fileContent, this.uploadChangeHistoryCallback);
    }

    public uploadCustomers(customers: TTrackCustomer[]): void {
        var jsonCustomers = JSON.stringify(customers);
        var customerFileContent = this.encryptString(jsonCustomers);
        var fileName = new Date().toISOString() + '_customers.bin';
        this.uploadFile(fileName, customerFileContent, this.uploadCallback);
    }

    public uploadAddresses(addresses: TTrackAddress[]): void {
        var jsonAddresses = JSON.stringify(addresses);
        var addressFileContent = this.encryptString(jsonAddresses);
        var fileName = new Date().toISOString() + '_addresses.bin';
        this.uploadFile(fileName, addressFileContent, this.uploadCallback);
    }

    public uploadWorkdays(workdays: Workday[]): void {
        var jsonWorkdays = JSON.stringify(workdays);
        var workdayFileContent = this.encryptString(jsonWorkdays);
        var fileName = new Date().toISOString() + '_workdays.bin';
        var workdaysToUpload = [];
        for (let wd of workdays) {
            workdaysToUpload.push(wd.id);
        }
        var pendingUpload = {};
        pendingUpload['id'] = fileName;
        pendingUpload['workdays'] = workdaysToUpload;
        console.log(pendingUpload);
        this.pendingWorkdayUploads.push(pendingUpload);        
        this.uploadFile(fileName, workdayFileContent, this.uploadWorkdayCallback);
    }
    
    private loginToGoogle(): void {
        console.log("loginToGoogle");
        if (typeof gapi === 'undefined') {
            let toast = this.toastCtrl.create({
                message: 'Zugriff auf Google nicht möglich. Laden Sie neu, sobald Internetverbindung vorhanden.',
                duration: 2000,
                position: 'bottom'
            })
            toast.present();
            return;
        }

        gapi.load('client:auth2', { callback: function() {
            console.log('try to init google client');
            console.log(JSON.stringify(gapi.client));
            gapi.client.init({
                apiKey: gdriveWrapper.API_KEY,
                clientId: gdriveWrapper.CLIENT_ID,
                discoveryDocs: gdriveWrapper.DISCOVERY_DOCS,
                scope: gdriveWrapper.SCOPES
            }).then(() => {
                console.log('enter init function');
                gdriveWrapper.initOk = true; 
                gdriveWrapper.googleAuth = gapi.auth2.getAuthInstance();
                gdriveWrapper.googleAuth.isSignedIn.listen(gdriveWrapper.updateSigninStatus);            
                console.log('Already signed in? ' + gdriveWrapper.googleAuth.isSignedIn.get());
                if (!gdriveWrapper.googleAuth.isSignedIn.get())  {
                    gdriveWrapper.googleAuth.signIn();
                }
            }).catch ( (err) => {
              console.log(JSON.stringify(err));
            });
        },
        onerror: function () {
            console.log('failed to log google api library');
        }
        });
    }

    private refreshChangeHistory() {
        var history: ChangeHistoryItem[] = [];
        this.storage.get('changeHistory').then((data) => {
            if (data) {
                for (var serHistoryItem of data) {
                    var historyItem = ChangeHistoryItem.deserialize(serHistoryItem);
                    history.push(historyItem);
                }
            }
            this.changeHistory = history;
            this.notify();
        }, (error) => {
            console.log(error.err);
            this.changeHistory = history;
            this.notify();
        });     
    }

    private storeChangeHistory() {
        var serHistory = [];
        for (var historyItem of this.changeHistory) {
            var serHistoryItem = ChangeHistoryItem.serialize(historyItem);
            serHistory.push(serHistoryItem);
        }
        this.storage.set('changeHistory', serHistory).then((data) => {
            this.notify();
        }, (error) => {
            console.log('address storage failed: ' + error);
        });     
    }

    private notify(): void {
        for (let observer of this.observers) {
            observer(this.changeHistoryEmpty());
        }
    }

    private uploadFile(fileName: string, data: string, callback): void {
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
    
        console.log('gdw 339: auth_token: %s', JSON.stringify(this.authToken));
        //this.displayAlert(JSON.stringify(this.authToken), 'Log');
        if (gdriveWrapper.initOk) {
            if (this.authToken) {
                gapi.client.setToken( { 'access_token': this.authToken });
                this.sendRequest(boundary, multipartRequestBody, callback);
            }
            else {
                if (gapi.auth2) {
                    if (gdriveWrapper.googleAuth) {
                        if (gdriveWrapper.googleAuth.isSignedIn.get()) {
                            this.sendRequest(boundary, multipartRequestBody, callback);
                        }
                        else {
                            gdriveWrapper.googleAuth.signIn()
                                .then( () => this.sendRequest(boundary, multipartRequestBody, callback))
                                .catch( (err) => console.log(JSON.stringify(err)));
                        }
                    }
                }
                else {
                    this.tryLogin( (success) => {
                        if (success) {
                            gapi.client.setToken( { 'access_token': this.authToken });
                            this.sendRequest(boundary, multipartRequestBody, callback);
                        }
                        else {
                            console.log('Google authentication failed!');
                            let toast = this.toastCtrl.create({
                                message: 'Google Login fehlgeschlagen',
                                duration: 1000,
                                position: 'bottom'
                            })
                            toast.present();
                        }
                    } );
                }
            }
        }
        else {
            console.log('google API not loaded - check internet connection');
            let toast = this.toastCtrl.create({
                message: 'Übertragung fehlgeschlagen. Überprüfen Sie die Internetverbindung und versuchen Sie es erneut.',
                duration: 2000,
                position: 'bottom'
              })
            toast.present();
            if (gdriveWrapper.isLocal) {
                console.log('on the real devices');
                this.trySilentLogin();
            }
            else {
                console.log('emulating on browser');
                this.webLogin();
            }            
        }
    }
    
    private sendRequest(boundary, multipartRequestBody, callback): void {
        var request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                //'Authorization': 'Bearer ' + this.authToken,
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
                   
        request.execute(callback);
    }        

    private uploadChangeHistoryCallback(data: any): void {
        if (data['error']) {
            console.log('Error: %s', data['error'].message);
            let toast = this.toastCtrl.create({
                message: 'Übertragung fehlgeschlagen.' + data['error'].message,
                duration: 2000,
                position: 'bottom'
              })
              toast.present();
        }
        else {
            this.changeHistory = [];
            this.storeChangeHistory();
            let toast = this.toastCtrl.create({
                message: 'Übertragung erfolgreich.',
                duration: 1000,
                position: 'bottom'
              })
              toast.present();
        }
    }

    private uploadCallback(data: any): void {
        if (data['error']) {
            console.log('Error: %s', data['error'].message);
            let toast = this.toastCtrl.create({
                message: 'Übertragung fehlgeschlagen.' + data['error'].message,
                duration: 2000,
                position: 'bottom'
              })
              toast.present();
        }
        else {
            let toast = this.toastCtrl.create({
                message: 'Übertragung erfolgreich.',
                duration: 1000,
                position: 'bottom'
              })
              toast.present();
        }
    }

    private uploadWorkdayCallback(data: any): void {
        if (data['error']) {
            console.log('Error: %s', data['error'].message);
            let toast = this.toastCtrl.create({
                message: 'Übertragung fehlgeschlagen.' + data['error'].message,
                duration: 2000,
                position: 'bottom'
              })
              toast.present();
        }
        else {
            let toast = this.toastCtrl.create({
                message: 'Übertragung erfolgreich.',
                duration: 1000,
                position: 'bottom'
              })
              toast.present();
              console.log(data);
              this.notifyWorkdayUploadObservers(data['name']);
        }
    }

    private notifyWorkdayUploadObservers(fileName: string): void {
        let workdays;
        let pendingUpload = this.pendingWorkdayUploads.find( (obj) => {
            return (obj.id == fileName)
        });
        if (pendingUpload) {
            workdays = pendingUpload['workdays'];
            this.pendingWorkdayUploads = this.pendingWorkdayUploads.filter( (obj) => {
                return (obj.id != fileName);
            });
        }
        console.log(workdays);
        for (let observer of this.workdayUploadObservers) {
            observer(workdays);
        }
    }

    private encryptString(plainText: string): string {
        console.log('The following will be enrypted: ' + plainText);
        var key = CryptoJS.enc.Latin1.parse('1234567890123456');
        var iv = CryptoJS.enc.Latin1.parse('1234567890123456');
        var encrypted = CryptoJS.AES.encrypt(plainText, key, { iv: iv });
        var result = encrypted.iv.toString() + encrypted.toString();
        console.log('iv + cipher: ' + result);
        return result;
      }

}