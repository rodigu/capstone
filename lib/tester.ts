import { Network } from './network.js'

const net:Network = new Network();
// Adding Nodes
net.addNode({ id: 'A' });
net.addNode({ id: 'B' });
// Adding Edges
net.addEdge({ id: 'coolEdge', nodeA: 'A', nodeB: 'B' })
// Checking ou net
console.log(net)
