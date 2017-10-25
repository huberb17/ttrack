import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { GdriveService } from './services/gdrive.service';

@Component({
  templateUrl: 'app.html',
  providers: [ ]
})
export class MyApp {
  rootPage = TabsPage;
  winobj: any = null; // maybe better understand injectables... see chrome tabs

  constructor(platform: Platform, 
      gdriveService: GdriveService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      this.winobj = window;
      gdriveService.login(this.is_local());
      
    });
  }
  private is_local(){
    if( /^file:\/{3}[^\/]/i.test(this.winobj.location.href) ){
        return true;
    }
    return false;
}
}
