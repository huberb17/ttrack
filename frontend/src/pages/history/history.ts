import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { WorkdayService, Workday } from '../../app/services/workday.service'

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryListPage {
  workdayHistory: Workday[];
  constructor(public navCtrl: NavController,
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

  public uploadWorkday(workday: Workday): void {
    this.wdService.uploadWorkday(workday);
  }

  public uploadAllWorkdays(): void {
    for (var workday of this.workdayHistory) {
      this.wdService.uploadWorkday(workday);
    }
  }

  public removeArchivedFromHistory(): void {
    this.wdService.removeArchived();
  }

  private observeHistoryChange(history: Workday[]): void {
    this.workdayHistory = history;
  }

}
