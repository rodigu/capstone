import * as nets from './ne.ts';

console.log("---Starting Tests---");

const number_edges = 10;
const number_vertices = 10;
const is_directed = false;
const net = nets.randomNetworkGen({ number_vertices, number_edges, is_directed });
net.addEdge({ from: 'a', to: 'b' });


function logNetwork (network:nets.Network) {
    console.log(network.vertex_list);
    console.log(network.edge_list);
}

function basicTest (network:nets.Network) {
    const test_vertex = 2;
    
    logNetwork(network);

    network.removeVertex(test_vertex);
    console.log(`\nRemoved ${test_vertex}\n`);
    
    logNetwork(network);
    console.log(`\nHas vertex ${test_vertex}: ${network.hasVertex(test_vertex)}`);

    network.removeEdge({ from: 'a', to: 'b' });
    console.log(`\nRemoved edge\n`);
    logNetwork(network);
}

function valuesTest (network:nets.Network) {

}

basicTest(net);