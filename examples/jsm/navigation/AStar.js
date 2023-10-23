// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.

class AStar {

	static init(graph) {
		for (let x = 0; x < graph.length; x++) {
			const node = graph[x];
			node.f = 0;
			node.g = 0;
			node.h = 0;
			node.cost = 1.0;
			node.visited = false;
			node.closed = false;
			node.parent = null;
		}
	}

	static cleanUp(graph) {
		for (let x = 0; x < graph.length; x++) {
			const node = graph[x];
			delete node.f;
			delete node.g;
			delete node.h;
			delete node.cost;
			delete node.visited;
			delete node.closed;
			delete node.parent;
		}
	}

	static search(graph, start, end) {
		this.init(graph);

		const openHeap = new BinaryHeap(function(node) {
			return node.f;
		});

		openHeap.push(start);

		while (openHeap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			const currentNode = openHeap.pop();

			// End case -- result has been found, return the traced path.
			if (currentNode === end) {
				let curr = currentNode;
				const ret = [];
				while (curr.parent) {
					ret.push(curr);
					curr = curr.parent;
				}
				this.cleanUp(ret);
				return ret.reverse();
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbours.
			currentNode.closed = true;

			// Find all neighbours for the current node. Optionally find diagonal neighbours as well (false by default).
			const neighbours = this.neighbours(graph, currentNode);

			for (let i = 0, il = neighbours.length; i < il; i++) {
				const neighbour = neighbours[i];
				if (neighbour.closed) {
					// Not a valid node to process, skip to next neighbour.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
				const gScore = currentNode.g + neighbour.cost;
				const beenVisited = neighbour.visited;

				if (!beenVisited || gScore < neighbour.g) {
					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighbour.visited = true;
					neighbour.parent = currentNode;
					if (!neighbour.centroid || !end.centroid) {
						throw new Error('Unexpected state');
					}
					neighbour.h =
                        neighbour.h || neighbour.centroid.distanceToSquared(end.centroid);
					neighbour.g = gScore;
					neighbour.f = neighbour.g + neighbour.h;

					if (!beenVisited) {
						// Pushing to heap will put it in proper place based on the 'f' value.
						openHeap.push(neighbour);
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						openHeap.rescoreElement(neighbour);
					}
				}
			}
		}

		// No result was found - empty array signifies failure to find path.
		return [];
	}

	static neighbours(graph, node) {
		const ret = [];

		for (let e = 0; e < node.neighbours.length; e++) {
			ret.push(graph[node.neighbours[e]]);
		}

		return ret;
	}

}

class BinaryHeap {

	constructor(scoreFunction) {
		this.content = [];
		this.scoreFunction = scoreFunction;
	}

	push(element) {
		// Add the new element to the end of the array.
		this.content.push(element);

		// Allow it to sink down.
		this.sinkDown(this.content.length - 1);
	}

	pop() {
		// Store the first element so we can return it later.
		const result = this.content[0];
		// Get the element at the end of the array.
		const end = this.content.pop();
		// If there are any elements left, put the end element at the
		// start, and let it bubble up.
		if (this.content.length > 0) {
			this.content[0] = end;
			this.bubbleUp(0);
		}
		return result;
	}

	remove(node) {
		const i = this.content.indexOf(node);

		// When it is found, the process seen in 'pop' is repeated
		// to fill up the hole.
		const end = this.content.pop();

		if (i !== this.content.length - 1) {
			this.content[i] = end;

			if (this.scoreFunction(end) < this.scoreFunction(node)) {
				this.sinkDown(i);
			} else {
				this.bubbleUp(i);
			}
		}
	}

	size() {
		return this.content.length;
	}

	rescoreElement(node) {
		this.sinkDown(this.content.indexOf(node));
	}

	sinkDown(n) {
		// Fetch the element that has to be sunk.
		const element = this.content[n];

		// When at 0, an element can not sink any further.
		while (n > 0) {
			// Compute the parent element's index, and fetch it.
			const parentN = ((n + 1) >> 1) - 1;
			const parent = this.content[parentN];
			if (this.scoreFunction(element) < this.scoreFunction(parent)) {
				// Swap the elements if the parent is greater.
				this.content[parentN] = element;
				this.content[n] = parent;
				// Update 'n' to continue at the new position.
				n = parentN;
			} else {
				// Found a parent that is less, no need to sink any further.
				break;
			}
		}
	}

	bubbleUp(n) {
		// Look up the target element and its score.
		const length = this.content.length,
			element = this.content[n],
			elemScore = this.scoreFunction(element);

		while (true) {
			// Compute the indices of the child elements.
			const child2N = (n + 1) << 1,
				child1N = child2N - 1;
			// This is used to store the new position of the element,
			// if any.
			let swap = null;
			let child1Score;
			// If the first child exists (is inside the array)...
			if (child1N < length) {
				// Look it up and compute its score.
				const child1 = this.content[child1N];
				child1Score = this.scoreFunction(child1);

				// If the score is less than our element's, we need to swap.
				if (child1Score < elemScore) {
					swap = child1N;
				}
			}

			// Do the same checks for the other child.
			if (child2N < length) {
				const child2 = this.content[child2N],
					child2Score = this.scoreFunction(child2);
				if (child2Score < (swap === null ? elemScore : child1Score)) {
					swap = child2N;
				}
			}

			if (swap !== null) { // If the element needs to be moved, swap it, and continue.
				this.content[n] = this.content[swap];
				this.content[swap] = element;
				n = swap;
			} else { // Otherwise, we are done.
				break;
			}
		}
	}

}

export { AStar };