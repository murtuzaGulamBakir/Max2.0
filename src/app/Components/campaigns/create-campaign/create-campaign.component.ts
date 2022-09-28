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

        // this.http
        //   .get(
        //     'https://localhost:44318/api/geolocations/?location=' +
        //       searchedText,
        //     {
        //       params: new HttpParams({
        //         fromObject: {
        //           action: 'opensearch',
        //           format: 'json',
        //           origin: '*',
        //         },
        //       }).set('search', searchedText),
        //     }
        //   )
        //   .subscribe((res) => {
        //     console.log(res);
        //   });
      });
  }
  // ********************** Campaign Devices Start
  formObjForDevice = new FormControl('');

  devicesNames: string[] = ['1', '2', '3', '4'];

  // Initializing Campaign Form Object Model
  campaignModel = new CampaignModel(
    '',
    '',
    '',
    0,
    0,
    [],
    [],
    this.devicesNames,
    '',
    [],
    [],
    [],
    []
  );

  validationObject: any = {
    campaignName: {
      isInvalid: false,
      message: '',
    },

    campaignStartDate: {
      isInvalid: false,
      message: '',
    },
    campaignEndDate: {
      isInvalid: false,
      message: '',
    },

    campaignDailyBudget: {
      isInvalid: false,
      message: '',
    },
    campaignOverallBudget: {
      isInvalid: false,
      message: '',
    },
    campaignBudgetPacing: {
      isInvalid: false,
      message: '',
    },

    campaignDomains: {
      isInvalid: false,
      message: '',
    },
    campaignExcludedDomains: {
      isInvalid: false,
      message: '',
    },
    campaignIncludeDomainFile: {
      isInvalid: false,
      message: '',
    },

    campaignExcludeDomainFile: {
      isInvalid: false,
      message: '',
    },

    campaignListOfDevices: {
      isInvalid: false,
      message: '',
    },

    campaignAdScheduling: {
      isInvalid: false,
      message: '',
    },

    campaignInludedGeolocation: {
      isInvalid: false,
      message: '',
    },
  };

  // error Objects
  // Handling CSV Upload and Reading Data
  csvInputChange(fileInputEvent: any, domainType: string) {
    // unsetting previuos message
    this.setValidationMessage(
      false,
      '',
      domainType == 'INCLUDEDDOMAINS'
        ? 'campaignDomains'
        : 'campaignExcludedDomains'
    );
    this.setValidationMessage(
      false,
      '',
      domainType == 'INCLUDEDDOMAINS'
        ? 'campaignIncludeDomainFile'
        : 'campaignExcludeDomainFile'
    );
    var uploadedFile: any = fileInputEvent.target.files[0];
    var fileName = uploadedFile.name;

    // Validatig File Extension
    var fileExtension =
      fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) ||
      fileName;

    //  Stop If File is Invalid
    if (fileExtension.toLowerCase() != 'csv') {
      this.setValidationMessage(
        true,
        'File Type not supported',
        domainType == 'INCLUDEDDOMAINS'
          ? 'campaignDomains'
          : 'campaignExcludedDomains'
      );
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
          this.campaignModel.domains.includes(value) &&
          domainType == 'EXCLUDEDDOMAINS'
        ) {
          this.setValidationMessage(
            true,
            `Domain ${value} is already added in Included Domains !!`,
            'campaignExcludedDomains'
          );
          return;
        }

        if (
          this.campaignModel.excludedDomains.includes(value) &&
          domainType == 'INCLUDEDDOMAINS'
        ) {
          this.setValidationMessage(
            true,
            `Domain ${value} is already added in Excluded Domains !!`,
            'campaignDomains'
          );
          return;
        }

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

      this.setValidationMessage(
        true,
        'File Uploaded SuccessFully...',
        domainType == 'INCLUDEDDOMAINS'
          ? 'campaignIncludeDomainFile'
          : 'campaignExcludeDomainFile'
      );
    }, 200);
  }
  // ************************* Domain Field Setup Code Start
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  add(event: MatChipInputEvent): void {
    // unsetting previuos message
    this.setValidationMessage(false, '', 'campaignDomains');
    this.setValidationMessage(false, '', 'campaignIncludeDomainFile');
    const value = (event.value || '').trim();

    // Regular Expression Domain Validation
    var regexForDomainvalidation =
      '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$';

    var regexpObj = new RegExp(regexForDomainvalidation);

    // if regexp return false then domain is invalid so stop function execution
    if (!regexpObj.test(value)) {
      this.setValidationMessage(true, `Invalid Domain !!`, 'campaignDomains');
      return;
    }
    // check if domain already exist in included or excluded domains
    if (this.campaignModel.domains.includes(value)) {
      this.setValidationMessage(true, `Already Included !!`, 'campaignDomains');
      return;
    }
    if (this.campaignModel.excludedDomains.includes(value)) {
      this.setValidationMessage(
        true,
        `Domain ${value} is already added in Excluded Domains !!`,
        'campaignDomains'
      );
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
    // unsetting previuos message
    this.setValidationMessage(false, '', 'campaignExcludedDomains');
    this.setValidationMessage(false, '', 'campaignExcludeDomainFile');
    const value = (event.value || '').trim();

    // Regular Expression Domain Validation
    var regexForDomainvalidation =
      '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$';

    var regexpObj = new RegExp(regexForDomainvalidation);

    // if regexp return false then domain is invalid so stop function execution
    if (!regexpObj.test(value)) {
      this.setValidationMessage(
        true,
        `Invalid Domain !!`,
        'campaignExcludedDomains'
      );
      return;
    }

    // check if domain already exist in included or excluded domains
    if (this.campaignModel.domains.includes(value)) {
      this.setValidationMessage(
        true,
        `Domain ${value} is already added in Included Domains !!`,
        'campaignExcludedDomains'
      );

      return;
    }
    if (this.campaignModel.excludedDomains.includes(value)) {
      this.setValidationMessage(
        true,
        `Already Included !!`,
        'campaignExcludedDomains'
      );
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
      ({ day }) => day == dayOfTheAd
    );

    // if does not exist then Create a New Object with Day and Time values
    if (!dayTimeObject) {
      // Else

      this.campaignModel.adSchedulingDayAndTime.push({
        day: dayOfTheAd,
        hour: event.value,
      });
    }

    // Object already Exist
    else {
      // Update Existing Entry  and Time in Corresponding day
      dayTimeObject.hour = event.value;
    }
  }

  // ************************* Excluded Field Setup Code End

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

  setValidationMessage(isInvalid: boolean, message: string, property: string) {
    this.validationObject[property].message = message;
    this.validationObject[property].isInvalid = isInvalid;
  }
  // Handles Campaign Form Submit
  handleCreateCampaignSubmit() {
    // holds form data
    var campaignFormData: CampaignModel = this.campaignModel;
    var flag: number = 1;

    this.validationObject = {
      campaignName: {
        isInvalid: false,
        message: '',
      },

      campaignStartDate: {
        isInvalid: false,
        message: '',
      },
      campaignEndDate: {
        isInvalid: false,
        message: '',
      },

      campaignDailyBudget: {
        isInvalid: false,
        message: '',
      },
      campaignOverallBudget: {
        isInvalid: false,
        message: '',
      },
      campaignBudgetPacing: {
        isInvalid: false,
        message: '',
      },

      campaignDomains: {
        isInvalid: false,
        message: '',
      },
      campaignExcludedDomains: {
        isInvalid: false,
        message: '',
      },
      campaignIncludeDomainFile: {
        isInvalid: false,
        message: '',
      },

      campaignExcludeDomainFile: {
        isInvalid: false,
        message: '',
      },

      campaignListOfDevices: {
        isInvalid: false,
        message: '',
      },

      campaignAdScheduling: {
        isInvalid: false,
        message: '',
      },

      campaignInludedGeolocation: {
        isInvalid: false,
        message: '',
      },
    };
    // validating Campaign name
    if (campaignFormData.name.length <= 3) {
      this.setValidationMessage(
        true,
        'Campaign Name should be atleast 4 characters !!',
        'campaignName'
      );

      flag = 0;
    }

    // validating start date
    if (campaignFormData.startDate == '') {
      this.setValidationMessage(
        true,
        'Start date is  Required!!',
        'campaignStartDate'
      );
      flag = 0;
    }
    // validating end date
    if (campaignFormData.endDate == '') {
      this.setValidationMessage(
        true,
        'End date is  Required!!',
        'campaignEndDate'
      );
      flag = 0;
    }

    // validate Daily and Overall Budget
    if (campaignFormData.dailyBudget == 0) {
      this.setValidationMessage(
        true,
        "Daily Budget can't be 0 !!",
        'campaignDailyBudget'
      );
      flag = 0;
    }

    if (campaignFormData.overallBudget == 0) {
      this.setValidationMessage(
        true,
        "Overall Budget can't be 0 !!",
        'campaignOverallBudget'
      );
      flag = 0;
    }

    if (campaignFormData.dailyBudget > campaignFormData.overallBudget) {
      this.setValidationMessage(
        true,
        'Daily Budget should be lesser than Overall !!',
        'campaignDailyBudget'
      );
      flag = 0;
    }

    //  validating Campaign Domain
    if (campaignFormData.domains.length <= 0) {
      this.setValidationMessage(
        true,
        'Enter Atleast one Domain !!',
        'campaignDomains'
      );
      flag = 0;
    }

    // validating Campaign Devices
    if (campaignFormData.devices.length <= 0) {
      this.setValidationMessage(
        true,
        'Select Alteast one Device !!',
        'campaignListOfDevices'
      );
      flag = 0;
    }

    // validating Budget Pacing
    if (campaignFormData.budgetPacing == '') {
      this.setValidationMessage(
        true,
        'Budget Pacing Required !!',
        'campaignBudgetPacing'
      );
      flag = 0;
    }

    // validating AdSchdeduling
    if (campaignFormData.adSchedulingDays.length <= 0) {
      this.setValidationMessage(
        true,
        'Select Atleast One Schedule Day !!',
        'campaignAdScheduling'
      );
      flag = 0;
    }

    // something is invalid
    if (flag === 0) {
      return;
    }
    // Creating Object to be sent to server

    const serverDomainArray: Array<object> = [{}];

    for (let i = 0; i < campaignFormData.domains.length; i++) {
      let newObj = {
        domainName: campaignFormData.domains[i],
        isIncuded: true,
      };

      serverDomainArray.push(newObj);
    }

    for (let i = 0; i < campaignFormData.excludedDomains.length; i++) {
      let newObj = {
        domainName: campaignFormData.excludedDomains[i],
        isIncuded: false,
      };

      serverDomainArray.push(newObj);
    }

    const serverDevicesArrayObj: Array<object> = [];
    for (let i = 0; i < campaignFormData.devices.length; i++) {
      let newObj = {
        deviceId: campaignFormData.devices[i],
      };

      serverDevicesArrayObj.push(newObj);
    }
    const serverObject = {
      campaign: {
        advertiserId: 1, // this is something that happens during authentication, but for now add manually
        name: campaignFormData.name,
        startDate: campaignFormData.startDate,
        endDate: campaignFormData.endDate,
        dailyBudget: campaignFormData.dailyBudget,
        overallBudget: campaignFormData.overallBudget,
        budgetPacing: campaignFormData.budgetPacing == 'Enable' ? true : false,
      },
      geolocations: [
        {
          geolocationId: 1,
          isIncluded: true,
        },
        {
          geolocationId: 3,
          isIncluded: false,
        },
      ],

      devices: serverDevicesArrayObj,

      domains: serverDomainArray,

      adScheduling: campaignFormData.adSchedulingDayAndTime,
    };
    console.log(campaignFormData);
    console.log(serverObject);

    // Posting Data To Json Server
    this.http
      .post(`http://localhost:3000/campaigns`, campaignFormData)
      .subscribe((res) => {
        console.log('Response from API :  ', res);
      });
  }

  // Logic To setUp Geolocation Field
  // geoLocationReference = new FormControl('');

  // listOfLocations = this.masterListOfLocations;

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
