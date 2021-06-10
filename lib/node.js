/** Node class */

export class Node {
  /**
   * Node class
   *
   * @param  {number} [weight=1]  node's weight
   * @param  {string|number} id   node's id
   */
  constructor ({ id, weight = 1 }) {
    this.id = id
    this.weight = weight
  }
}
