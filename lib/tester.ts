import * as nets from './ne.ts';

const number_edges = 10;
const number_vertices = 10;
const net = nets.randomNetworkGen({ number_vertices, number_edges });

console.log(net);