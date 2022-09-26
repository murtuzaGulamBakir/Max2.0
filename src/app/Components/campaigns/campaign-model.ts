export class CampaignModel {
  constructor(
    public name: string,
    public startDate: string,
    public endDate: string,
    public dailyBudget: number,
    public overallBudget: number,
    public domains: Array<string>,
    public excludedDomains: Array<string>,
    public devices: Array<string>,
    public budgetPacing: string,
    public adSchedulingDays: Array<string>,
    public adSchedulingDayAndTime: Array<{ name?: string; time: [] }>,
    public geoLocations: Array<string>,
    public excludedGeolocations: Array<string>
  ) {}
}
