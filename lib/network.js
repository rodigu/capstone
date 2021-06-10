import { Node } from '/node'
import { Edge } from '/edge'

/** Network class */

export class Network {
  /**
   * Network class constructor
   *
   * @param    {boolean}  [isDirected=false]   if true, edges are directed A -> B
   * @param    {number}   [edgeLimit=500]      limit for number of edges in the network
   * @param    {number}   [nodeLimit=500]      limit for number of nodes in the network
   *
   * @property {Map<string|number, Node>}  _nodes       Map with Network's nodes
   * @property {Map<string|number, Edge>}  _edges       Map with Network's edges
   * @property {boolean}                  isDirected    if true, edges are directed A -> B
   * @property {number}                   edgeLimit     limit for number of edges in the network
   * @property {number}                   nodeLimit     limit for number of nodes in the network
   * @property {number|string}            edgeLimit     Last known free Edge ID, used when creating unassigned IDs, and when an Edge is deleted
   * @property {number|string}            nodeLimit     Last known free Node ID, used when creating unassigned IDs, and when an Node is deleted
   */
  constructor ({ isDirected = false, edgeLimit = 500, nodeLimit = 500 }) {
    this._edges = new Map()
    this._nodes = new Map()
    this.isDirected = isDirected
    this.edgeLimit = edgeLimit
    this.nodeLimit = nodeLimit
    this._freeEID = 0
    this._freeNID = 0
  }

  get edges () {
    return this._edges
  }

  get nodes () {
    return this._nodes
  }

  /**
   * Adds a new edge to the newtwork
   *
   * @param  {string|number}  [id]      Edge's unique ID. If not given, an automatic ID will be generated
   * @param  {string|number}  nodeA     NodeA's ID
   * @param  {string|number}  nodeB     NodeB's ID
   * @param  {number}  [weight=1]       Edge's weight
   * @param  {boolean} [doForce=false]  If true, if either any of the nodes does not exist
   *
   * @returns {void}
   *
   * @throws When trying to add existing edge
   * @throws When trying to add edge over allowed limit
   * @throws When trying to add edge on inexistent node (if not forcing edge)
   */
  addEdge ({ id, nodeA, nodeB, weight = 1, doForce = false }) {
    if (this._edges.has(id)) {
      throw { message: Network.ERROR.EXISTING_EDGE }
    }
    if (this._edges.size >= this.limit) {
      throw { message: Network.ERROR.EDGE_LIMIT }
    }

    if (!doForce) {
      if (!!this._nodes.has(nodeA)) {
        throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeA }
      }
      if (!!this._nodes.has(nodeB)) {
        throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeB }
      }
    } else {
      if (!!this._nodes.has(nodeA)) this.addNode({ id: nodeA })
      if (!!this._nodes.has(nodeB)) this.addNode({ id: nodeB })
    }

    id = id ?? this._newEID()

    this._edges.set(id, new Edge({ nodeA, nodeB, weight }))
  }

  /**
   * Adds new node to network with the specified weight and ID
   *
   * @param  {string|number} id  New node's ID
   * @param  {number} [weight=1] Node's weight
   */
  addNode ({ id, weight = 1 }) {

  }

  /**
   * Generates new Edge ID
   * @private
   *
   * @return {number}  Edge ID
   */
  _newEID () {
    const id = this._freeEID++
    while (this._edges.has(id)) {
      id = Math.floor(Math.random(this.edgeLimit))
    }
    return id
  }
}

Network.ERROR = {
  UNDEFINED_VALUES: 'Undefined values being given as arguments!',
  EDGE_LIMIT: `Can't add new edge. Limit of Edges exceeded`,
  NODE_LIMIT: `Can't add new node. Limit of Nodes exceeded`,
  EXISTING_EDGE: 'Trying to add already existing edge',
  EXISTING_NODE: 'Trying to add already existing node',
  INEXISTENT_NODE: `Node doesn't exist`
}
