import { Network } from './network.js';

import * as algo from './algorithms.js';

function testNet (network:Network, title:string) {
  console.log(`--- ${title} ---`);

  console.log('Network:','\n  nodes:', network.nodes, '\n  edges:', network.edges);

  console.log(`Network genus: ${algo.genus(network)}`);

  console.log(`Network weight: ${algo.networkWeight(network)}`);

  console.log(`Out-neighbors for node 1:`, algo.outNeighbors(network, 1) ?? 'network is undirected');
}

const number_nodes = 10;
const number_edges = 11;

const net_undirected:Network = algo.randomNetworkGen(number_nodes, number_edges);
testNet(net_undirected, 'Undirected Network');

const net_directed:Network = algo.randomNetworkGen(number_nodes, number_edges, true);
testNet(net_directed, 'Directed Network');
