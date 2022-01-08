import { Network } from "./network.js";

/**
 * ### Get network weight
 *
 * A network's weight is the sum of its nodes' weights.
 *
 * @param  {Network} network       Network
 *
 * @returns {number} Network's weight
 */
export function networkWeight (network) {
    let weight = 0;
    const { nodes } = network;

    nodes.forEach(node => {
      weight += node.weight;
    });

    return weight;
}

/**
 * ### Get network genus
 *
 * Genus is the number of edges minus the number of nodes plus one.
 *
 * @param  {Network} network       Network
 *
 * @returns {number} Network's genus
 */
export function genus (network) {
  return network.edges.size - network.nodes.size + 1;
}

/**
 * ### Out neighbors of a node
 *
 * In a directed network, an out neighbor of a node A is any node B such that a directed edge A to B exists
 *
 * @param  {Network} network              Network
 * @param  {number|string} id             Node's ID
 *
 * @returns {Array<Node>} List with node's out neighbors
 */
export function outNeighbors (network, id){
  if (!network.is_directed) return null;

  const { nodes } = network;
  const out_neighbors = [];
  nodes.forEach(node => {
    if (network.hasEdge(id, node.id)) out_neighbors.push(node);
  });

  return out_neighbors;
}

/**
 * ### Generate random network
 *
 * Generates a random network with given number of nodes and edges
 *
 * @param  {number} network         Network
 * @param  {number} id              Node's ID
 * @param  {Boolean} [is_directed]  Node's ID
 *
 * @returns {Network} Random network
 */
export function randomNetworkGen (number_nodes, number_edges, is_directed = false) {
  const net = new Network(is_directed);
  for (let node = 0; node < number_nodes; node++)
    net.addNode(node);
  while (net.edges.size < number_edges) {
    const nodeA = Math.floor(Math.random() * number_nodes);
    const nodeB = Math.floor(Math.random() * number_nodes);
    net.addEdge(nodeA, nodeB);
  }

  return net;
}
