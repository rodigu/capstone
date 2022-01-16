export class Vertice {
  readonly id: string | number;
  weight: number;

  constructor (args : { id: string | number, weight?: number }) {
    this.id = args.id;
    this.weight ??= 1;
  }
}
