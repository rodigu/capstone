import { Network } from './network.js'

function randomNetworkGen (number_nodes:number, number_edges:number) : Network {
  const net = new Network();
  for (let node = 0; node < number_nodes; node++)
    net.addNode(node);
  while (net.edges.size < number_edges) {
    const nodeA = Math.floor(Math.random() * number_nodes);
    const nodeB = Math.floor(Math.random() * number_nodes);
    net.addEdge(nodeA, nodeB);
  }

  return net;
}

const number_nodes = 10;
const number_edges = 11;

const net:Network = randomNetworkGen(number_nodes, number_edges);

console.log(net);
