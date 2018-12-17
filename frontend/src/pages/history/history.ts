import { Component } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';
import { WorkdayService, Workday } from '../../app/services/workday.service'
import { ModalController } from 'ionic-angular/components/modal/modal';
import { WorkDayPage } from '../work-day/work-day';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryListPage {
  workdayHistory: Workday[];
  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              private wdService: WorkdayService) {

    this.workdayHistory = [];
    this.observeHistoryChange = this.observeHistoryChange.bind(this);
    this.wdService.registerWorkdayHistoryCallback(this.observeHistoryChange);
    this.wdService.reloadHistory();
  }

  public printDate(workday: Workday): string {
    return new Date(workday.therapyDate).toLocaleDateString();
  }

  public printCustomers(workday: Workday): string {
    var custList: string = "";
    for (var cust of workday.customersOfDay) {
      custList += cust.firstName + ' ' + cust.lastName +  ", ";
    }
    if (custList != "") {
      return custList.slice(0, -2);
    }
    return custList;
  }

  public uploadNeeded(): number {
    var uploadNeeded = 0;
    for (var workday of this.workdayHistory) {
      if (!workday.isUploaded) {
        uploadNeeded++;
      }
    }
    return uploadNeeded;
  }

  public foundArchived(): number {
    var archived = 0;
    for (var workday of this.workdayHistory) {
      if (workday.isUploaded) {
        archived++;
      }
    }
    return archived;
  }

  public changeWorkday(workday: Workday, index: number): void {
    var workdayToEdit: Workday = this.wdService.createWorkdayCopy(workday);
    let modal = this.modalCtrl.create(WorkDayPage, { workday: workdayToEdit });
    modal.onDidDismiss(data => {
      if (data)
      {
        console.log("save edited workday");
        this.workdayHistory[index] = data;
        this.wdService.storeWorkdayHistory();
      } else {
        console.log("dismiss changes on workday");
      }
    });
    modal.present();
  }

  public removeWorkday(index: number): void {
    let confirm = this.alertCtrl.create({
      title: 'Arbeitstag wirklich löschen?',
      message: 'Soll der Arbeitstag wirklich endgültig entfernt werden?',
      buttons: [
        {
          text: 'Löschen',
          handler: () => {
            this.wdService.removeFromHistory(index);
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
            
          }
        }
      ]
    });
    confirm.present();
  }

  public uploadWorkday(workday: Workday): void {
    this.wdService.uploadWorkday(workday);
  }

  public uploadAllWorkdays(): void {
    let workdaysNeedUpload = [];
    for (var workday of this.workdayHistory) {
      if (!workday.isUploaded) {
        workdaysNeedUpload.push(workday);
      }
    }
    this.wdService.uploadWorkdays(workdaysNeedUpload);
  }

  public removeArchivedFromHistory(): void {
    this.wdService.removeArchived();
  }

  private observeHistoryChange(history: Workday[]): void {
    this.workdayHistory = history;
  }

}
