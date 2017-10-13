import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { WorkdayService } from '../../app/services/workday.service'
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

  private observeHistoryChange(history: CustomerAtWorkday[]): void {
    console.log(history);
    this.workdayHistory = history;
  }

}
