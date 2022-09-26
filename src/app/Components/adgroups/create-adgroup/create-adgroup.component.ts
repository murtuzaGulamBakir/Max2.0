import { Component, OnInit } from '@angular/core';
import { AdgroupModel } from '../adgroup-model';
@Component({
  selector: 'app-create-adgroup',
  templateUrl: './create-adgroup.component.html',
  styleUrls: ['./create-adgroup.component.css'],
})
export class CreateAdgroupComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  adgroupModel = new AdgroupModel('', '', [], []);

  handleCategoryFilter(event: any) {}

  handleCategorySelect(event: any) {}
  handleCreateAdGroupSubmit() {
    console.log(this.adgroupModel);
  }

  handleKeywordFileUpload(event: any) {}
}
