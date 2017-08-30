import { Component } from '@angular/core';

import { WorkDayPage } from '../work-day/work-day';
import { CustomerListPage } from '../customer-list/customer-list';
import { SettingsPage } from '../settings/settings';
import { HistoryListPage } from '../history/history';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = WorkDayPage;
  tab2Root: any = CustomerListPage;
  tab3Root: any = HistoryListPage;
  tab4Root: any = SettingsPage;

  constructor() {

  }
}
