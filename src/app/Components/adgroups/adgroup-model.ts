export class AdgroupModel {
  constructor(
    public name: string,
    public bid: string,
    public keywords: Array<string>,
    public categories: Array<string>
  ) {}
}
