import { Network } from './network.js'

const net:Network = new Network();
// Adding Nodes
net.addNode('A');
net.addNode('B');
// Adding Edges
net.addEdge('A', 'B', 'coolEdge');


net.addEdge('B','A');
