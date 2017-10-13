import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { WorkdayService, Workday } from '../../app/services/workday.service'
import { CustomerAtWorkday }  from '../../app/domain-model/domain-model'

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryListPage {
  workdayHistory: CustomerAtWorkday[];
  constructor(public navCtrl: NavController,
              private wdService: WorkdayService) {

    this.workdayHistory = [];
    this.observeHistoryChange = this.observeHistoryChange.bind(this);
    this.wdService.registerWorkdayHistoryCallback(this.observeHistoryChange);
    this.wdService.reloadHistory();
  }

  printDate(workday: Workday): string {
    return new Date(workday.therapyDate).toLocaleDateString();
  }

  printCustomers(workday: Workday): string {
    var custList: string = "";
    for (var cust of workday.customersOfDay) {
      custList += cust.firstName + ' ' + cust.lastName +  ", ";
    }
    if (custList != "") {
      return custList.slice(0, -2);
    }
    return custList;
  }

  uploadWorkday(workday: Workday): void {
    this.wdService.uploadWorkday(workday);
  }

  private observeHistoryChange(history: CustomerAtWorkday[]): void {
    console.log(history);
    this.workdayHistory = history;
  }

}
