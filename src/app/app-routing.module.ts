import { CreateAdgroupComponent } from './Components/adgroups/create-adgroup/create-adgroup.component';
import { CreateCampaignComponent } from './Components/campaigns/create-campaign/create-campaign.component';
import { SignupComponent } from './Components/signup/signup.component';
import { LoginComponent } from './Components/login/login.component';
import { DisplayAdgroupComponent } from './Components/adgroups/display-adgroup/display-adgroup.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayCampaignComponent } from './Components/campaigns/display-campaign/display-campaign.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { CreateAdsComponent } from './Components/ads/create-ads/create-ads.component';

var login = true;
const routes: Routes = [
  {
    path: '',
    redirectTo: `${login ? 'campaigns/create' : 'user/login'}`,
    pathMatch: 'full',
  },
  { path: 'campaigns', component: DisplayCampaignComponent },
  { path: 'adgroups', component: DisplayAdgroupComponent },
  { path: 'user/login', component: LoginComponent },
  { path: 'user/signup', component: SignupComponent },
  { path: 'campaigns/create', component: CreateCampaignComponent },
  { path: 'adgroups/create', component: CreateAdgroupComponent },
  { path: 'ads/create', component: CreateAdsComponent },

  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
