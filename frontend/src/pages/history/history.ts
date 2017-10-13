import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Workday, WorkdayService } from '../../app/services/workday.service'

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

  private observeHistoryChange(history: Workday[]): void {
    console.log(history);
    this.workdayHistory = history;
  }

}
