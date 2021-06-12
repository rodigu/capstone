/** Node class */

export class Node {
  /**
   * Node class
   *
   * @param  {Object} obj
   * @param  {number} [obj.weight=1]  node's weight
   * @param  {string|number} obj.id   node's id
   *
   * @property  {number|string}  id  node's id
   * @property  {number}  weight  node's weight
   */
  constructor({ id, weight = 1 }) {
    this.id = id;
    this.weight = weight;
  }
}
