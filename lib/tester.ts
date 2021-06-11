import { Network } from './network.js'

const net:Network = new Network();

net.addNode({ id: 'A' });
net.addNode({ id: 'B' });

net.addEdge({ id: 'coolEdge', nodeA: 'A', nodeB: 'B' })

console.log(net)
