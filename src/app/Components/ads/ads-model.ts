export class AdsModel {
  constructor(
    public title: string,
    public description: string,
    public imageUrl: Array<string>,
    public destinationUrl: string
  ) {}
}
