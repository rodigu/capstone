import { base_id, EdgeArgs } from './enums.ts';

export class Edge {
  private vertice_b:base_id;
  private vertice_a:base_id;
  weight:number;

  /**
   * ### Edge constructor
   * Create an edge between `vertice_a` and `vertice_b`.
   * Weight is set to 1 by default (i.e. unweighted).
   * 
   * @param  {EdgeArgs} args
   */
  constructor (args:EdgeArgs) {
    this.vertice_a = args.vertice_a;
    this.vertice_b = args.vertice_b;
    this.weight ??= 1;
  }

  /**
   * ### Vertices getter
   * Returns an object with the two vertices in the egde.
   * 
   * @returns {{ a:base_id, b:base_id }}
   */
  get vertices () : { a:base_id, b:base_id } {
    return { a: this.vertice_a, b: this.vertice_b };
  }
}
