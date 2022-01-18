import { base_id, VerticeArgs } from './enums.ts';

export class Vertice {
  readonly id:base_id;
  weight:number;

  /**
   * ### Vertice constructor
   * 
   * 
   * @param  {VerticeArgs} args
   */
  constructor (args:VerticeArgs) {
    this.id = args.id;
    this.weight ??= 1;
  }
}
