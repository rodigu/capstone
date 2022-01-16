import * as nets from './ne.ts';

const net = new nets.Network();

net.addEdge({vertice_a:1,vertice_b:2});

console.log(net);