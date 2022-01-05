// MIT License
//
// Copyright (c) 2021 Augustin Husson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { walk, WalkingPath } from '@nexucis/kvsearch';

export interface AutocompleteNode {
    // name is usually the last term contained in the path
    // The only exception is for the root where the name is empty
    name: string | RegExp
    // list is the autocompletion list provided when we need to autocomplete the QueryPath
    keys: string[];
    // values is the autocompletion list provided when we need to autocomplete the QueryPattern
    values: string[];
    // path is full list of keyword that was needed to reach this node.
    path: (string | RegExp) [];
    // children is the list of children that has been calculated in a previous autocompletion iteration.
    // This list can be empty. It doesn't mean necessary it's a leaf, it can also mean we never calculate the children before.
    children: AutocompleteNode[];
    // indices is used to know which object is containing the path/ the node.
    // It's used when we will need to calculate the children. So we don't have to loop other all object. It's already filtered thanks to this list.
    indices: number[];
}

export function newRootNode(objects: Record<string, unknown>[]): AutocompleteNode {
    const keys = new Set<string>();
    let i = 0;
    const indices = new Array<number>(objects.length)
    for (const object of objects) {
        for (const key of Object.keys(object)) {
            keys.add(key);
        }
        indices[i] = i;
        i++;
    }
    return {
        name: '',
        keys: Array.from(keys),
        values: [],
        path: [],
        children: [],
        indices,
    }
}

export function iterateAndCreateMissingChild(depth: number, keyPath: (string | RegExp) [], objects: Record<string, unknown>[], root: AutocompleteNode): AutocompleteNode | null {
    let i = 0;
    let node: AutocompleteNode | null = root;
    if (depth > keyPath.length) {
        return null
    }
    while (i < depth) {
        const childKey = keyPath[i]
        if (node === null || ( typeof childKey === 'string' && !node.keys.includes(childKey))) {
            // in that case, it's impossible that node has a child matching this keyPath.
            return null
        }
        // now let's find the child if it exists. In case it doesn't, we should create it.
        // Probably it wouldn't be super optimized for each child missing to create a complete node. Instead we should probably just create a node with the path.
        // Other fields could be completed only on demand.
        let hasBeenFound = false
        for (const child of node.children) {
            if (child.name === childKey) {
                hasBeenFound = true
                node = child
                break;
            }
        }
        if (!hasBeenFound) {
            node = createChild(objects, node, childKey)
        }
        i++;
    }
    return node;
}


// createChild will create a new child according to its parent, the list of objects and the childKey requested.
// It's possible that there is no child created because the path doesn't match anything in the list of object.
// In that case, the function returns null.
function createChild(objects: Record<string, unknown>[], parent: AutocompleteNode, childKey: string | RegExp): AutocompleteNode | null {
    const newPath = parent.path.concat(childKey);
    const keys = new Set<string>();
    const values = new Set<string>();
    const indices: number[] = [];
    for (const index of parent.indices) {
        const currentObj = objects[index]
        if (currentObj !== undefined) {
            const obj = walk(newPath, currentObj);
            if (obj !== null && addKeysByWalkingPath(obj, keys, values)) {
                indices.push(index)
            }
        }
    }
    if (indices.length > 0 || values.size > 0) {
        const child: AutocompleteNode = {
            name: childKey,
            path: newPath,
            indices: indices,
            children: [],
            keys: Array.from(keys),
            values: Array.from(values)
        }
        parent.children.push(child)
        return child
    } else {
        return null
    }
}

function addKeysByWalkingPath(path: WalkingPath | WalkingPath[], keys: Set<string>, values: Set<string>): boolean {
    if (Array.isArray(path)) {
        let hasBeenAdded = false
        for (const p of path) {
            hasBeenAdded = hasBeenAdded || addKeys(p.value, keys, values)
        }
        return hasBeenAdded
    } else {
        return addKeys(path.value, keys, values)
    }
}

// addKeys is adding data in the result depending of the type of object.
// addKeys returns true if it adds something in the result. It returns false otherwise.
function addKeys(obj: string | Record<string, unknown> | Record<string, unknown>[], keys: Set<string>, values: Set<string>): boolean {
    if (obj === undefined || obj === null) {
        return false
    } else if (typeof obj === 'string') {
        // Here the object is a just a string so it means it's a value that should be used for the filtering equation not for the key.
        // So we shouldn't autocomplete it.
        values.add(obj)
        return false
    } else if (Array.isArray(obj)) {
        let hasChanged = false
        for (const subObj of obj) {
            hasChanged = hasChanged || addKeys(subObj, keys, values)
        }
        return hasChanged
    } else if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            keys.add(key);
            values.add(key)
        }
        return true
    } else {
        return false
    }
}
