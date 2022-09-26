import { CampaignModel } from '../campaign-model';
import { Component, OnInit, Type } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
} from 'rxjs/operators';

// Interfaces For Data Options Rendering in Campaign

export interface BudgetPacing {
  value: string;
  viewValue: string;
}

export interface WeekDaysAdSchedule {
  weekDaysList: string;
}

// Angular Implementaion
@Component({
  selector: 'app-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css'],
})
export class CreateCampaignComponent implements OnInit {
  //  Debounce Variable
  searchControlGeolocation = new FormControl('');

  // Angular HTTPClient For Calling Endpoints
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Debounce on GeoLocation Include
    this.searchControlGeolocation.valueChanges
      .pipe(
        // execute only id search lenghth > 2
        // filter((searchedText) => searchedText.length > 2),
        startWith(''),
        // Time in milliseconds between key events
        debounceTime(1000),
        // If previous query is diffent from current
        distinctUntilChanged()
        // subscription for response
      )
      .subscribe((searchedText: string) => {
        console.log(searchedText);
        this.http
          .get(
            'https://localhost:44318/api/geolocations/?location=' +
              searchedText,
            {
              params: new HttpParams({
                fromObject: {
                  action: 'opensearch',
                  format: 'json',
                  origin: '*',
                },
              }).set('search', searchedText),
            }
          )
          .subscribe((res) => {
            console.log(res);
          });
      });
  }

  // Initializing Campaign Form Object Model
  campaignModel = new CampaignModel(
    '',
    '',
    '',
    0,
    0,
    [],
    [],
    [],
    '',
    [],
    [],
    [],
    []
  );

  err: string = ''; // error field in UI

  // Handling CSV Upload and Reading Data
  csvInputChange(fileInputEvent: any, domainType: string) {
    var uploadedFile: any = fileInputEvent.target.files[0];
    var fileName = uploadedFile.name;

    // Validatig File Extension
    var fileExtension =
      fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) ||
      fileName;

    //  Stop If File is Invalid
    if (fileExtension.toLowerCase() != 'csv') {
      return;
    }
    // Creating FileStream Object and Seperating Data into Arrays
    var reader = new FileReader();
    reader.readAsText(uploadedFile);
    reader.onload = function (e) {
      var csvDataBuffer = e.target!.result;
      var dataStr = <string>csvDataBuffer;
      var csvDataConvertedToArray = [];
      const rows = dataStr.split('\n');
      for (let i = 0; i < rows.length; i++) {
        var tempArray = rows[i].split(',');
        for (let j = 0; j < tempArray.length; j++) {
          csvDataConvertedToArray.push(tempArray[j]);
        }
      }
      window.localStorage.setItem(
        'csvArr',
        JSON.stringify(csvDataConvertedToArray)
      );
    };

    // sets Value of Global Campaign Model Form Object
    this.setDomainValues(domainType);
  }

  // Detects Valid 'Domain' in CSV File and Adds to Campaign Domain
  setDomainValues(domainType: string) {
    setTimeout(() => {
      var lsString: any;
      lsString = localStorage.getItem('csvArr');
      lsString = JSON.parse(lsString);

      // Parsing Entire CSV File Data and validating
      for (let domainIndex in lsString) {
        const value = (lsString[domainIndex] || '').trim();
        // Regular Expression Domain Validation
        var regexForDomainvalidation =
          '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$';

        var regexpObj = new RegExp(regexForDomainvalidation);
        // if regexp return false then domain is invalid so stop function excution
        if (!regexpObj.test(value)) {
          continue;
        }
        // check if domain already exist in included or excluded domains
        if (
          this.campaignModel.domains.includes(value) ||
          this.campaignModel.excludedDomains.includes(value)
        ) {
          continue;
        }

        // adding valid  domains to global array
        if (domainType == 'INCLUDEDDOMAINS') {
          this.campaignModel.domains.push(value);
          localStorage.removeItem('csvArr');
        } else if (domainType == 'EXCLUDEDDOMAINS') {
          this.campaignModel.excludedDomains.push(value);
          localStorage.removeItem('csvArr');
        }
      }
    }, 200);
  }
  // ************************* Domain Field Setup Code Start
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Regular Expression Domain Validation
    var regexForDomainvalidation =
      '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$';

    var regexpObj = new RegExp(regexForDomainvalidation);

    // if regexp return false then domain is invalid so stop function execution
    if (!regexpObj.test(value)) {
      return;
    }
    // check if domain already exist in included or excluded domains
    if (
      this.campaignModel.domains.includes(value) ||
      this.campaignModel.excludedDomains.includes(value)
    ) {
      return;
    }

    this.campaignModel.domains.push(value);
    // Clear the input value
    event.chipInput!.clear();
  }

  remove(domainToBeRemoved: string): void {
    const indexCampignDomainToBeRemoved =
      this.campaignModel.domains.indexOf(domainToBeRemoved);
    if (indexCampignDomainToBeRemoved >= 0) {
      this.campaignModel.domains.splice(indexCampignDomainToBeRemoved, 1);
    }
  }

  // ************************* Domain Field Setup Code End

  // ************************* Excluded Domain Field Setup Code Start
  addExcludedDomain(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Regular Expression Domain Validation
    var regexForDomainvalidation =
      '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$';

    var regexpObj = new RegExp(regexForDomainvalidation);

    // if regexp return false then domain is invalid so stop function execution
    if (!regexpObj.test(value)) {
      return;
    }

    // check if domain already exist in included or excluded domains
    if (
      this.campaignModel.domains.includes(value) ||
      this.campaignModel.excludedDomains.includes(value)
    ) {
      return;
    }
    // Add A Domain
    if (value) {
      this.campaignModel.excludedDomains.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeExcludedDomain(excludedDomainTobeRemoved: string) {
    const indexOfDomainToBeRemoved = this.campaignModel.excludedDomains.indexOf(
      excludedDomainTobeRemoved
    );

    if (indexOfDomainToBeRemoved >= 0) {
      this.campaignModel.excludedDomains.splice(indexOfDomainToBeRemoved, 1);
    }
  }

  // hanling  Time Selection for Various Days

  handleWeekDayTimeShedule(event: any, dayOfTheAd: string) {
    // if weekDay Already Exist in adSchedulingDayAndTime then ovveride that Object

    // finding if Object already exist in "adSchedulingDayAndTime"
    const dayTimeObject = this.campaignModel.adSchedulingDayAndTime.find(
      ({ name }) => name == dayOfTheAd
    );

    // if does not exist then Create a New Object with Day and Time values
    if (!dayTimeObject) {
      // Else

      this.campaignModel.adSchedulingDayAndTime.push({
        name: dayOfTheAd,
        time: event.value,
      });
    }

    // Object already Exist
    else {
      // Update Existing Entry  and Time in Corresponding day
      dayTimeObject.time = event.value;
    }
  }

  // ************************* Excluded Field Setup Code End

  // ********************** Campaign Devices Start
  formObjForDevice = new FormControl('');

  devicesNames: string[] = ['Mobile', 'Laptop', 'Desktop', 'Tablet'];

  // ********************** Campaign Devices End

  budgetsList: BudgetPacing[] = [
    { value: 'true', viewValue: 'Enable' },
    { value: 'false', viewValue: 'Disable' },
  ];

  weekDays = new FormControl('');

  weekDaysList: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  WeekDayTimeList: string[] = [
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];
  // Handles Campaign Form Submit
  handleCreateCampaignSubmit() {
    this.err = '';
    // holds form data
    var campaignFormData: CampaignModel = this.campaignModel;

    // validating Campaign name
    if (campaignFormData.name.length <= 3) {
      this.err = 'Campaign Name should be atleast 4 character !!';
      return;
    }

    // validate start and end date
    if (campaignFormData.startDate == '' || campaignFormData.endDate == '') {
      this.err = 'Start and End dates are Required!!';
      return;
    }

    // validate Daily and Overall Budget
    if (
      campaignFormData.dailyBudget == 0 ||
      campaignFormData.overallBudget == 0
    ) {
      this.err = "Daily OR Overall Budget can't be 0 !!";
      return;
    }

    if (campaignFormData.dailyBudget > campaignFormData.overallBudget) {
      this.err = 'Daily Budget should be lesser than Overall !!';
      return;
    }
    // validating Campaign Domain
    if (campaignFormData.domains.length <= 0) {
      this.err = 'Enter Atleast one Domain !!';
      return;
    }

    // validating Campaign Devices
    if (campaignFormData.devices.length <= 0) {
      this.err = 'Select Alteast one Device !!';
      return;
    }

    // validating Budget Pacing
    if (campaignFormData.budgetPacing == '') {
      this.err = 'Budget Pacing Required !!';
      return;
    }
    // validating AdSchdeduling
    if (campaignFormData.adSchedulingDays.length <= 0) {
      this.err = 'Select Atleast One Schedule Day !!';
      return;
    }

    console.log(campaignFormData);
    // Posting Data To Json Server
    // this.http
    //   .post(`http://localhost:3000/campaigns`, campaignFormData)
    //   .subscribe((res) => {
    //     console.log('Response from API :  ', res);
    //   });
  }

  // Logic To setUp Geolocation Field
  // geoLocationReference = new FormControl('');

  masterListOfLocations = [
    {
      name: 'Afghanistan',
      isoCode: 'AF',
      flag: '🇦🇫',
      phonecode: '93',
      currency: 'AFN',
      latitude: '33.00000000',
      longitude: '65.00000000',
      timezones: [
        {
          zoneName: 'Asia/Kabul',
          gmtOffset: 16200,
          gmtOffsetName: 'UTC+04:30',
          abbreviation: 'AFT',
          tzName: 'Afghanistan Time',
        },
      ],
    },
    {
      name: 'Aland Islands',
      isoCode: 'AX',
      flag: '🇦🇽',
      phonecode: '+358-18',
      currency: 'EUR',
      latitude: '60.11666700',
      longitude: '19.90000000',
      timezones: [
        {
          zoneName: 'Europe/Mariehamn',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Albania',
      isoCode: 'AL',
      flag: '🇦🇱',
      phonecode: '355',
      currency: 'ALL',
      latitude: '41.00000000',
      longitude: '20.00000000',
      timezones: [
        {
          zoneName: 'Europe/Tirane',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Algeria',
      isoCode: 'DZ',
      flag: '🇩🇿',
      phonecode: '213',
      currency: 'DZD',
      latitude: '28.00000000',
      longitude: '3.00000000',
      timezones: [
        {
          zoneName: 'Africa/Algiers',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'American Samoa',
      isoCode: 'AS',
      flag: '🇦🇸',
      phonecode: '+1-684',
      currency: 'USD',
      latitude: '-14.33333333',
      longitude: '-170.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Pago_Pago',
          gmtOffset: -39600,
          gmtOffsetName: 'UTC-11:00',
          abbreviation: 'SST',
          tzName: 'Samoa Standard Time',
        },
      ],
    },
    {
      name: 'Andorra',
      isoCode: 'AD',
      flag: '🇦🇩',
      phonecode: '376',
      currency: 'EUR',
      latitude: '42.50000000',
      longitude: '1.50000000',
      timezones: [
        {
          zoneName: 'Europe/Andorra',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Angola',
      isoCode: 'AO',
      flag: '🇦🇴',
      phonecode: '244',
      currency: 'AOA',
      latitude: '-12.50000000',
      longitude: '18.50000000',
      timezones: [
        {
          zoneName: 'Africa/Luanda',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Anguilla',
      isoCode: 'AI',
      flag: '🇦🇮',
      phonecode: '+1-264',
      currency: 'XCD',
      latitude: '18.25000000',
      longitude: '-63.16666666',
      timezones: [
        {
          zoneName: 'America/Anguilla',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Antarctica',
      isoCode: 'AQ',
      flag: '🇦🇶',
      phonecode: '672',
      currency: 'AAD',
      latitude: '-74.65000000',
      longitude: '4.48000000',
      timezones: [
        {
          zoneName: 'Antarctica/Casey',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'AWST',
          tzName: 'Australian Western Standard Time',
        },
        {
          zoneName: 'Antarctica/Davis',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'DAVT',
          tzName: 'Davis Time',
        },
        {
          zoneName: 'Antarctica/DumontDUrville',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'DDUT',
          tzName: "Dumont d'Urville Time",
        },
        {
          zoneName: 'Antarctica/Mawson',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'MAWT',
          tzName: 'Mawson Station Time',
        },
        {
          zoneName: 'Antarctica/McMurdo',
          gmtOffset: 46800,
          gmtOffsetName: 'UTC+13:00',
          abbreviation: 'NZDT',
          tzName: 'New Zealand Daylight Time',
        },
        {
          zoneName: 'Antarctica/Palmer',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'CLST',
          tzName: 'Chile Summer Time',
        },
        {
          zoneName: 'Antarctica/Rothera',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ROTT',
          tzName: 'Rothera Research Station Time',
        },
        {
          zoneName: 'Antarctica/Syowa',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'SYOT',
          tzName: 'Showa Station Time',
        },
        {
          zoneName: 'Antarctica/Troll',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
        {
          zoneName: 'Antarctica/Vostok',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'VOST',
          tzName: 'Vostok Station Time',
        },
      ],
    },
    {
      name: 'Antigua And Barbuda',
      isoCode: 'AG',
      flag: '🇦🇬',
      phonecode: '+1-268',
      currency: 'XCD',
      latitude: '17.05000000',
      longitude: '-61.80000000',
      timezones: [
        {
          zoneName: 'America/Antigua',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Argentina',
      isoCode: 'AR',
      flag: '🇦🇷',
      phonecode: '54',
      currency: 'ARS',
      latitude: '-34.00000000',
      longitude: '-64.00000000',
      timezones: [
        {
          zoneName: 'America/Argentina/Buenos_Aires',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Catamarca',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Cordoba',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Jujuy',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/La_Rioja',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Mendoza',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Rio_Gallegos',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Salta',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/San_Juan',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/San_Luis',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Tucuman',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
        {
          zoneName: 'America/Argentina/Ushuaia',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'ART',
          tzName: 'Argentina Time',
        },
      ],
    },
    {
      name: 'Armenia',
      isoCode: 'AM',
      flag: '🇦🇲',
      phonecode: '374',
      currency: 'AMD',
      latitude: '40.00000000',
      longitude: '45.00000000',
      timezones: [
        {
          zoneName: 'Asia/Yerevan',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'AMT',
          tzName: 'Armenia Time',
        },
      ],
    },
    {
      name: 'Aruba',
      isoCode: 'AW',
      flag: '🇦🇼',
      phonecode: '297',
      currency: 'AWG',
      latitude: '12.50000000',
      longitude: '-69.96666666',
      timezones: [
        {
          zoneName: 'America/Aruba',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Australia',
      isoCode: 'AU',
      flag: '🇦🇺',
      phonecode: '61',
      currency: 'AUD',
      latitude: '-27.00000000',
      longitude: '133.00000000',
      timezones: [
        {
          zoneName: 'Antarctica/Macquarie',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'MIST',
          tzName: 'Macquarie Island Station Time',
        },
        {
          zoneName: 'Australia/Adelaide',
          gmtOffset: 37800,
          gmtOffsetName: 'UTC+10:30',
          abbreviation: 'ACDT',
          tzName: 'Australian Central Daylight Saving Time',
        },
        {
          zoneName: 'Australia/Brisbane',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'AEST',
          tzName: 'Australian Eastern Standard Time',
        },
        {
          zoneName: 'Australia/Broken_Hill',
          gmtOffset: 37800,
          gmtOffsetName: 'UTC+10:30',
          abbreviation: 'ACDT',
          tzName: 'Australian Central Daylight Saving Time',
        },
        {
          zoneName: 'Australia/Currie',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'AEDT',
          tzName: 'Australian Eastern Daylight Saving Time',
        },
        {
          zoneName: 'Australia/Darwin',
          gmtOffset: 34200,
          gmtOffsetName: 'UTC+09:30',
          abbreviation: 'ACST',
          tzName: 'Australian Central Standard Time',
        },
        {
          zoneName: 'Australia/Eucla',
          gmtOffset: 31500,
          gmtOffsetName: 'UTC+08:45',
          abbreviation: 'ACWST',
          tzName: 'Australian Central Western Standard Time (Unofficial)',
        },
        {
          zoneName: 'Australia/Hobart',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'AEDT',
          tzName: 'Australian Eastern Daylight Saving Time',
        },
        {
          zoneName: 'Australia/Lindeman',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'AEST',
          tzName: 'Australian Eastern Standard Time',
        },
        {
          zoneName: 'Australia/Lord_Howe',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'LHST',
          tzName: 'Lord Howe Summer Time',
        },
        {
          zoneName: 'Australia/Melbourne',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'AEDT',
          tzName: 'Australian Eastern Daylight Saving Time',
        },
        {
          zoneName: 'Australia/Perth',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'AWST',
          tzName: 'Australian Western Standard Time',
        },
        {
          zoneName: 'Australia/Sydney',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'AEDT',
          tzName: 'Australian Eastern Daylight Saving Time',
        },
      ],
    },
    {
      name: 'Austria',
      isoCode: 'AT',
      flag: '🇦🇹',
      phonecode: '43',
      currency: 'EUR',
      latitude: '47.33333333',
      longitude: '13.33333333',
      timezones: [
        {
          zoneName: 'Europe/Vienna',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Azerbaijan',
      isoCode: 'AZ',
      flag: '🇦🇿',
      phonecode: '994',
      currency: 'AZN',
      latitude: '40.50000000',
      longitude: '47.50000000',
      timezones: [
        {
          zoneName: 'Asia/Baku',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'AZT',
          tzName: 'Azerbaijan Time',
        },
      ],
    },
    {
      name: 'The Bahamas',
      isoCode: 'BS',
      flag: '🇧🇸',
      phonecode: '+1-242',
      currency: 'BSD',
      latitude: '24.25000000',
      longitude: '-76.00000000',
      timezones: [
        {
          zoneName: 'America/Nassau',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America)',
        },
      ],
    },
    {
      name: 'Bahrain',
      isoCode: 'BH',
      flag: '🇧🇭',
      phonecode: '973',
      currency: 'BHD',
      latitude: '26.00000000',
      longitude: '50.55000000',
      timezones: [
        {
          zoneName: 'Asia/Bahrain',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Bangladesh',
      isoCode: 'BD',
      flag: '🇧🇩',
      phonecode: '880',
      currency: 'BDT',
      latitude: '24.00000000',
      longitude: '90.00000000',
      timezones: [
        {
          zoneName: 'Asia/Dhaka',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'BDT',
          tzName: 'Bangladesh Standard Time',
        },
      ],
    },
    {
      name: 'Barbados',
      isoCode: 'BB',
      flag: '🇧🇧',
      phonecode: '+1-246',
      currency: 'BBD',
      latitude: '13.16666666',
      longitude: '-59.53333333',
      timezones: [
        {
          zoneName: 'America/Barbados',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Belarus',
      isoCode: 'BY',
      flag: '🇧🇾',
      phonecode: '375',
      currency: 'BYN',
      latitude: '53.00000000',
      longitude: '28.00000000',
      timezones: [
        {
          zoneName: 'Europe/Minsk',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'MSK',
          tzName: 'Moscow Time',
        },
      ],
    },
    {
      name: 'Belgium',
      isoCode: 'BE',
      flag: '🇧🇪',
      phonecode: '32',
      currency: 'EUR',
      latitude: '50.83333333',
      longitude: '4.00000000',
      timezones: [
        {
          zoneName: 'Europe/Brussels',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Belize',
      isoCode: 'BZ',
      flag: '🇧🇿',
      phonecode: '501',
      currency: 'BZD',
      latitude: '17.25000000',
      longitude: '-88.75000000',
      timezones: [
        {
          zoneName: 'America/Belize',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America)',
        },
      ],
    },
    {
      name: 'Benin',
      isoCode: 'BJ',
      flag: '🇧🇯',
      phonecode: '229',
      currency: 'XOF',
      latitude: '9.50000000',
      longitude: '2.25000000',
      timezones: [
        {
          zoneName: 'Africa/Porto-Novo',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Bermuda',
      isoCode: 'BM',
      flag: '🇧🇲',
      phonecode: '+1-441',
      currency: 'BMD',
      latitude: '32.33333333',
      longitude: '-64.75000000',
      timezones: [
        {
          zoneName: 'Atlantic/Bermuda',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Bhutan',
      isoCode: 'BT',
      flag: '🇧🇹',
      phonecode: '975',
      currency: 'BTN',
      latitude: '27.50000000',
      longitude: '90.50000000',
      timezones: [
        {
          zoneName: 'Asia/Thimphu',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'BTT',
          tzName: 'Bhutan Time',
        },
      ],
    },
    {
      name: 'Bolivia',
      isoCode: 'BO',
      flag: '🇧🇴',
      phonecode: '591',
      currency: 'BOB',
      latitude: '-17.00000000',
      longitude: '-65.00000000',
      timezones: [
        {
          zoneName: 'America/La_Paz',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'BOT',
          tzName: 'Bolivia Time',
        },
      ],
    },
    {
      name: 'Bosnia and Herzegovina',
      isoCode: 'BA',
      flag: '🇧🇦',
      phonecode: '387',
      currency: 'BAM',
      latitude: '44.00000000',
      longitude: '18.00000000',
      timezones: [
        {
          zoneName: 'Europe/Sarajevo',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Botswana',
      isoCode: 'BW',
      flag: '🇧🇼',
      phonecode: '267',
      currency: 'BWP',
      latitude: '-22.00000000',
      longitude: '24.00000000',
      timezones: [
        {
          zoneName: 'Africa/Gaborone',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Bouvet Island',
      isoCode: 'BV',
      flag: '🇧🇻',
      phonecode: '0055',
      currency: 'NOK',
      latitude: '-54.43333333',
      longitude: '3.40000000',
      timezones: [
        {
          zoneName: 'Europe/Oslo',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Brazil',
      isoCode: 'BR',
      flag: '🇧🇷',
      phonecode: '55',
      currency: 'BRL',
      latitude: '-10.00000000',
      longitude: '-55.00000000',
      timezones: [
        {
          zoneName: 'America/Araguaina',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Bahia',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Belem',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Boa_Vista',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AMT',
          tzName: 'Amazon Time (Brazil)[3',
        },
        {
          zoneName: 'America/Campo_Grande',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AMT',
          tzName: 'Amazon Time (Brazil)[3',
        },
        {
          zoneName: 'America/Cuiaba',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'BRT',
          tzName: 'Brasilia Time',
        },
        {
          zoneName: 'America/Eirunepe',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'ACT',
          tzName: 'Acre Time',
        },
        {
          zoneName: 'America/Fortaleza',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Maceio',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Manaus',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AMT',
          tzName: 'Amazon Time (Brazil)',
        },
        {
          zoneName: 'America/Noronha',
          gmtOffset: -7200,
          gmtOffsetName: 'UTC-02:00',
          abbreviation: 'FNT',
          tzName: 'Fernando de Noronha Time',
        },
        {
          zoneName: 'America/Porto_Velho',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AMT',
          tzName: 'Amazon Time (Brazil)[3',
        },
        {
          zoneName: 'America/Recife',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Rio_Branco',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'ACT',
          tzName: 'Acre Time',
        },
        {
          zoneName: 'America/Santarem',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
        {
          zoneName: 'America/Sao_Paulo',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'BRT',
          tzName: 'Brasília Time',
        },
      ],
    },
    {
      name: 'British Indian Ocean Territory',
      isoCode: 'IO',
      flag: '🇮🇴',
      phonecode: '246',
      currency: 'USD',
      latitude: '-6.00000000',
      longitude: '71.50000000',
      timezones: [
        {
          zoneName: 'Indian/Chagos',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'IOT',
          tzName: 'Indian Ocean Time',
        },
      ],
    },
    {
      name: 'Brunei',
      isoCode: 'BN',
      flag: '🇧🇳',
      phonecode: '673',
      currency: 'BND',
      latitude: '4.50000000',
      longitude: '114.66666666',
      timezones: [
        {
          zoneName: 'Asia/Brunei',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'BNT',
          tzName: 'Brunei Darussalam Time',
        },
      ],
    },
    {
      name: 'Bulgaria',
      isoCode: 'BG',
      flag: '🇧🇬',
      phonecode: '359',
      currency: 'BGN',
      latitude: '43.00000000',
      longitude: '25.00000000',
      timezones: [
        {
          zoneName: 'Europe/Sofia',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Burkina Faso',
      isoCode: 'BF',
      flag: '🇧🇫',
      phonecode: '226',
      currency: 'XOF',
      latitude: '13.00000000',
      longitude: '-2.00000000',
      timezones: [
        {
          zoneName: 'Africa/Ouagadougou',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Burundi',
      isoCode: 'BI',
      flag: '🇧🇮',
      phonecode: '257',
      currency: 'BIF',
      latitude: '-3.50000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Bujumbura',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Cambodia',
      isoCode: 'KH',
      flag: '🇰🇭',
      phonecode: '855',
      currency: 'KHR',
      latitude: '13.00000000',
      longitude: '105.00000000',
      timezones: [
        {
          zoneName: 'Asia/Phnom_Penh',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'ICT',
          tzName: 'Indochina Time',
        },
      ],
    },
    {
      name: 'Cameroon',
      isoCode: 'CM',
      flag: '🇨🇲',
      phonecode: '237',
      currency: 'XAF',
      latitude: '6.00000000',
      longitude: '12.00000000',
      timezones: [
        {
          zoneName: 'Africa/Douala',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Canada',
      isoCode: 'CA',
      flag: '🇨🇦',
      phonecode: '1',
      currency: 'CAD',
      latitude: '60.00000000',
      longitude: '-95.00000000',
      timezones: [
        {
          zoneName: 'America/Atikokan',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America)',
        },
        {
          zoneName: 'America/Blanc-Sablon',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
        {
          zoneName: 'America/Cambridge_Bay',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Creston',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Dawson',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Dawson_Creek',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Edmonton',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Fort_Nelson',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America)',
        },
        {
          zoneName: 'America/Glace_Bay',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
        {
          zoneName: 'America/Goose_Bay',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
        {
          zoneName: 'America/Halifax',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
        {
          zoneName: 'America/Inuvik',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Iqaluit',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Moncton',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
        {
          zoneName: 'America/Nipigon',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Pangnirtung',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Rainy_River',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Rankin_Inlet',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Regina',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Resolute',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/St_Johns',
          gmtOffset: -12600,
          gmtOffsetName: 'UTC-03:30',
          abbreviation: 'NST',
          tzName: 'Newfoundland Standard Time',
        },
        {
          zoneName: 'America/Swift_Current',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Thunder_Bay',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Toronto',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Vancouver',
          gmtOffset: -28800,
          gmtOffsetName: 'UTC-08:00',
          abbreviation: 'PST',
          tzName: 'Pacific Standard Time (North America',
        },
        {
          zoneName: 'America/Whitehorse',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Winnipeg',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Yellowknife',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
      ],
    },
    {
      name: 'Cape Verde',
      isoCode: 'CV',
      flag: '🇨🇻',
      phonecode: '238',
      currency: 'CVE',
      latitude: '16.00000000',
      longitude: '-24.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/Cape_Verde',
          gmtOffset: -3600,
          gmtOffsetName: 'UTC-01:00',
          abbreviation: 'CVT',
          tzName: 'Cape Verde Time',
        },
      ],
    },
    {
      name: 'Cayman Islands',
      isoCode: 'KY',
      flag: '🇰🇾',
      phonecode: '+1-345',
      currency: 'KYD',
      latitude: '19.50000000',
      longitude: '-80.50000000',
      timezones: [
        {
          zoneName: 'America/Cayman',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
      ],
    },
    {
      name: 'Central African Republic',
      isoCode: 'CF',
      flag: '🇨🇫',
      phonecode: '236',
      currency: 'XAF',
      latitude: '7.00000000',
      longitude: '21.00000000',
      timezones: [
        {
          zoneName: 'Africa/Bangui',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Chad',
      isoCode: 'TD',
      flag: '🇹🇩',
      phonecode: '235',
      currency: 'XAF',
      latitude: '15.00000000',
      longitude: '19.00000000',
      timezones: [
        {
          zoneName: 'Africa/Ndjamena',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Chile',
      isoCode: 'CL',
      flag: '🇨🇱',
      phonecode: '56',
      currency: 'CLP',
      latitude: '-30.00000000',
      longitude: '-71.00000000',
      timezones: [
        {
          zoneName: 'America/Punta_Arenas',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'CLST',
          tzName: 'Chile Summer Time',
        },
        {
          zoneName: 'America/Santiago',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'CLST',
          tzName: 'Chile Summer Time',
        },
        {
          zoneName: 'Pacific/Easter',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EASST',
          tzName: 'Easter Island Summer Time',
        },
      ],
    },
    {
      name: 'China',
      isoCode: 'CN',
      flag: '🇨🇳',
      phonecode: '86',
      currency: 'CNY',
      latitude: '35.00000000',
      longitude: '105.00000000',
      timezones: [
        {
          zoneName: 'Asia/Shanghai',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'CST',
          tzName: 'China Standard Time',
        },
        {
          zoneName: 'Asia/Urumqi',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'XJT',
          tzName: 'China Standard Time',
        },
      ],
    },
    {
      name: 'Christmas Island',
      isoCode: 'CX',
      flag: '🇨🇽',
      phonecode: '61',
      currency: 'AUD',
      latitude: '-10.50000000',
      longitude: '105.66666666',
      timezones: [
        {
          zoneName: 'Indian/Christmas',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'CXT',
          tzName: 'Christmas Island Time',
        },
      ],
    },
    {
      name: 'Cocos (Keeling) Islands',
      isoCode: 'CC',
      flag: '🇨🇨',
      phonecode: '61',
      currency: 'AUD',
      latitude: '-12.50000000',
      longitude: '96.83333333',
      timezones: [
        {
          zoneName: 'Indian/Cocos',
          gmtOffset: 23400,
          gmtOffsetName: 'UTC+06:30',
          abbreviation: 'CCT',
          tzName: 'Cocos Islands Time',
        },
      ],
    },
    {
      name: 'Colombia',
      isoCode: 'CO',
      flag: '🇨🇴',
      phonecode: '57',
      currency: 'COP',
      latitude: '4.00000000',
      longitude: '-72.00000000',
      timezones: [
        {
          zoneName: 'America/Bogota',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'COT',
          tzName: 'Colombia Time',
        },
      ],
    },
    {
      name: 'Comoros',
      isoCode: 'KM',
      flag: '🇰🇲',
      phonecode: '269',
      currency: 'KMF',
      latitude: '-12.16666666',
      longitude: '44.25000000',
      timezones: [
        {
          zoneName: 'Indian/Comoro',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Congo',
      isoCode: 'CG',
      flag: '🇨🇬',
      phonecode: '242',
      currency: 'XAF',
      latitude: '-1.00000000',
      longitude: '15.00000000',
      timezones: [
        {
          zoneName: 'Africa/Brazzaville',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Democratic Republic of the Congo',
      isoCode: 'CD',
      flag: '🇨🇩',
      phonecode: '243',
      currency: 'CDF',
      latitude: '0.00000000',
      longitude: '25.00000000',
      timezones: [
        {
          zoneName: 'Africa/Kinshasa',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
        {
          zoneName: 'Africa/Lubumbashi',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Cook Islands',
      isoCode: 'CK',
      flag: '🇨🇰',
      phonecode: '682',
      currency: 'NZD',
      latitude: '-21.23333333',
      longitude: '-159.76666666',
      timezones: [
        {
          zoneName: 'Pacific/Rarotonga',
          gmtOffset: -36000,
          gmtOffsetName: 'UTC-10:00',
          abbreviation: 'CKT',
          tzName: 'Cook Island Time',
        },
      ],
    },
    {
      name: 'Costa Rica',
      isoCode: 'CR',
      flag: '🇨🇷',
      phonecode: '506',
      currency: 'CRC',
      latitude: '10.00000000',
      longitude: '-84.00000000',
      timezones: [
        {
          zoneName: 'America/Costa_Rica',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
      ],
    },
    {
      name: "Cote D'Ivoire (Ivory Coast)",
      isoCode: 'CI',
      flag: '🇨🇮',
      phonecode: '225',
      currency: 'XOF',
      latitude: '8.00000000',
      longitude: '-5.00000000',
      timezones: [
        {
          zoneName: 'Africa/Abidjan',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Croatia',
      isoCode: 'HR',
      flag: '🇭🇷',
      phonecode: '385',
      currency: 'HRK',
      latitude: '45.16666666',
      longitude: '15.50000000',
      timezones: [
        {
          zoneName: 'Europe/Zagreb',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Cuba',
      isoCode: 'CU',
      flag: '🇨🇺',
      phonecode: '53',
      currency: 'CUP',
      latitude: '21.50000000',
      longitude: '-80.00000000',
      timezones: [
        {
          zoneName: 'America/Havana',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'CST',
          tzName: 'Cuba Standard Time',
        },
      ],
    },
    {
      name: 'Cyprus',
      isoCode: 'CY',
      flag: '🇨🇾',
      phonecode: '357',
      currency: 'EUR',
      latitude: '35.00000000',
      longitude: '33.00000000',
      timezones: [
        {
          zoneName: 'Asia/Famagusta',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
        {
          zoneName: 'Asia/Nicosia',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Czech Republic',
      isoCode: 'CZ',
      flag: '🇨🇿',
      phonecode: '420',
      currency: 'CZK',
      latitude: '49.75000000',
      longitude: '15.50000000',
      timezones: [
        {
          zoneName: 'Europe/Prague',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Denmark',
      isoCode: 'DK',
      flag: '🇩🇰',
      phonecode: '45',
      currency: 'DKK',
      latitude: '56.00000000',
      longitude: '10.00000000',
      timezones: [
        {
          zoneName: 'Europe/Copenhagen',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Djibouti',
      isoCode: 'DJ',
      flag: '🇩🇯',
      phonecode: '253',
      currency: 'DJF',
      latitude: '11.50000000',
      longitude: '43.00000000',
      timezones: [
        {
          zoneName: 'Africa/Djibouti',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Dominica',
      isoCode: 'DM',
      flag: '🇩🇲',
      phonecode: '+1-767',
      currency: 'XCD',
      latitude: '15.41666666',
      longitude: '-61.33333333',
      timezones: [
        {
          zoneName: 'America/Dominica',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Dominican Republic',
      isoCode: 'DO',
      flag: '🇩🇴',
      phonecode: '+1-809 and 1-829',
      currency: 'DOP',
      latitude: '19.00000000',
      longitude: '-70.66666666',
      timezones: [
        {
          zoneName: 'America/Santo_Domingo',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'East Timor',
      isoCode: 'TL',
      flag: '🇹🇱',
      phonecode: '670',
      currency: 'USD',
      latitude: '-8.83333333',
      longitude: '125.91666666',
      timezones: [
        {
          zoneName: 'Asia/Dili',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'TLT',
          tzName: 'Timor Leste Time',
        },
      ],
    },
    {
      name: 'Ecuador',
      isoCode: 'EC',
      flag: '🇪🇨',
      phonecode: '593',
      currency: 'USD',
      latitude: '-2.00000000',
      longitude: '-77.50000000',
      timezones: [
        {
          zoneName: 'America/Guayaquil',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'ECT',
          tzName: 'Ecuador Time',
        },
        {
          zoneName: 'Pacific/Galapagos',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'GALT',
          tzName: 'Galápagos Time',
        },
      ],
    },
    {
      name: 'Egypt',
      isoCode: 'EG',
      flag: '🇪🇬',
      phonecode: '20',
      currency: 'EGP',
      latitude: '27.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Cairo',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'El Salvador',
      isoCode: 'SV',
      flag: '🇸🇻',
      phonecode: '503',
      currency: 'USD',
      latitude: '13.83333333',
      longitude: '-88.91666666',
      timezones: [
        {
          zoneName: 'America/El_Salvador',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
      ],
    },
    {
      name: 'Equatorial Guinea',
      isoCode: 'GQ',
      flag: '🇬🇶',
      phonecode: '240',
      currency: 'XAF',
      latitude: '2.00000000',
      longitude: '10.00000000',
      timezones: [
        {
          zoneName: 'Africa/Malabo',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Eritrea',
      isoCode: 'ER',
      flag: '🇪🇷',
      phonecode: '291',
      currency: 'ERN',
      latitude: '15.00000000',
      longitude: '39.00000000',
      timezones: [
        {
          zoneName: 'Africa/Asmara',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Estonia',
      isoCode: 'EE',
      flag: '🇪🇪',
      phonecode: '372',
      currency: 'EUR',
      latitude: '59.00000000',
      longitude: '26.00000000',
      timezones: [
        {
          zoneName: 'Europe/Tallinn',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Ethiopia',
      isoCode: 'ET',
      flag: '🇪🇹',
      phonecode: '251',
      currency: 'ETB',
      latitude: '8.00000000',
      longitude: '38.00000000',
      timezones: [
        {
          zoneName: 'Africa/Addis_Ababa',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Falkland Islands',
      isoCode: 'FK',
      flag: '🇫🇰',
      phonecode: '500',
      currency: 'FKP',
      latitude: '-51.75000000',
      longitude: '-59.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/Stanley',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'FKST',
          tzName: 'Falkland Islands Summer Time',
        },
      ],
    },
    {
      name: 'Faroe Islands',
      isoCode: 'FO',
      flag: '🇫🇴',
      phonecode: '298',
      currency: 'DKK',
      latitude: '62.00000000',
      longitude: '-7.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/Faroe',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'WET',
          tzName: 'Western European Time',
        },
      ],
    },
    {
      name: 'Fiji Islands',
      isoCode: 'FJ',
      flag: '🇫🇯',
      phonecode: '679',
      currency: 'FJD',
      latitude: '-18.00000000',
      longitude: '175.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Fiji',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'FJT',
          tzName: 'Fiji Time',
        },
      ],
    },
    {
      name: 'Finland',
      isoCode: 'FI',
      flag: '🇫🇮',
      phonecode: '358',
      currency: 'EUR',
      latitude: '64.00000000',
      longitude: '26.00000000',
      timezones: [
        {
          zoneName: 'Europe/Helsinki',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'France',
      isoCode: 'FR',
      flag: '🇫🇷',
      phonecode: '33',
      currency: 'EUR',
      latitude: '46.00000000',
      longitude: '2.00000000',
      timezones: [
        {
          zoneName: 'Europe/Paris',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'French Guiana',
      isoCode: 'GF',
      flag: '🇬🇫',
      phonecode: '594',
      currency: 'EUR',
      latitude: '4.00000000',
      longitude: '-53.00000000',
      timezones: [
        {
          zoneName: 'America/Cayenne',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'GFT',
          tzName: 'French Guiana Time',
        },
      ],
    },
    {
      name: 'French Polynesia',
      isoCode: 'PF',
      flag: '🇵🇫',
      phonecode: '689',
      currency: 'XPF',
      latitude: '-15.00000000',
      longitude: '-140.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Gambier',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'GAMT',
          tzName: 'Gambier Islands Time',
        },
        {
          zoneName: 'Pacific/Marquesas',
          gmtOffset: -34200,
          gmtOffsetName: 'UTC-09:30',
          abbreviation: 'MART',
          tzName: 'Marquesas Islands Time',
        },
        {
          zoneName: 'Pacific/Tahiti',
          gmtOffset: -36000,
          gmtOffsetName: 'UTC-10:00',
          abbreviation: 'TAHT',
          tzName: 'Tahiti Time',
        },
      ],
    },
    {
      name: 'French Southern Territories',
      isoCode: 'TF',
      flag: '🇹🇫',
      phonecode: '262',
      currency: 'EUR',
      latitude: '-49.25000000',
      longitude: '69.16700000',
      timezones: [
        {
          zoneName: 'Indian/Kerguelen',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'TFT',
          tzName: 'French Southern and Antarctic Time',
        },
      ],
    },
    {
      name: 'Gabon',
      isoCode: 'GA',
      flag: '🇬🇦',
      phonecode: '241',
      currency: 'XAF',
      latitude: '-1.00000000',
      longitude: '11.75000000',
      timezones: [
        {
          zoneName: 'Africa/Libreville',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Gambia The',
      isoCode: 'GM',
      flag: '🇬🇲',
      phonecode: '220',
      currency: 'GMD',
      latitude: '13.46666666',
      longitude: '-16.56666666',
      timezones: [
        {
          zoneName: 'Africa/Banjul',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Georgia',
      isoCode: 'GE',
      flag: '🇬🇪',
      phonecode: '995',
      currency: 'GEL',
      latitude: '42.00000000',
      longitude: '43.50000000',
      timezones: [
        {
          zoneName: 'Asia/Tbilisi',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'GET',
          tzName: 'Georgia Standard Time',
        },
      ],
    },
    {
      name: 'Germany',
      isoCode: 'DE',
      flag: '🇩🇪',
      phonecode: '49',
      currency: 'EUR',
      latitude: '51.00000000',
      longitude: '9.00000000',
      timezones: [
        {
          zoneName: 'Europe/Berlin',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
        {
          zoneName: 'Europe/Busingen',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Ghana',
      isoCode: 'GH',
      flag: '🇬🇭',
      phonecode: '233',
      currency: 'GHS',
      latitude: '8.00000000',
      longitude: '-2.00000000',
      timezones: [
        {
          zoneName: 'Africa/Accra',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Gibraltar',
      isoCode: 'GI',
      flag: '🇬🇮',
      phonecode: '350',
      currency: 'GIP',
      latitude: '36.13333333',
      longitude: '-5.35000000',
      timezones: [
        {
          zoneName: 'Europe/Gibraltar',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Greece',
      isoCode: 'GR',
      flag: '🇬🇷',
      phonecode: '30',
      currency: 'EUR',
      latitude: '39.00000000',
      longitude: '22.00000000',
      timezones: [
        {
          zoneName: 'Europe/Athens',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Greenland',
      isoCode: 'GL',
      flag: '🇬🇱',
      phonecode: '299',
      currency: 'DKK',
      latitude: '72.00000000',
      longitude: '-40.00000000',
      timezones: [
        {
          zoneName: 'America/Danmarkshavn',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
        {
          zoneName: 'America/Nuuk',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'WGT',
          tzName: 'West Greenland Time',
        },
        {
          zoneName: 'America/Scoresbysund',
          gmtOffset: -3600,
          gmtOffsetName: 'UTC-01:00',
          abbreviation: 'EGT',
          tzName: 'Eastern Greenland Time',
        },
        {
          zoneName: 'America/Thule',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Grenada',
      isoCode: 'GD',
      flag: '🇬🇩',
      phonecode: '+1-473',
      currency: 'XCD',
      latitude: '12.11666666',
      longitude: '-61.66666666',
      timezones: [
        {
          zoneName: 'America/Grenada',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Guadeloupe',
      isoCode: 'GP',
      flag: '🇬🇵',
      phonecode: '590',
      currency: 'EUR',
      latitude: '16.25000000',
      longitude: '-61.58333300',
      timezones: [
        {
          zoneName: 'America/Guadeloupe',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Guam',
      isoCode: 'GU',
      flag: '🇬🇺',
      phonecode: '+1-671',
      currency: 'USD',
      latitude: '13.46666666',
      longitude: '144.78333333',
      timezones: [
        {
          zoneName: 'Pacific/Guam',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'CHST',
          tzName: 'Chamorro Standard Time',
        },
      ],
    },
    {
      name: 'Guatemala',
      isoCode: 'GT',
      flag: '🇬🇹',
      phonecode: '502',
      currency: 'GTQ',
      latitude: '15.50000000',
      longitude: '-90.25000000',
      timezones: [
        {
          zoneName: 'America/Guatemala',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
      ],
    },
    {
      name: 'Guernsey and Alderney',
      isoCode: 'GG',
      flag: '🇬🇬',
      phonecode: '+44-1481',
      currency: 'GBP',
      latitude: '49.46666666',
      longitude: '-2.58333333',
      timezones: [
        {
          zoneName: 'Europe/Guernsey',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Guinea',
      isoCode: 'GN',
      flag: '🇬🇳',
      phonecode: '224',
      currency: 'GNF',
      latitude: '11.00000000',
      longitude: '-10.00000000',
      timezones: [
        {
          zoneName: 'Africa/Conakry',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Guinea-Bissau',
      isoCode: 'GW',
      flag: '🇬🇼',
      phonecode: '245',
      currency: 'XOF',
      latitude: '12.00000000',
      longitude: '-15.00000000',
      timezones: [
        {
          zoneName: 'Africa/Bissau',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Guyana',
      isoCode: 'GY',
      flag: '🇬🇾',
      phonecode: '592',
      currency: 'GYD',
      latitude: '5.00000000',
      longitude: '-59.00000000',
      timezones: [
        {
          zoneName: 'America/Guyana',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'GYT',
          tzName: 'Guyana Time',
        },
      ],
    },
    {
      name: 'Haiti',
      isoCode: 'HT',
      flag: '🇭🇹',
      phonecode: '509',
      currency: 'HTG',
      latitude: '19.00000000',
      longitude: '-72.41666666',
      timezones: [
        {
          zoneName: 'America/Port-au-Prince',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
      ],
    },
    {
      name: 'Heard Island and McDonald Islands',
      isoCode: 'HM',
      flag: '🇭🇲',
      phonecode: '672',
      currency: 'AUD',
      latitude: '-53.10000000',
      longitude: '72.51666666',
      timezones: [
        {
          zoneName: 'Indian/Kerguelen',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'TFT',
          tzName: 'French Southern and Antarctic Time',
        },
      ],
    },
    {
      name: 'Honduras',
      isoCode: 'HN',
      flag: '🇭🇳',
      phonecode: '504',
      currency: 'HNL',
      latitude: '15.00000000',
      longitude: '-86.50000000',
      timezones: [
        {
          zoneName: 'America/Tegucigalpa',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
      ],
    },
    {
      name: 'Hong Kong S.A.R.',
      isoCode: 'HK',
      flag: '🇭🇰',
      phonecode: '852',
      currency: 'HKD',
      latitude: '22.25000000',
      longitude: '114.16666666',
      timezones: [
        {
          zoneName: 'Asia/Hong_Kong',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'HKT',
          tzName: 'Hong Kong Time',
        },
      ],
    },
    {
      name: 'Hungary',
      isoCode: 'HU',
      flag: '🇭🇺',
      phonecode: '36',
      currency: 'HUF',
      latitude: '47.00000000',
      longitude: '20.00000000',
      timezones: [
        {
          zoneName: 'Europe/Budapest',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Iceland',
      isoCode: 'IS',
      flag: '🇮🇸',
      phonecode: '354',
      currency: 'ISK',
      latitude: '65.00000000',
      longitude: '-18.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/Reykjavik',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'India',
      isoCode: 'IN',
      flag: '🇮🇳',
      phonecode: '91',
      currency: 'INR',
      latitude: '20.00000000',
      longitude: '77.00000000',
      timezones: [
        {
          zoneName: 'Asia/Kolkata',
          gmtOffset: 19800,
          gmtOffsetName: 'UTC+05:30',
          abbreviation: 'IST',
          tzName: 'Indian Standard Time',
        },
      ],
    },
    {
      name: 'Indonesia',
      isoCode: 'ID',
      flag: '🇮🇩',
      phonecode: '62',
      currency: 'IDR',
      latitude: '-5.00000000',
      longitude: '120.00000000',
      timezones: [
        {
          zoneName: 'Asia/Jakarta',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'WIB',
          tzName: 'Western Indonesian Time',
        },
        {
          zoneName: 'Asia/Jayapura',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'WIT',
          tzName: 'Eastern Indonesian Time',
        },
        {
          zoneName: 'Asia/Makassar',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'WITA',
          tzName: 'Central Indonesia Time',
        },
        {
          zoneName: 'Asia/Pontianak',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'WIB',
          tzName: 'Western Indonesian Time',
        },
      ],
    },
    {
      name: 'Iran',
      isoCode: 'IR',
      flag: '🇮🇷',
      phonecode: '98',
      currency: 'IRR',
      latitude: '32.00000000',
      longitude: '53.00000000',
      timezones: [
        {
          zoneName: 'Asia/Tehran',
          gmtOffset: 12600,
          gmtOffsetName: 'UTC+03:30',
          abbreviation: 'IRDT',
          tzName: 'Iran Daylight Time',
        },
      ],
    },
    {
      name: 'Iraq',
      isoCode: 'IQ',
      flag: '🇮🇶',
      phonecode: '964',
      currency: 'IQD',
      latitude: '33.00000000',
      longitude: '44.00000000',
      timezones: [
        {
          zoneName: 'Asia/Baghdad',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Ireland',
      isoCode: 'IE',
      flag: '🇮🇪',
      phonecode: '353',
      currency: 'EUR',
      latitude: '53.00000000',
      longitude: '-8.00000000',
      timezones: [
        {
          zoneName: 'Europe/Dublin',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Israel',
      isoCode: 'IL',
      flag: '🇮🇱',
      phonecode: '972',
      currency: 'ILS',
      latitude: '31.50000000',
      longitude: '34.75000000',
      timezones: [
        {
          zoneName: 'Asia/Jerusalem',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'IST',
          tzName: 'Israel Standard Time',
        },
      ],
    },
    {
      name: 'Italy',
      isoCode: 'IT',
      flag: '🇮🇹',
      phonecode: '39',
      currency: 'EUR',
      latitude: '42.83333333',
      longitude: '12.83333333',
      timezones: [
        {
          zoneName: 'Europe/Rome',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Jamaica',
      isoCode: 'JM',
      flag: '🇯🇲',
      phonecode: '+1-876',
      currency: 'JMD',
      latitude: '18.25000000',
      longitude: '-77.50000000',
      timezones: [
        {
          zoneName: 'America/Jamaica',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
      ],
    },
    {
      name: 'Japan',
      isoCode: 'JP',
      flag: '🇯🇵',
      phonecode: '81',
      currency: 'JPY',
      latitude: '36.00000000',
      longitude: '138.00000000',
      timezones: [
        {
          zoneName: 'Asia/Tokyo',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'JST',
          tzName: 'Japan Standard Time',
        },
      ],
    },
    {
      name: 'Jersey',
      isoCode: 'JE',
      flag: '🇯🇪',
      phonecode: '+44-1534',
      currency: 'GBP',
      latitude: '49.25000000',
      longitude: '-2.16666666',
      timezones: [
        {
          zoneName: 'Europe/Jersey',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Jordan',
      isoCode: 'JO',
      flag: '🇯🇴',
      phonecode: '962',
      currency: 'JOD',
      latitude: '31.00000000',
      longitude: '36.00000000',
      timezones: [
        {
          zoneName: 'Asia/Amman',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Kazakhstan',
      isoCode: 'KZ',
      flag: '🇰🇿',
      phonecode: '7',
      currency: 'KZT',
      latitude: '48.00000000',
      longitude: '68.00000000',
      timezones: [
        {
          zoneName: 'Asia/Almaty',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'ALMT',
          tzName: 'Alma-Ata Time[1',
        },
        {
          zoneName: 'Asia/Aqtau',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'AQTT',
          tzName: 'Aqtobe Time',
        },
        {
          zoneName: 'Asia/Aqtobe',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'AQTT',
          tzName: 'Aqtobe Time',
        },
        {
          zoneName: 'Asia/Atyrau',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'MSD+1',
          tzName: 'Moscow Daylight Time+1',
        },
        {
          zoneName: 'Asia/Oral',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'ORAT',
          tzName: 'Oral Time',
        },
        {
          zoneName: 'Asia/Qostanay',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'QYZST',
          tzName: 'Qyzylorda Summer Time',
        },
        {
          zoneName: 'Asia/Qyzylorda',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'QYZT',
          tzName: 'Qyzylorda Summer Time',
        },
      ],
    },
    {
      name: 'Kenya',
      isoCode: 'KE',
      flag: '🇰🇪',
      phonecode: '254',
      currency: 'KES',
      latitude: '1.00000000',
      longitude: '38.00000000',
      timezones: [
        {
          zoneName: 'Africa/Nairobi',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },

    {
      name: 'North Korea',
      isoCode: 'KP',
      flag: '🇰🇵',
      phonecode: '850',
      currency: 'KPW',
      latitude: '40.00000000',
      longitude: '127.00000000',
      timezones: [
        {
          zoneName: 'Asia/Pyongyang',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'KST',
          tzName: 'Korea Standard Time',
        },
      ],
    },
    {
      name: 'South Korea',
      isoCode: 'KR',
      flag: '🇰🇷',
      phonecode: '82',
      currency: 'KRW',
      latitude: '37.00000000',
      longitude: '127.50000000',
      timezones: [
        {
          zoneName: 'Asia/Seoul',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'KST',
          tzName: 'Korea Standard Time',
        },
      ],
    },
    {
      name: 'Kuwait',
      isoCode: 'KW',
      flag: '🇰🇼',
      phonecode: '965',
      currency: 'KWD',
      latitude: '29.50000000',
      longitude: '45.75000000',
      timezones: [
        {
          zoneName: 'Asia/Kuwait',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Kyrgyzstan',
      isoCode: 'KG',
      flag: '🇰🇬',
      phonecode: '996',
      currency: 'KGS',
      latitude: '41.00000000',
      longitude: '75.00000000',
      timezones: [
        {
          zoneName: 'Asia/Bishkek',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'KGT',
          tzName: 'Kyrgyzstan Time',
        },
      ],
    },
    {
      name: 'Laos',
      isoCode: 'LA',
      flag: '🇱🇦',
      phonecode: '856',
      currency: 'LAK',
      latitude: '18.00000000',
      longitude: '105.00000000',
      timezones: [
        {
          zoneName: 'Asia/Vientiane',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'ICT',
          tzName: 'Indochina Time',
        },
      ],
    },
    {
      name: 'Latvia',
      isoCode: 'LV',
      flag: '🇱🇻',
      phonecode: '371',
      currency: 'EUR',
      latitude: '57.00000000',
      longitude: '25.00000000',
      timezones: [
        {
          zoneName: 'Europe/Riga',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Lebanon',
      isoCode: 'LB',
      flag: '🇱🇧',
      phonecode: '961',
      currency: 'LBP',
      latitude: '33.83333333',
      longitude: '35.83333333',
      timezones: [
        {
          zoneName: 'Asia/Beirut',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Lesotho',
      isoCode: 'LS',
      flag: '🇱🇸',
      phonecode: '266',
      currency: 'LSL',
      latitude: '-29.50000000',
      longitude: '28.50000000',
      timezones: [
        {
          zoneName: 'Africa/Maseru',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'SAST',
          tzName: 'South African Standard Time',
        },
      ],
    },
    {
      name: 'Liberia',
      isoCode: 'LR',
      flag: '🇱🇷',
      phonecode: '231',
      currency: 'LRD',
      latitude: '6.50000000',
      longitude: '-9.50000000',
      timezones: [
        {
          zoneName: 'Africa/Monrovia',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Libya',
      isoCode: 'LY',
      flag: '🇱🇾',
      phonecode: '218',
      currency: 'LYD',
      latitude: '25.00000000',
      longitude: '17.00000000',
      timezones: [
        {
          zoneName: 'Africa/Tripoli',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Liechtenstein',
      isoCode: 'LI',
      flag: '🇱🇮',
      phonecode: '423',
      currency: 'CHF',
      latitude: '47.26666666',
      longitude: '9.53333333',
      timezones: [
        {
          zoneName: 'Europe/Vaduz',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Lithuania',
      isoCode: 'LT',
      flag: '🇱🇹',
      phonecode: '370',
      currency: 'EUR',
      latitude: '56.00000000',
      longitude: '24.00000000',
      timezones: [
        {
          zoneName: 'Europe/Vilnius',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Luxembourg',
      isoCode: 'LU',
      flag: '🇱🇺',
      phonecode: '352',
      currency: 'EUR',
      latitude: '49.75000000',
      longitude: '6.16666666',
      timezones: [
        {
          zoneName: 'Europe/Luxembourg',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Macau S.A.R.',
      isoCode: 'MO',
      flag: '🇲🇴',
      phonecode: '853',
      currency: 'MOP',
      latitude: '22.16666666',
      longitude: '113.55000000',
      timezones: [
        {
          zoneName: 'Asia/Macau',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'CST',
          tzName: 'China Standard Time',
        },
      ],
    },
    {
      name: 'Macedonia',
      isoCode: 'MK',
      flag: '🇲🇰',
      phonecode: '389',
      currency: 'MKD',
      latitude: '41.83333333',
      longitude: '22.00000000',
      timezones: [
        {
          zoneName: 'Europe/Skopje',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Madagascar',
      isoCode: 'MG',
      flag: '🇲🇬',
      phonecode: '261',
      currency: 'MGA',
      latitude: '-20.00000000',
      longitude: '47.00000000',
      timezones: [
        {
          zoneName: 'Indian/Antananarivo',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Malawi',
      isoCode: 'MW',
      flag: '🇲🇼',
      phonecode: '265',
      currency: 'MWK',
      latitude: '-13.50000000',
      longitude: '34.00000000',
      timezones: [
        {
          zoneName: 'Africa/Blantyre',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Malaysia',
      isoCode: 'MY',
      flag: '🇲🇾',
      phonecode: '60',
      currency: 'MYR',
      latitude: '2.50000000',
      longitude: '112.50000000',
      timezones: [
        {
          zoneName: 'Asia/Kuala_Lumpur',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'MYT',
          tzName: 'Malaysia Time',
        },
        {
          zoneName: 'Asia/Kuching',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'MYT',
          tzName: 'Malaysia Time',
        },
      ],
    },
    {
      name: 'Maldives',
      isoCode: 'MV',
      flag: '🇲🇻',
      phonecode: '960',
      currency: 'MVR',
      latitude: '3.25000000',
      longitude: '73.00000000',
      timezones: [
        {
          zoneName: 'Indian/Maldives',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'MVT',
          tzName: 'Maldives Time',
        },
      ],
    },
    {
      name: 'Mali',
      isoCode: 'ML',
      flag: '🇲🇱',
      phonecode: '223',
      currency: 'XOF',
      latitude: '17.00000000',
      longitude: '-4.00000000',
      timezones: [
        {
          zoneName: 'Africa/Bamako',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Malta',
      isoCode: 'MT',
      flag: '🇲🇹',
      phonecode: '356',
      currency: 'EUR',
      latitude: '35.83333333',
      longitude: '14.58333333',
      timezones: [
        {
          zoneName: 'Europe/Malta',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Man (Isle of)',
      isoCode: 'IM',
      flag: '🇮🇲',
      phonecode: '+44-1624',
      currency: 'GBP',
      latitude: '54.25000000',
      longitude: '-4.50000000',
      timezones: [
        {
          zoneName: 'Europe/Isle_of_Man',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Marshall Islands',
      isoCode: 'MH',
      flag: '🇲🇭',
      phonecode: '692',
      currency: 'USD',
      latitude: '9.00000000',
      longitude: '168.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Kwajalein',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'MHT',
          tzName: 'Marshall Islands Time',
        },
        {
          zoneName: 'Pacific/Majuro',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'MHT',
          tzName: 'Marshall Islands Time',
        },
      ],
    },
    {
      name: 'Martinique',
      isoCode: 'MQ',
      flag: '🇲🇶',
      phonecode: '596',
      currency: 'EUR',
      latitude: '14.66666700',
      longitude: '-61.00000000',
      timezones: [
        {
          zoneName: 'America/Martinique',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Mauritania',
      isoCode: 'MR',
      flag: '🇲🇷',
      phonecode: '222',
      currency: 'MRO',
      latitude: '20.00000000',
      longitude: '-12.00000000',
      timezones: [
        {
          zoneName: 'Africa/Nouakchott',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Mauritius',
      isoCode: 'MU',
      flag: '🇲🇺',
      phonecode: '230',
      currency: 'MUR',
      latitude: '-20.28333333',
      longitude: '57.55000000',
      timezones: [
        {
          zoneName: 'Indian/Mauritius',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'MUT',
          tzName: 'Mauritius Time',
        },
      ],
    },
    {
      name: 'Mayotte',
      isoCode: 'YT',
      flag: '🇾🇹',
      phonecode: '262',
      currency: 'EUR',
      latitude: '-12.83333333',
      longitude: '45.16666666',
      timezones: [
        {
          zoneName: 'Indian/Mayotte',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Mexico',
      isoCode: 'MX',
      flag: '🇲🇽',
      phonecode: '52',
      currency: 'MXN',
      latitude: '23.00000000',
      longitude: '-102.00000000',
      timezones: [
        {
          zoneName: 'America/Bahia_Banderas',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Cancun',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Chihuahua',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Hermosillo',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Matamoros',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Mazatlan',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Merida',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Mexico_City',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Monterrey',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Ojinaga',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Tijuana',
          gmtOffset: -28800,
          gmtOffsetName: 'UTC-08:00',
          abbreviation: 'PST',
          tzName: 'Pacific Standard Time (North America',
        },
      ],
    },
    {
      name: 'Micronesia',
      isoCode: 'FM',
      flag: '🇫🇲',
      phonecode: '691',
      currency: 'USD',
      latitude: '6.91666666',
      longitude: '158.25000000',
      timezones: [
        {
          zoneName: 'Pacific/Chuuk',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'CHUT',
          tzName: 'Chuuk Time',
        },
        {
          zoneName: 'Pacific/Kosrae',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'KOST',
          tzName: 'Kosrae Time',
        },
        {
          zoneName: 'Pacific/Pohnpei',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'PONT',
          tzName: 'Pohnpei Standard Time',
        },
      ],
    },
    {
      name: 'Moldova',
      isoCode: 'MD',
      flag: '🇲🇩',
      phonecode: '373',
      currency: 'MDL',
      latitude: '47.00000000',
      longitude: '29.00000000',
      timezones: [
        {
          zoneName: 'Europe/Chisinau',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Monaco',
      isoCode: 'MC',
      flag: '🇲🇨',
      phonecode: '377',
      currency: 'EUR',
      latitude: '43.73333333',
      longitude: '7.40000000',
      timezones: [
        {
          zoneName: 'Europe/Monaco',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Mongolia',
      isoCode: 'MN',
      flag: '🇲🇳',
      phonecode: '976',
      currency: 'MNT',
      latitude: '46.00000000',
      longitude: '105.00000000',
      timezones: [
        {
          zoneName: 'Asia/Choibalsan',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'CHOT',
          tzName: 'Choibalsan Standard Time',
        },
        {
          zoneName: 'Asia/Hovd',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'HOVT',
          tzName: 'Hovd Time',
        },
        {
          zoneName: 'Asia/Ulaanbaatar',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'ULAT',
          tzName: 'Ulaanbaatar Standard Time',
        },
      ],
    },
    {
      name: 'Montenegro',
      isoCode: 'ME',
      flag: '🇲🇪',
      phonecode: '382',
      currency: 'EUR',
      latitude: '42.50000000',
      longitude: '19.30000000',
      timezones: [
        {
          zoneName: 'Europe/Podgorica',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Montserrat',
      isoCode: 'MS',
      flag: '🇲🇸',
      phonecode: '+1-664',
      currency: 'XCD',
      latitude: '16.75000000',
      longitude: '-62.20000000',
      timezones: [
        {
          zoneName: 'America/Montserrat',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Morocco',
      isoCode: 'MA',
      flag: '🇲🇦',
      phonecode: '212',
      currency: 'MAD',
      latitude: '32.00000000',
      longitude: '-5.00000000',
      timezones: [
        {
          zoneName: 'Africa/Casablanca',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WEST',
          tzName: 'Western European Summer Time',
        },
      ],
    },
    {
      name: 'Mozambique',
      isoCode: 'MZ',
      flag: '🇲🇿',
      phonecode: '258',
      currency: 'MZN',
      latitude: '-18.25000000',
      longitude: '35.00000000',
      timezones: [
        {
          zoneName: 'Africa/Maputo',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Myanmar',
      isoCode: 'MM',
      flag: '🇲🇲',
      phonecode: '95',
      currency: 'MMK',
      latitude: '22.00000000',
      longitude: '98.00000000',
      timezones: [
        {
          zoneName: 'Asia/Yangon',
          gmtOffset: 23400,
          gmtOffsetName: 'UTC+06:30',
          abbreviation: 'MMT',
          tzName: 'Myanmar Standard Time',
        },
      ],
    },
    {
      name: 'Namibia',
      isoCode: 'NA',
      flag: '🇳🇦',
      phonecode: '264',
      currency: 'NAD',
      latitude: '-22.00000000',
      longitude: '17.00000000',
      timezones: [
        {
          zoneName: 'Africa/Windhoek',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'WAST',
          tzName: 'West Africa Summer Time',
        },
      ],
    },
    {
      name: 'Nauru',
      isoCode: 'NR',
      flag: '🇳🇷',
      phonecode: '674',
      currency: 'AUD',
      latitude: '-0.53333333',
      longitude: '166.91666666',
      timezones: [
        {
          zoneName: 'Pacific/Nauru',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'NRT',
          tzName: 'Nauru Time',
        },
      ],
    },
    {
      name: 'Nepal',
      isoCode: 'NP',
      flag: '🇳🇵',
      phonecode: '977',
      currency: 'NPR',
      latitude: '28.00000000',
      longitude: '84.00000000',
      timezones: [
        {
          zoneName: 'Asia/Kathmandu',
          gmtOffset: 20700,
          gmtOffsetName: 'UTC+05:45',
          abbreviation: 'NPT',
          tzName: 'Nepal Time',
        },
      ],
    },
    {
      name: 'Bonaire, Sint Eustatius and Saba',
      isoCode: 'BQ',
      flag: '🇧🇶',
      phonecode: '599',
      currency: 'USD',
      latitude: '12.15000000',
      longitude: '-68.26666700',
      timezones: [
        {
          zoneName: 'America/Anguilla',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Netherlands',
      isoCode: 'NL',
      flag: '🇳🇱',
      phonecode: '31',
      currency: 'EUR',
      latitude: '52.50000000',
      longitude: '5.75000000',
      timezones: [
        {
          zoneName: 'Europe/Amsterdam',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'New Caledonia',
      isoCode: 'NC',
      flag: '🇳🇨',
      phonecode: '687',
      currency: 'XPF',
      latitude: '-21.50000000',
      longitude: '165.50000000',
      timezones: [
        {
          zoneName: 'Pacific/Noumea',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'NCT',
          tzName: 'New Caledonia Time',
        },
      ],
    },
    {
      name: 'New Zealand',
      isoCode: 'NZ',
      flag: '🇳🇿',
      phonecode: '64',
      currency: 'NZD',
      latitude: '-41.00000000',
      longitude: '174.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Auckland',
          gmtOffset: 46800,
          gmtOffsetName: 'UTC+13:00',
          abbreviation: 'NZDT',
          tzName: 'New Zealand Daylight Time',
        },
        {
          zoneName: 'Pacific/Chatham',
          gmtOffset: 49500,
          gmtOffsetName: 'UTC+13:45',
          abbreviation: 'CHAST',
          tzName: 'Chatham Standard Time',
        },
      ],
    },
    {
      name: 'Nicaragua',
      isoCode: 'NI',
      flag: '🇳🇮',
      phonecode: '505',
      currency: 'NIO',
      latitude: '13.00000000',
      longitude: '-85.00000000',
      timezones: [
        {
          zoneName: 'America/Managua',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
      ],
    },
    {
      name: 'Niger',
      isoCode: 'NE',
      flag: '🇳🇪',
      phonecode: '227',
      currency: 'XOF',
      latitude: '16.00000000',
      longitude: '8.00000000',
      timezones: [
        {
          zoneName: 'Africa/Niamey',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Nigeria',
      isoCode: 'NG',
      flag: '🇳🇬',
      phonecode: '234',
      currency: 'NGN',
      latitude: '10.00000000',
      longitude: '8.00000000',
      timezones: [
        {
          zoneName: 'Africa/Lagos',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WAT',
          tzName: 'West Africa Time',
        },
      ],
    },
    {
      name: 'Niue',
      isoCode: 'NU',
      flag: '🇳🇺',
      phonecode: '683',
      currency: 'NZD',
      latitude: '-19.03333333',
      longitude: '-169.86666666',
      timezones: [
        {
          zoneName: 'Pacific/Niue',
          gmtOffset: -39600,
          gmtOffsetName: 'UTC-11:00',
          abbreviation: 'NUT',
          tzName: 'Niue Time',
        },
      ],
    },
    {
      name: 'Norfolk Island',
      isoCode: 'NF',
      flag: '🇳🇫',
      phonecode: '672',
      currency: 'AUD',
      latitude: '-29.03333333',
      longitude: '167.95000000',
      timezones: [
        {
          zoneName: 'Pacific/Norfolk',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'NFT',
          tzName: 'Norfolk Time',
        },
      ],
    },
    {
      name: 'Northern Mariana Islands',
      isoCode: 'MP',
      flag: '🇲🇵',
      phonecode: '+1-670',
      currency: 'USD',
      latitude: '15.20000000',
      longitude: '145.75000000',
      timezones: [
        {
          zoneName: 'Pacific/Saipan',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'ChST',
          tzName: 'Chamorro Standard Time',
        },
      ],
    },
    {
      name: 'Norway',
      isoCode: 'NO',
      flag: '🇳🇴',
      phonecode: '47',
      currency: 'NOK',
      latitude: '62.00000000',
      longitude: '10.00000000',
      timezones: [
        {
          zoneName: 'Europe/Oslo',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Oman',
      isoCode: 'OM',
      flag: '🇴🇲',
      phonecode: '968',
      currency: 'OMR',
      latitude: '21.00000000',
      longitude: '57.00000000',
      timezones: [
        {
          zoneName: 'Asia/Muscat',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'GST',
          tzName: 'Gulf Standard Time',
        },
      ],
    },
    {
      name: 'Pakistan',
      isoCode: 'PK',
      flag: '🇵🇰',
      phonecode: '92',
      currency: 'PKR',
      latitude: '30.00000000',
      longitude: '70.00000000',
      timezones: [
        {
          zoneName: 'Asia/Karachi',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'PKT',
          tzName: 'Pakistan Standard Time',
        },
      ],
    },
    {
      name: 'Palau',
      isoCode: 'PW',
      flag: '🇵🇼',
      phonecode: '680',
      currency: 'USD',
      latitude: '7.50000000',
      longitude: '134.50000000',
      timezones: [
        {
          zoneName: 'Pacific/Palau',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'PWT',
          tzName: 'Palau Time',
        },
      ],
    },
    {
      name: 'Palestinian Territory Occupied',
      isoCode: 'PS',
      flag: '🇵🇸',
      phonecode: '970',
      currency: 'ILS',
      latitude: '31.90000000',
      longitude: '35.20000000',
      timezones: [
        {
          zoneName: 'Asia/Gaza',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
        {
          zoneName: 'Asia/Hebron',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Panama',
      isoCode: 'PA',
      flag: '🇵🇦',
      phonecode: '507',
      currency: 'PAB',
      latitude: '9.00000000',
      longitude: '-80.00000000',
      timezones: [
        {
          zoneName: 'America/Panama',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
      ],
    },
    {
      name: 'Papua new Guinea',
      isoCode: 'PG',
      flag: '🇵🇬',
      phonecode: '675',
      currency: 'PGK',
      latitude: '-6.00000000',
      longitude: '147.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Bougainville',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'BST',
          tzName: 'Bougainville Standard Time[6',
        },
        {
          zoneName: 'Pacific/Port_Moresby',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'PGT',
          tzName: 'Papua New Guinea Time',
        },
      ],
    },
    {
      name: 'Paraguay',
      isoCode: 'PY',
      flag: '🇵🇾',
      phonecode: '595',
      currency: 'PYG',
      latitude: '-23.00000000',
      longitude: '-58.00000000',
      timezones: [
        {
          zoneName: 'America/Asuncion',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'PYST',
          tzName: 'Paraguay Summer Time',
        },
      ],
    },
    {
      name: 'Peru',
      isoCode: 'PE',
      flag: '🇵🇪',
      phonecode: '51',
      currency: 'PEN',
      latitude: '-10.00000000',
      longitude: '-76.00000000',
      timezones: [
        {
          zoneName: 'America/Lima',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'PET',
          tzName: 'Peru Time',
        },
      ],
    },
    {
      name: 'Philippines',
      isoCode: 'PH',
      flag: '🇵🇭',
      phonecode: '63',
      currency: 'PHP',
      latitude: '13.00000000',
      longitude: '122.00000000',
      timezones: [
        {
          zoneName: 'Asia/Manila',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'PHT',
          tzName: 'Philippine Time',
        },
      ],
    },
    {
      name: 'Pitcairn Island',
      isoCode: 'PN',
      flag: '🇵🇳',
      phonecode: '870',
      currency: 'NZD',
      latitude: '-25.06666666',
      longitude: '-130.10000000',
      timezones: [
        {
          zoneName: 'Pacific/Pitcairn',
          gmtOffset: -28800,
          gmtOffsetName: 'UTC-08:00',
          abbreviation: 'PST',
          tzName: 'Pacific Standard Time (North America',
        },
      ],
    },
    {
      name: 'Poland',
      isoCode: 'PL',
      flag: '🇵🇱',
      phonecode: '48',
      currency: 'PLN',
      latitude: '52.00000000',
      longitude: '20.00000000',
      timezones: [
        {
          zoneName: 'Europe/Warsaw',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Portugal',
      isoCode: 'PT',
      flag: '🇵🇹',
      phonecode: '351',
      currency: 'EUR',
      latitude: '39.50000000',
      longitude: '-8.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/Azores',
          gmtOffset: -3600,
          gmtOffsetName: 'UTC-01:00',
          abbreviation: 'AZOT',
          tzName: 'Azores Standard Time',
        },
        {
          zoneName: 'Atlantic/Madeira',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'WET',
          tzName: 'Western European Time',
        },
        {
          zoneName: 'Europe/Lisbon',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'WET',
          tzName: 'Western European Time',
        },
      ],
    },
    {
      name: 'Puerto Rico',
      isoCode: 'PR',
      flag: '🇵🇷',
      phonecode: '+1-787 and 1-939',
      currency: 'USD',
      latitude: '18.25000000',
      longitude: '-66.50000000',
      timezones: [
        {
          zoneName: 'America/Puerto_Rico',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Qatar',
      isoCode: 'QA',
      flag: '🇶🇦',
      phonecode: '974',
      currency: 'QAR',
      latitude: '25.50000000',
      longitude: '51.25000000',
      timezones: [
        {
          zoneName: 'Asia/Qatar',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Reunion',
      isoCode: 'RE',
      flag: '🇷🇪',
      phonecode: '262',
      currency: 'EUR',
      latitude: '-21.15000000',
      longitude: '55.50000000',
      timezones: [
        {
          zoneName: 'Indian/Reunion',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'RET',
          tzName: 'Réunion Time',
        },
      ],
    },
    {
      name: 'Romania',
      isoCode: 'RO',
      flag: '🇷🇴',
      phonecode: '40',
      currency: 'RON',
      latitude: '46.00000000',
      longitude: '25.00000000',
      timezones: [
        {
          zoneName: 'Europe/Bucharest',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Russia',
      isoCode: 'RU',
      flag: '🇷🇺',
      phonecode: '7',
      currency: 'RUB',
      latitude: '60.00000000',
      longitude: '100.00000000',
      timezones: [
        {
          zoneName: 'Asia/Anadyr',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'ANAT',
          tzName: 'Anadyr Time[4',
        },
        {
          zoneName: 'Asia/Barnaul',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'KRAT',
          tzName: 'Krasnoyarsk Time',
        },
        {
          zoneName: 'Asia/Chita',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'YAKT',
          tzName: 'Yakutsk Time',
        },
        {
          zoneName: 'Asia/Irkutsk',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'IRKT',
          tzName: 'Irkutsk Time',
        },
        {
          zoneName: 'Asia/Kamchatka',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'PETT',
          tzName: 'Kamchatka Time',
        },
        {
          zoneName: 'Asia/Khandyga',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'YAKT',
          tzName: 'Yakutsk Time',
        },
        {
          zoneName: 'Asia/Krasnoyarsk',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'KRAT',
          tzName: 'Krasnoyarsk Time',
        },
        {
          zoneName: 'Asia/Magadan',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'MAGT',
          tzName: 'Magadan Time',
        },
        {
          zoneName: 'Asia/Novokuznetsk',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'KRAT',
          tzName: 'Krasnoyarsk Time',
        },
        {
          zoneName: 'Asia/Novosibirsk',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'NOVT',
          tzName: 'Novosibirsk Time',
        },
        {
          zoneName: 'Asia/Omsk',
          gmtOffset: 21600,
          gmtOffsetName: 'UTC+06:00',
          abbreviation: 'OMST',
          tzName: 'Omsk Time',
        },
        {
          zoneName: 'Asia/Sakhalin',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'SAKT',
          tzName: 'Sakhalin Island Time',
        },
        {
          zoneName: 'Asia/Srednekolymsk',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'SRET',
          tzName: 'Srednekolymsk Time',
        },
        {
          zoneName: 'Asia/Tomsk',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'MSD+3',
          tzName: 'Moscow Daylight Time+3',
        },
        {
          zoneName: 'Asia/Ust-Nera',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'VLAT',
          tzName: 'Vladivostok Time',
        },
        {
          zoneName: 'Asia/Vladivostok',
          gmtOffset: 36000,
          gmtOffsetName: 'UTC+10:00',
          abbreviation: 'VLAT',
          tzName: 'Vladivostok Time',
        },
        {
          zoneName: 'Asia/Yakutsk',
          gmtOffset: 32400,
          gmtOffsetName: 'UTC+09:00',
          abbreviation: 'YAKT',
          tzName: 'Yakutsk Time',
        },
        {
          zoneName: 'Asia/Yekaterinburg',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'YEKT',
          tzName: 'Yekaterinburg Time',
        },
        {
          zoneName: 'Europe/Astrakhan',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'SAMT',
          tzName: 'Samara Time',
        },
        {
          zoneName: 'Europe/Kaliningrad',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
        {
          zoneName: 'Europe/Kirov',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'MSK',
          tzName: 'Moscow Time',
        },
        {
          zoneName: 'Europe/Moscow',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'MSK',
          tzName: 'Moscow Time',
        },
        {
          zoneName: 'Europe/Samara',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'SAMT',
          tzName: 'Samara Time',
        },
        {
          zoneName: 'Europe/Saratov',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'MSD',
          tzName: 'Moscow Daylight Time+4',
        },
        {
          zoneName: 'Europe/Ulyanovsk',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'SAMT',
          tzName: 'Samara Time',
        },
        {
          zoneName: 'Europe/Volgograd',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'MSK',
          tzName: 'Moscow Standard Time',
        },
      ],
    },
    {
      name: 'Rwanda',
      isoCode: 'RW',
      flag: '🇷🇼',
      phonecode: '250',
      currency: 'RWF',
      latitude: '-2.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Kigali',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Saint Helena',
      isoCode: 'SH',
      flag: '🇸🇭',
      phonecode: '290',
      currency: 'SHP',
      latitude: '-15.95000000',
      longitude: '-5.70000000',
      timezones: [
        {
          zoneName: 'Atlantic/St_Helena',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Saint Kitts And Nevis',
      isoCode: 'KN',
      flag: '🇰🇳',
      phonecode: '+1-869',
      currency: 'XCD',
      latitude: '17.33333333',
      longitude: '-62.75000000',
      timezones: [
        {
          zoneName: 'America/St_Kitts',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Saint Lucia',
      isoCode: 'LC',
      flag: '🇱🇨',
      phonecode: '+1-758',
      currency: 'XCD',
      latitude: '13.88333333',
      longitude: '-60.96666666',
      timezones: [
        {
          zoneName: 'America/St_Lucia',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Saint Pierre and Miquelon',
      isoCode: 'PM',
      flag: '🇵🇲',
      phonecode: '508',
      currency: 'EUR',
      latitude: '46.83333333',
      longitude: '-56.33333333',
      timezones: [
        {
          zoneName: 'America/Miquelon',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'PMDT',
          tzName: 'Pierre & Miquelon Daylight Time',
        },
      ],
    },
    {
      name: 'Saint Vincent And The Grenadines',
      isoCode: 'VC',
      flag: '🇻🇨',
      phonecode: '+1-784',
      currency: 'XCD',
      latitude: '13.25000000',
      longitude: '-61.20000000',
      timezones: [
        {
          zoneName: 'America/St_Vincent',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Saint-Barthelemy',
      isoCode: 'BL',
      flag: '🇧🇱',
      phonecode: '590',
      currency: 'EUR',
      latitude: '18.50000000',
      longitude: '-63.41666666',
      timezones: [
        {
          zoneName: 'America/St_Barthelemy',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Saint-Martin (French part)',
      isoCode: 'MF',
      flag: '🇲🇫',
      phonecode: '590',
      currency: 'EUR',
      latitude: '18.08333333',
      longitude: '-63.95000000',
      timezones: [
        {
          zoneName: 'America/Marigot',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Samoa',
      isoCode: 'WS',
      flag: '🇼🇸',
      phonecode: '685',
      currency: 'WST',
      latitude: '-13.58333333',
      longitude: '-172.33333333',
      timezones: [
        {
          zoneName: 'Pacific/Apia',
          gmtOffset: 50400,
          gmtOffsetName: 'UTC+14:00',
          abbreviation: 'WST',
          tzName: 'West Samoa Time',
        },
      ],
    },
    {
      name: 'San Marino',
      isoCode: 'SM',
      flag: '🇸🇲',
      phonecode: '378',
      currency: 'EUR',
      latitude: '43.76666666',
      longitude: '12.41666666',
      timezones: [
        {
          zoneName: 'Europe/San_Marino',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Sao Tome and Principe',
      isoCode: 'ST',
      flag: '🇸🇹',
      phonecode: '239',
      currency: 'STD',
      latitude: '1.00000000',
      longitude: '7.00000000',
      timezones: [
        {
          zoneName: 'Africa/Sao_Tome',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Saudi Arabia',
      isoCode: 'SA',
      flag: '🇸🇦',
      phonecode: '966',
      currency: 'SAR',
      latitude: '25.00000000',
      longitude: '45.00000000',
      timezones: [
        {
          zoneName: 'Asia/Riyadh',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Senegal',
      isoCode: 'SN',
      flag: '🇸🇳',
      phonecode: '221',
      currency: 'XOF',
      latitude: '14.00000000',
      longitude: '-14.00000000',
      timezones: [
        {
          zoneName: 'Africa/Dakar',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Serbia',
      isoCode: 'RS',
      flag: '🇷🇸',
      phonecode: '381',
      currency: 'RSD',
      latitude: '44.00000000',
      longitude: '21.00000000',
      timezones: [
        {
          zoneName: 'Europe/Belgrade',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Seychelles',
      isoCode: 'SC',
      flag: '🇸🇨',
      phonecode: '248',
      currency: 'SCR',
      latitude: '-4.58333333',
      longitude: '55.66666666',
      timezones: [
        {
          zoneName: 'Indian/Mahe',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'SCT',
          tzName: 'Seychelles Time',
        },
      ],
    },
    {
      name: 'Sierra Leone',
      isoCode: 'SL',
      flag: '🇸🇱',
      phonecode: '232',
      currency: 'SLL',
      latitude: '8.50000000',
      longitude: '-11.50000000',
      timezones: [
        {
          zoneName: 'Africa/Freetown',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Singapore',
      isoCode: 'SG',
      flag: '🇸🇬',
      phonecode: '65',
      currency: 'SGD',
      latitude: '1.36666666',
      longitude: '103.80000000',
      timezones: [
        {
          zoneName: 'Asia/Singapore',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'SGT',
          tzName: 'Singapore Time',
        },
      ],
    },
    {
      name: 'Slovakia',
      isoCode: 'SK',
      flag: '🇸🇰',
      phonecode: '421',
      currency: 'EUR',
      latitude: '48.66666666',
      longitude: '19.50000000',
      timezones: [
        {
          zoneName: 'Europe/Bratislava',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Slovenia',
      isoCode: 'SI',
      flag: '🇸🇮',
      phonecode: '386',
      currency: 'EUR',
      latitude: '46.11666666',
      longitude: '14.81666666',
      timezones: [
        {
          zoneName: 'Europe/Ljubljana',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Solomon Islands',
      isoCode: 'SB',
      flag: '🇸🇧',
      phonecode: '677',
      currency: 'SBD',
      latitude: '-8.00000000',
      longitude: '159.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Guadalcanal',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'SBT',
          tzName: 'Solomon Islands Time',
        },
      ],
    },
    {
      name: 'Somalia',
      isoCode: 'SO',
      flag: '🇸🇴',
      phonecode: '252',
      currency: 'SOS',
      latitude: '10.00000000',
      longitude: '49.00000000',
      timezones: [
        {
          zoneName: 'Africa/Mogadishu',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'South Africa',
      isoCode: 'ZA',
      flag: '🇿🇦',
      phonecode: '27',
      currency: 'ZAR',
      latitude: '-29.00000000',
      longitude: '24.00000000',
      timezones: [
        {
          zoneName: 'Africa/Johannesburg',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'SAST',
          tzName: 'South African Standard Time',
        },
      ],
    },
    {
      name: 'South Georgia',
      isoCode: 'GS',
      flag: '🇬🇸',
      phonecode: '500',
      currency: 'GBP',
      latitude: '-54.50000000',
      longitude: '-37.00000000',
      timezones: [
        {
          zoneName: 'Atlantic/South_Georgia',
          gmtOffset: -7200,
          gmtOffsetName: 'UTC-02:00',
          abbreviation: 'GST',
          tzName: 'South Georgia and the South Sandwich Islands Time',
        },
      ],
    },
    {
      name: 'South Sudan',
      isoCode: 'SS',
      flag: '🇸🇸',
      phonecode: '211',
      currency: 'SSP',
      latitude: '7.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Juba',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Spain',
      isoCode: 'ES',
      flag: '🇪🇸',
      phonecode: '34',
      currency: 'EUR',
      latitude: '40.00000000',
      longitude: '-4.00000000',
      timezones: [
        {
          zoneName: 'Africa/Ceuta',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
        {
          zoneName: 'Atlantic/Canary',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'WET',
          tzName: 'Western European Time',
        },
        {
          zoneName: 'Europe/Madrid',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Sri Lanka',
      isoCode: 'LK',
      flag: '🇱🇰',
      phonecode: '94',
      currency: 'LKR',
      latitude: '7.00000000',
      longitude: '81.00000000',
      timezones: [
        {
          zoneName: 'Asia/Colombo',
          gmtOffset: 19800,
          gmtOffsetName: 'UTC+05:30',
          abbreviation: 'IST',
          tzName: 'Indian Standard Time',
        },
      ],
    },
    {
      name: 'Sudan',
      isoCode: 'SD',
      flag: '🇸🇩',
      phonecode: '249',
      currency: 'SDG',
      latitude: '15.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Khartoum',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EAT',
          tzName: 'Eastern African Time',
        },
      ],
    },
    {
      name: 'Suriname',
      isoCode: 'SR',
      flag: '🇸🇷',
      phonecode: '597',
      currency: 'SRD',
      latitude: '4.00000000',
      longitude: '-56.00000000',
      timezones: [
        {
          zoneName: 'America/Paramaribo',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'SRT',
          tzName: 'Suriname Time',
        },
      ],
    },
    {
      name: 'Svalbard And Jan Mayen Islands',
      isoCode: 'SJ',
      flag: '🇸🇯',
      phonecode: '47',
      currency: 'NOK',
      latitude: '78.00000000',
      longitude: '20.00000000',
      timezones: [
        {
          zoneName: 'Arctic/Longyearbyen',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Swaziland',
      isoCode: 'SZ',
      flag: '🇸🇿',
      phonecode: '268',
      currency: 'SZL',
      latitude: '-26.50000000',
      longitude: '31.50000000',
      timezones: [
        {
          zoneName: 'Africa/Mbabane',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'SAST',
          tzName: 'South African Standard Time',
        },
      ],
    },
    {
      name: 'Sweden',
      isoCode: 'SE',
      flag: '🇸🇪',
      phonecode: '46',
      currency: 'SEK',
      latitude: '62.00000000',
      longitude: '15.00000000',
      timezones: [
        {
          zoneName: 'Europe/Stockholm',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Switzerland',
      isoCode: 'CH',
      flag: '🇨🇭',
      phonecode: '41',
      currency: 'CHF',
      latitude: '47.00000000',
      longitude: '8.00000000',
      timezones: [
        {
          zoneName: 'Europe/Zurich',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Syria',
      isoCode: 'SY',
      flag: '🇸🇾',
      phonecode: '963',
      currency: 'SYP',
      latitude: '35.00000000',
      longitude: '38.00000000',
      timezones: [
        {
          zoneName: 'Asia/Damascus',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Taiwan',
      isoCode: 'TW',
      flag: '🇹🇼',
      phonecode: '886',
      currency: 'TWD',
      latitude: '23.50000000',
      longitude: '121.00000000',
      timezones: [
        {
          zoneName: 'Asia/Taipei',
          gmtOffset: 28800,
          gmtOffsetName: 'UTC+08:00',
          abbreviation: 'CST',
          tzName: 'China Standard Time',
        },
      ],
    },
    {
      name: 'Tajikistan',
      isoCode: 'TJ',
      flag: '🇹🇯',
      phonecode: '992',
      currency: 'TJS',
      latitude: '39.00000000',
      longitude: '71.00000000',
      timezones: [
        {
          zoneName: 'Asia/Dushanbe',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'TJT',
          tzName: 'Tajikistan Time',
        },
      ],
    },
    {
      name: 'Tanzania',
      isoCode: 'TZ',
      flag: '🇹🇿',
      phonecode: '255',
      currency: 'TZS',
      latitude: '-6.00000000',
      longitude: '35.00000000',
      timezones: [
        {
          zoneName: 'Africa/Dar_es_Salaam',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Thailand',
      isoCode: 'TH',
      flag: '🇹🇭',
      phonecode: '66',
      currency: 'THB',
      latitude: '15.00000000',
      longitude: '100.00000000',
      timezones: [
        {
          zoneName: 'Asia/Bangkok',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'ICT',
          tzName: 'Indochina Time',
        },
      ],
    },
    {
      name: 'Togo',
      isoCode: 'TG',
      flag: '🇹🇬',
      phonecode: '228',
      currency: 'XOF',
      latitude: '8.00000000',
      longitude: '1.16666666',
      timezones: [
        {
          zoneName: 'Africa/Lome',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'Tokelau',
      isoCode: 'TK',
      flag: '🇹🇰',
      phonecode: '690',
      currency: 'NZD',
      latitude: '-9.00000000',
      longitude: '-172.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Fakaofo',
          gmtOffset: 46800,
          gmtOffsetName: 'UTC+13:00',
          abbreviation: 'TKT',
          tzName: 'Tokelau Time',
        },
      ],
    },
    {
      name: 'Tonga',
      isoCode: 'TO',
      flag: '🇹🇴',
      phonecode: '676',
      currency: 'TOP',
      latitude: '-20.00000000',
      longitude: '-175.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Tongatapu',
          gmtOffset: 46800,
          gmtOffsetName: 'UTC+13:00',
          abbreviation: 'TOT',
          tzName: 'Tonga Time',
        },
      ],
    },
    {
      name: 'Trinidad And Tobago',
      isoCode: 'TT',
      flag: '🇹🇹',
      phonecode: '+1-868',
      currency: 'TTD',
      latitude: '11.00000000',
      longitude: '-61.00000000',
      timezones: [
        {
          zoneName: 'America/Port_of_Spain',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Tunisia',
      isoCode: 'TN',
      flag: '🇹🇳',
      phonecode: '216',
      currency: 'TND',
      latitude: '34.00000000',
      longitude: '9.00000000',
      timezones: [
        {
          zoneName: 'Africa/Tunis',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Turkey',
      isoCode: 'TR',
      flag: '🇹🇷',
      phonecode: '90',
      currency: 'TRY',
      latitude: '39.00000000',
      longitude: '35.00000000',
      timezones: [
        {
          zoneName: 'Europe/Istanbul',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'Turkmenistan',
      isoCode: 'TM',
      flag: '🇹🇲',
      phonecode: '993',
      currency: 'TMT',
      latitude: '40.00000000',
      longitude: '60.00000000',
      timezones: [
        {
          zoneName: 'Asia/Ashgabat',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'TMT',
          tzName: 'Turkmenistan Time',
        },
      ],
    },
    {
      name: 'Turks And Caicos Islands',
      isoCode: 'TC',
      flag: '🇹🇨',
      phonecode: '+1-649',
      currency: 'USD',
      latitude: '21.75000000',
      longitude: '-71.58333333',
      timezones: [
        {
          zoneName: 'America/Grand_Turk',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
      ],
    },
    {
      name: 'Tuvalu',
      isoCode: 'TV',
      flag: '🇹🇻',
      phonecode: '688',
      currency: 'AUD',
      latitude: '-8.00000000',
      longitude: '178.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Funafuti',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'TVT',
          tzName: 'Tuvalu Time',
        },
      ],
    },
    {
      name: 'Uganda',
      isoCode: 'UG',
      flag: '🇺🇬',
      phonecode: '256',
      currency: 'UGX',
      latitude: '1.00000000',
      longitude: '32.00000000',
      timezones: [
        {
          zoneName: 'Africa/Kampala',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'EAT',
          tzName: 'East Africa Time',
        },
      ],
    },
    {
      name: 'Ukraine',
      isoCode: 'UA',
      flag: '🇺🇦',
      phonecode: '380',
      currency: 'UAH',
      latitude: '49.00000000',
      longitude: '32.00000000',
      timezones: [
        {
          zoneName: 'Europe/Kiev',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
        {
          zoneName: 'Europe/Simferopol',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'MSK',
          tzName: 'Moscow Time',
        },
        {
          zoneName: 'Europe/Uzhgorod',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
        {
          zoneName: 'Europe/Zaporozhye',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'EET',
          tzName: 'Eastern European Time',
        },
      ],
    },
    {
      name: 'United Arab Emirates',
      isoCode: 'AE',
      flag: '🇦🇪',
      phonecode: '971',
      currency: 'AED',
      latitude: '24.00000000',
      longitude: '54.00000000',
      timezones: [
        {
          zoneName: 'Asia/Dubai',
          gmtOffset: 14400,
          gmtOffsetName: 'UTC+04:00',
          abbreviation: 'GST',
          tzName: 'Gulf Standard Time',
        },
      ],
    },
    {
      name: 'United Kingdom',
      isoCode: 'GB',
      flag: '🇬🇧',
      phonecode: '44',
      currency: 'GBP',
      latitude: '54.00000000',
      longitude: '-2.00000000',
      timezones: [
        {
          zoneName: 'Europe/London',
          gmtOffset: 0,
          gmtOffsetName: 'UTC±00',
          abbreviation: 'GMT',
          tzName: 'Greenwich Mean Time',
        },
      ],
    },
    {
      name: 'United States',
      isoCode: 'US',
      flag: '🇺🇸',
      phonecode: '1',
      currency: 'USD',
      latitude: '38.00000000',
      longitude: '-97.00000000',
      timezones: [
        {
          zoneName: 'America/Adak',
          gmtOffset: -36000,
          gmtOffsetName: 'UTC-10:00',
          abbreviation: 'HST',
          tzName: 'Hawaii–Aleutian Standard Time',
        },
        {
          zoneName: 'America/Anchorage',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'America/Boise',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Chicago',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Denver',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Detroit',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Indianapolis',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Knox',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Marengo',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Petersburg',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Tell_City',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Vevay',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Vincennes',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Indiana/Winamac',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Juneau',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'America/Kentucky/Louisville',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Kentucky/Monticello',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Los_Angeles',
          gmtOffset: -28800,
          gmtOffsetName: 'UTC-08:00',
          abbreviation: 'PST',
          tzName: 'Pacific Standard Time (North America',
        },
        {
          zoneName: 'America/Menominee',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Metlakatla',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'America/New_York',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
          abbreviation: 'EST',
          tzName: 'Eastern Standard Time (North America',
        },
        {
          zoneName: 'America/Nome',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'America/North_Dakota/Beulah',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/North_Dakota/Center',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/North_Dakota/New_Salem',
          gmtOffset: -21600,
          gmtOffsetName: 'UTC-06:00',
          abbreviation: 'CST',
          tzName: 'Central Standard Time (North America',
        },
        {
          zoneName: 'America/Phoenix',
          gmtOffset: -25200,
          gmtOffsetName: 'UTC-07:00',
          abbreviation: 'MST',
          tzName: 'Mountain Standard Time (North America',
        },
        {
          zoneName: 'America/Sitka',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'America/Yakutat',
          gmtOffset: -32400,
          gmtOffsetName: 'UTC-09:00',
          abbreviation: 'AKST',
          tzName: 'Alaska Standard Time',
        },
        {
          zoneName: 'Pacific/Honolulu',
          gmtOffset: -36000,
          gmtOffsetName: 'UTC-10:00',
          abbreviation: 'HST',
          tzName: 'Hawaii–Aleutian Standard Time',
        },
      ],
    },
    {
      name: 'United States Minor Outlying Islands',
      isoCode: 'UM',
      flag: '🇺🇲',
      phonecode: '1',
      currency: 'USD',
      latitude: '0.00000000',
      longitude: '0.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Midway',
          gmtOffset: -39600,
          gmtOffsetName: 'UTC-11:00',
          abbreviation: 'SST',
          tzName: 'Samoa Standard Time',
        },
        {
          zoneName: 'Pacific/Wake',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'WAKT',
          tzName: 'Wake Island Time',
        },
      ],
    },
    {
      name: 'Uruguay',
      isoCode: 'UY',
      flag: '🇺🇾',
      phonecode: '598',
      currency: 'UYU',
      latitude: '-33.00000000',
      longitude: '-56.00000000',
      timezones: [
        {
          zoneName: 'America/Montevideo',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
          abbreviation: 'UYT',
          tzName: 'Uruguay Standard Time',
        },
      ],
    },
    {
      name: 'Uzbekistan',
      isoCode: 'UZ',
      flag: '🇺🇿',
      phonecode: '998',
      currency: 'UZS',
      latitude: '41.00000000',
      longitude: '64.00000000',
      timezones: [
        {
          zoneName: 'Asia/Samarkand',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'UZT',
          tzName: 'Uzbekistan Time',
        },
        {
          zoneName: 'Asia/Tashkent',
          gmtOffset: 18000,
          gmtOffsetName: 'UTC+05:00',
          abbreviation: 'UZT',
          tzName: 'Uzbekistan Time',
        },
      ],
    },
    {
      name: 'Vanuatu',
      isoCode: 'VU',
      flag: '🇻🇺',
      phonecode: '678',
      currency: 'VUV',
      latitude: '-16.00000000',
      longitude: '167.00000000',
      timezones: [
        {
          zoneName: 'Pacific/Efate',
          gmtOffset: 39600,
          gmtOffsetName: 'UTC+11:00',
          abbreviation: 'VUT',
          tzName: 'Vanuatu Time',
        },
      ],
    },
    {
      name: 'Vatican City State (Holy See)',
      isoCode: 'VA',
      flag: '🇻🇦',
      phonecode: '379',
      currency: 'EUR',
      latitude: '41.90000000',
      longitude: '12.45000000',
      timezones: [
        {
          zoneName: 'Europe/Vatican',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Venezuela',
      isoCode: 'VE',
      flag: '🇻🇪',
      phonecode: '58',
      currency: 'VEF',
      latitude: '8.00000000',
      longitude: '-66.00000000',
      timezones: [
        {
          zoneName: 'America/Caracas',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'VET',
          tzName: 'Venezuelan Standard Time',
        },
      ],
    },
    {
      name: 'Vietnam',
      isoCode: 'VN',
      flag: '🇻🇳',
      phonecode: '84',
      currency: 'VND',
      latitude: '16.16666666',
      longitude: '107.83333333',
      timezones: [
        {
          zoneName: 'Asia/Ho_Chi_Minh',
          gmtOffset: 25200,
          gmtOffsetName: 'UTC+07:00',
          abbreviation: 'ICT',
          tzName: 'Indochina Time',
        },
      ],
    },
    {
      name: 'Virgin Islands (British)',
      isoCode: 'VG',
      flag: '🇻🇬',
      phonecode: '+1-284',
      currency: 'USD',
      latitude: '18.43138300',
      longitude: '-64.62305000',
      timezones: [
        {
          zoneName: 'America/Tortola',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Virgin Islands (US)',
      isoCode: 'VI',
      flag: '🇻🇮',
      phonecode: '+1-340',
      currency: 'USD',
      latitude: '18.34000000',
      longitude: '-64.93000000',
      timezones: [
        {
          zoneName: 'America/St_Thomas',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Wallis And Futuna Islands',
      isoCode: 'WF',
      flag: '🇼🇫',
      phonecode: '681',
      currency: 'XPF',
      latitude: '-13.30000000',
      longitude: '-176.20000000',
      timezones: [
        {
          zoneName: 'Pacific/Wallis',
          gmtOffset: 43200,
          gmtOffsetName: 'UTC+12:00',
          abbreviation: 'WFT',
          tzName: 'Wallis & Futuna Time',
        },
      ],
    },
    {
      name: 'Western Sahara',
      isoCode: 'EH',
      flag: '🇪🇭',
      phonecode: '212',
      currency: 'MAD',
      latitude: '24.50000000',
      longitude: '-13.00000000',
      timezones: [
        {
          zoneName: 'Africa/El_Aaiun',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'WEST',
          tzName: 'Western European Summer Time',
        },
      ],
    },
    {
      name: 'Yemen',
      isoCode: 'YE',
      flag: '🇾🇪',
      phonecode: '967',
      currency: 'YER',
      latitude: '15.00000000',
      longitude: '48.00000000',
      timezones: [
        {
          zoneName: 'Asia/Aden',
          gmtOffset: 10800,
          gmtOffsetName: 'UTC+03:00',
          abbreviation: 'AST',
          tzName: 'Arabia Standard Time',
        },
      ],
    },
    {
      name: 'Zambia',
      isoCode: 'ZM',
      flag: '🇿🇲',
      phonecode: '260',
      currency: 'ZMW',
      latitude: '-15.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Lusaka',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Zimbabwe',
      isoCode: 'ZW',
      flag: '🇿🇼',
      phonecode: '263',
      currency: 'ZWL',
      latitude: '-20.00000000',
      longitude: '30.00000000',
      timezones: [
        {
          zoneName: 'Africa/Harare',
          gmtOffset: 7200,
          gmtOffsetName: 'UTC+02:00',
          abbreviation: 'CAT',
          tzName: 'Central Africa Time',
        },
      ],
    },
    {
      name: 'Kosovo',
      isoCode: 'XK',
      flag: '🇽🇰',
      phonecode: '383',
      currency: 'EUR',
      latitude: '42.56129090',
      longitude: '20.34030350',
      timezones: [
        {
          zoneName: 'Europe/Belgrade',
          gmtOffset: 3600,
          gmtOffsetName: 'UTC+01:00',
          abbreviation: 'CET',
          tzName: 'Central European Time',
        },
      ],
    },
    {
      name: 'Curaçao',
      isoCode: 'CW',
      flag: '🇨🇼',
      phonecode: '599',
      currency: 'ANG',
      latitude: '12.11666700',
      longitude: '-68.93333300',
      timezones: [
        {
          zoneName: 'America/Curacao',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },
    {
      name: 'Sint Maarten (Dutch part)',
      isoCode: 'SX',
      flag: '🇸🇽',
      phonecode: '1721',
      currency: 'ANG',
      latitude: '18.03333300',
      longitude: '-63.05000000',
      timezones: [
        {
          zoneName: 'America/Anguilla',
          gmtOffset: -14400,
          gmtOffsetName: 'UTC-04:00',
          abbreviation: 'AST',
          tzName: 'Atlantic Standard Time',
        },
      ],
    },

    {
      name: 'Andaman and Nicobar Islands',
      isoCode: 'AN',
      countryCode: 'IN',
      latitude: '11.74008670',
      longitude: '92.65864010',
    },
    {
      name: 'Andhra Pradesh',
      isoCode: 'AP',
      countryCode: 'IN',
      latitude: '15.91289980',
      longitude: '79.73998750',
    },
    {
      name: 'Arunachal Pradesh',
      isoCode: 'AR',
      countryCode: 'IN',
      latitude: '28.21799940',
      longitude: '94.72775280',
    },
    {
      name: 'Assam',
      isoCode: 'AS',
      countryCode: 'IN',
      latitude: '26.20060430',
      longitude: '92.93757390',
    },
    {
      name: 'Bihar',
      isoCode: 'BR',
      countryCode: 'IN',
      latitude: '25.09607420',
      longitude: '85.31311940',
    },
    {
      name: 'Chandigarh',
      isoCode: 'CH',
      countryCode: 'IN',
      latitude: '30.73331480',
      longitude: '76.77941790',
    },
    {
      name: 'Chhattisgarh',
      isoCode: 'CT',
      countryCode: 'IN',
      latitude: '21.27865670',
      longitude: '81.86614420',
    },
    {
      name: 'Dadra and Nagar Haveli and Daman and Diu',
      isoCode: 'DH',
      countryCode: 'IN',
      latitude: '20.39737360',
      longitude: '72.83279910',
    },
    {
      name: 'Delhi',
      isoCode: 'DL',
      countryCode: 'IN',
      latitude: '28.70405920',
      longitude: '77.10249020',
    },
    {
      name: 'Goa',
      isoCode: 'GA',
      countryCode: 'IN',
      latitude: '15.29932650',
      longitude: '74.12399600',
    },
    {
      name: 'Gujarat',
      isoCode: 'GJ',
      countryCode: 'IN',
      latitude: '22.25865200',
      longitude: '71.19238050',
    },
    {
      name: 'Haryana',
      isoCode: 'HR',
      countryCode: 'IN',
      latitude: '29.05877570',
      longitude: '76.08560100',
    },
    {
      name: 'Himachal Pradesh',
      isoCode: 'HP',
      countryCode: 'IN',
      latitude: '31.10482940',
      longitude: '77.17339010',
    },
    {
      name: 'Jammu and Kashmir',
      isoCode: 'JK',
      countryCode: 'IN',
      latitude: '33.27783900',
      longitude: '75.34121790',
    },
    {
      name: 'Jharkhand',
      isoCode: 'JH',
      countryCode: 'IN',
      latitude: '23.61018080',
      longitude: '85.27993540',
    },
    {
      name: 'Karnataka',
      isoCode: 'KA',
      countryCode: 'IN',
      latitude: '15.31727750',
      longitude: '75.71388840',
    },
    {
      name: 'Kerala',
      isoCode: 'KL',
      countryCode: 'IN',
      latitude: '10.85051590',
      longitude: '76.27108330',
    },
    {
      name: 'Ladakh',
      isoCode: 'LA',
      countryCode: 'IN',
      latitude: '34.22684750',
      longitude: '77.56194190',
    },
    {
      name: 'Lakshadweep',
      isoCode: 'LD',
      countryCode: 'IN',
      latitude: '10.32802650',
      longitude: '72.78463360',
    },
    {
      name: 'Madhya Pradesh',
      isoCode: 'MP',
      countryCode: 'IN',
      latitude: '22.97342290',
      longitude: '78.65689420',
    },
    {
      name: 'Maharashtra',
      isoCode: 'MH',
      countryCode: 'IN',
      latitude: '19.75147980',
      longitude: '75.71388840',
    },
    {
      name: 'Manipur',
      isoCode: 'MN',
      countryCode: 'IN',
      latitude: '24.66371730',
      longitude: '93.90626880',
    },
    {
      name: 'Meghalaya',
      isoCode: 'ML',
      countryCode: 'IN',
      latitude: '25.46703080',
      longitude: '91.36621600',
    },
    {
      name: 'Mizoram',
      isoCode: 'MZ',
      countryCode: 'IN',
      latitude: '23.16454300',
      longitude: '92.93757390',
    },
    {
      name: 'Nagaland',
      isoCode: 'NL',
      countryCode: 'IN',
      latitude: '26.15843540',
      longitude: '94.56244260',
    },
    {
      name: 'Odisha',
      isoCode: 'OR',
      countryCode: 'IN',
      latitude: '20.95166580',
      longitude: '85.09852360',
    },
    {
      name: 'Puducherry',
      isoCode: 'PY',
      countryCode: 'IN',
      latitude: '11.94159150',
      longitude: '79.80831330',
    },
    {
      name: 'Punjab',
      isoCode: 'PB',
      countryCode: 'IN',
      latitude: '31.14713050',
      longitude: '75.34121790',
    },
    {
      name: 'Rajasthan',
      isoCode: 'RJ',
      countryCode: 'IN',
      latitude: '27.02380360',
      longitude: '74.21793260',
    },
    {
      name: 'Sikkim',
      isoCode: 'SK',
      countryCode: 'IN',
      latitude: '27.53297180',
      longitude: '88.51221780',
    },
    {
      name: 'Tamil Nadu',
      isoCode: 'TN',
      countryCode: 'IN',
      latitude: '11.12712250',
      longitude: '78.65689420',
    },
    {
      name: 'Telangana',
      isoCode: 'TG',
      countryCode: 'IN',
      latitude: '18.11243720',
      longitude: '79.01929970',
    },
    {
      name: 'Tripura',
      isoCode: 'TR',
      countryCode: 'IN',
      latitude: '23.94084820',
      longitude: '91.98815270',
    },
    {
      name: 'Uttar Pradesh',
      isoCode: 'UP',
      countryCode: 'IN',
      latitude: '26.84670880',
      longitude: '80.94615920',
    },
    {
      name: 'Uttarakhand',
      isoCode: 'UT',
      countryCode: 'IN',
      latitude: '30.06675300',
      longitude: '79.01929970',
    },
    {
      name: 'West Bengal',
      isoCode: 'WB',
      countryCode: 'IN',
      latitude: '22.98675690',
      longitude: '87.85497550',
    },
  ];

  listOfLocations = this.masterListOfLocations;

  // Handling geoLocation filter
  handleGeoLocationFilter(event: any) {
    // var searchInput = event.target.value;
    // this.listOfLocations = this.masterListOfLocations;
    // this.listOfLocations = this.listOfLocations.filter((location: any) => {
    //   return location.name.toLowerCase().includes(searchInput.toLowerCase());
    // });
  }

  // handling Multiple Geolocation Selection
  handleGeoLocationSelect(event: any) {
    var selectedLocation: string = event.option.value;

    // restricting Geolocation add if it already exits OR exits in excluded location
    if (
      this.campaignModel.excludedGeolocations.includes(selectedLocation) ||
      this.campaignModel.geoLocations.includes(selectedLocation)
    ) {
      return;
    }
    this.campaignModel.geoLocations.push(selectedLocation);
  }

  // handling Multiple Excluded Geolocation Selection
  handleExcludedGeoLocationSelect(event: any) {
    var selectedLocation: string = event.option.value;

    // restricting to ExcludeGeolocation if it already exits OR exits in included location
    if (
      this.campaignModel.excludedGeolocations.includes(selectedLocation) ||
      this.campaignModel.geoLocations.includes(selectedLocation)
    ) {
      return;
    }
    this.campaignModel.excludedGeolocations.push(selectedLocation);
  }

  // handles GeoLocation Remove from geoLocation Box
  handlGeolocationRemove(removeGeolocationEvent: any): void {
    const nameOfLocationToRemoved = removeGeolocationEvent.chip._value;

    const indexOfLocationToBeRemoved = this.campaignModel.geoLocations.indexOf(
      nameOfLocationToRemoved
    );
    if (indexOfLocationToBeRemoved >= 0) {
      this.campaignModel.geoLocations.splice(indexOfLocationToBeRemoved, 1);
    }
  }

  // handles Excluded GeoLocation Remove from excludedGeolocations Box
  handlExcludedGeolocationRemove(removeGeolocationEvent: any): void {
    const nameOfLocationToRemoved = removeGeolocationEvent.chip._value;

    const indexOfLocationToBeRemoved =
      this.campaignModel.excludedGeolocations.indexOf(nameOfLocationToRemoved);
    if (indexOfLocationToBeRemoved >= 0) {
      this.campaignModel.excludedGeolocations.splice(
        indexOfLocationToBeRemoved,
        1
      );
    }
  }
}
