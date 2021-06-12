import { Node } from "./node.js";
import { Edge } from "./edge.js";

/** Network class */

export class Network {
  /**
   * Network class constructor
   *
   * @param    {Object}   obj
   * @param    {boolean}  [obj.isDirected=false]   if true, edges are directed A -> B
   * @param    {number}   [obj.edgeLimit=500]      limit for number of edges in the network
   * @param    {number}   [obj.nodeLimit=500]      limit for number of nodes in the network
   *
   * @property  {Map<string|number, Node>}  _nodes       Map with Network's nodes
   * @property  {Map<string|number, Edge>}  _edges       Map with Network's edges
   * @property  {boolean} isDirected    If true, edges are directed A -> B
   * @property  {number}  _edgeLimit    Limit for number of edges in the network
   * @property  {number}  _nodeLimit    Limit for number of nodes in the network
   * @property  {number}  _freeNID      Last known free Node ID, used when creating unassigned IDs, and when an Node is deleted
   * @property  {number}  _freeEID      Last known free Edge ID, used when creating unassigned IDs, and when an Edge is deleted
   * @property  {boolean} _isMultigraph True if network is a multigraph (more than one edge between two nodes)
   */
  constructor({ isDirected = false, edgeLimit = 500, nodeLimit = 500 } = {}) {
    this._edges = new Map();
    this._nodes = new Map();
    this.isDirected = isDirected;
    this._edgeLimit = edgeLimit;
    this._nodeLimit = nodeLimit;
    this._freeEID = 0;
    this._freeNID = 0;
    this._isMultigraph = false;
  }

  get edges() {
    return this._edges;
  }

  get nodes() {
    return this._nodes;
  }

  get isMultigraph() {
    return this.isMultigraph;
  }

  /**
   * Adds a new edge to the newtwork
   *
   * @param  {Object} obj
   * @param  {string|number}  [obj.id]      Edge's unique ID. If not given, an automatic ID will be generated
   * @param  {string|number}  obj.nodeA     NodeA's ID
   * @param  {string|number}  obj.nodeB     NodeB's ID
   * @param  {number}  [obj.weight=1]       Edge's weight
   * @param  {boolean} [obj.doForce=false]  If true, if either any of the nodes does not exist
   *
   * @example <caption>Creating a network, and adding 2 nodes and an edge between them</caption>
   * import { Network } from './network.js'
   * const net = new Network();
   * // Adding nodes
   * net.addNode({ id: 'A' });
   * net.addNode({ id: 'B' });
   * // Adding edge
   * net.addEdge({ id: 'coolEdge', nodeA: 'A', nodeB: 'B' })
   *
   * @throws Error when trying to add existing edge
   * @throws Error when trying to add edge over allowed limit
   * @throws Error when trying to add edge on inexistent node (if not forcing edge)
   */
  addEdge({ id, nodeA, nodeB, weight = 1, doForce = false } = {}) {
    if (this._edges.has(id)) throw { message: Network.ERROR.EXISTING_EDGE };

    if (this._edges.size >= this._edgeLimit)
      throw { message: Network.ERROR.EDGE_LIMIT };

    if (!doForce) {
      if (!this._nodes.has(nodeA))
        throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeA };

      if (!this._nodes.has(nodeB))
        throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeB };
    } else {
      if (!this._nodes.has(nodeA)) this.addNode({ id: nodeA });
      if (!this._nodes.has(nodeB)) this.addNode({ id: nodeB });
    }

    id = id ?? this._newEID();

    // FIXME: Change the way a network is checked for being multigraph
    // For now, everytime an edge is added to a non-multigraph, it will check
    // if an edge between the given nodes already exists
    // The hasEdgeFunction is quite inneficient
    if (!this._isMultigraph)
      if (this.hasEdge({ nodeA, nodeB })) this._isMultigraph = true;
    // TODO: make multigraph a parameter to be given in constructor

    this._edges.set(id, new Edge({ nodeA, nodeB, weight }));
  }

  /**
   * Adds a new node to the newtwork
   *
   * @param  {Object} obj
   * @param  {number|string} obj.id   New node's ID
   * @param  {number} [obj.weight=1]  Node's weight
   */
  addNode({ id, weight = 1 } = {}) {
    if (this._nodes.size >= this._nodeLimit)
      throw { message: Network.ERROR.NODE_LIMIT };

    if (this._nodes.has(id)) throw { message: Network.ERROR.EXISTING_NODE };

    id = id ?? this._newNID();

    this._nodes.set(id, new Node({ id, weight }));
  }

  /**
   * Removes node with specified ID
   *
   * @param  {Object} obj
   * @param  {string|number}  obj.id  ID for node to be deleted
   */
  removeNode({ id }) {
    if (!this._nodes.has(id))
      throw { message: Network.ERROR.INEXISTENT_NODE, node: id };

    this._nodes.delete(id);
  }

  /**
   * Removes Edge with specified nodes. If the network is a multigraph
   *
   * @param  {Object} obj
   * @param  {string} nodeA       Node A's ID
   * @param  {string} nodeB       Node B's ID
   * @param  {number} [weight=1]  Weight is mandatory if the network is a multigraph (more than one edge between two nodes)
   */
  removeEdge({ nodeA, nodeB, weight = 1 }) {
    for ([edgeID, edge] of this._edges.entries()) {
      const { A, B } = edge.nodes;
      if (A === nodeA && B === nodeB) {
        this._edges.delete(edgeID);
        break;
      }
    }
  }

  // TODO: hasEdge() function

  /**
   * Generates new Edge ID
   * @private
   * @return {number}  Edge ID
   */
  _newEID() {
    const id = this._freeEID++;
    while (this._edges.has(id)) {
      id = Math.floor(Math.random(this._edgeLimit));
    }
    return id;
  }

  /**
   * Generates new Node ID
   * @private
   * @return {number}  Node ID
   */
  _newNID() {
    const id = this._freeNID++;
    while (this._node.has(id)) {
      id = Math.floor(Math.random(this._nodeLimit));
    }
    return id;
  }
}

Network.ERROR = {
  UNDEFINED_VALUES: "Undefined values being given as arguments!",
  EDGE_LIMIT: `Can't add new edge. Limit of Edges exceeded`,
  NODE_LIMIT: `Can't add new node. Limit of Nodes exceeded`,
  EXISTING_EDGE: "Trying to add an edge with already existing ID",
  EXISTING_NODE: "Trying to add a node with already existing ID",
  INEXISTENT_NODE: `Node doesn't exist`,
};
