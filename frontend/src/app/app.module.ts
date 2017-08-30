import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { CustomerListPage } from '../pages/customer-list/customer-list';
import { SettingsPage } from '../pages/settings/settings';
import { WorkDayPage } from '../pages/work-day/work-day';
import { AddCustomerModalPage } from '../pages/work-day/modals/add-customer-modal'
import { ChangeAddressModalPage } from '../pages/work-day/modals/change-address-modal'
import { TabsPage } from '../pages/tabs/tabs';
import { HistoryListPage } from "../pages/history/history";
import { OveruleDistanceModalPage } from "../pages/work-day/modals/overule-distance-modal";
import { CreateOrChangeCustomerModalPage } from "../pages/customer-list/modals/create-change-customer-modal";
import { CustomerService } from "./services/customer.service";
import { DistanceService } from "./services/distance.service";

@NgModule({
  declarations: [
    MyApp,
    CustomerListPage,
    SettingsPage,
    WorkDayPage,
    HistoryListPage,
    AddCustomerModalPage,
    ChangeAddressModalPage,
    OveruleDistanceModalPage,
    CreateOrChangeCustomerModalPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CustomerListPage,
    SettingsPage,
    HistoryListPage,
    WorkDayPage,
    AddCustomerModalPage,
    ChangeAddressModalPage,
    OveruleDistanceModalPage,
    CreateOrChangeCustomerModalPage,
    TabsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, CustomerService, DistanceService]
})
export class AppModule {}
