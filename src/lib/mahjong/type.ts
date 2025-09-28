export enum MahjongSuits {
  MAN,
  PIN,
  SOU,
  WIND,
  DRAGON,
}

export class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValueError';
  }
}
