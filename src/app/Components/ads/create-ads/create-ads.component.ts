import { Component, OnInit } from '@angular/core';
import { AdsModel } from '../ads-model';
@Component({
  selector: 'app-create-ads',
  templateUrl: './create-ads.component.html',
  styleUrls: ['./create-ads.component.css'],
})
export class CreateAdsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  adsModel = new AdsModel('', '', [], '');

  handleCreateAdsSubmit() {
    console.log(this.adsModel);
  }
}
