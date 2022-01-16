import { Network } from "./network.ts";

export function networkWeight (network) {
    let weight = 0;
    const { nodes } = network;

    nodes.forEach(node => {
      weight += node.weight;
    });

    return weight;
}

export function genus (network) {
  return network.edges.size - network.nodes.size + 1;
}


export function outNeighbors (network, id){
  if (!network.is_directed) return null;

  const { nodes } = network;
  const out_neighbors = [];
  nodes.forEach(node => {
    if (network.hasEdge(id, node.id)) out_neighbors.push(node);
  });

  return out_neighbors;
}

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
