// Copyright 2021 The Prometheus Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// walkBackward will iterate other the tree from the leaf to the root until it founds the given `exit` node.
// It returns null if the exit is not found.
export function walkBackward(node, exit) {
    var cursor = node.cursor;
    var cursorIsMoving = true;
    while (cursorIsMoving && cursor.type.id !== exit) {
        cursorIsMoving = cursor.parent();
    }
    return cursor.type.id === exit ? cursor.node : null;
}
// walkThrough is going to follow the path passed in parameter.
// If it succeeds to reach the last id/name of the path, then it will return the corresponding Subtree.
// Otherwise if it's not possible to reach the last id/name of the path, it will return `null`
// Note: the way followed during the iteration of the tree to find the given path, is only from the root to the leaf.
export function walkThrough(node) {
    var path = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        path[_i - 1] = arguments[_i];
    }
    var cursor = node.cursor;
    var i = 0;
    var cursorIsMoving = true;
    path.unshift(cursor.type.id);
    while (i < path.length && cursorIsMoving) {
        if (cursor.type.id === path[i] || cursor.type.name === path[i]) {
            i++;
            if (i < path.length) {
                cursorIsMoving = cursor.next();
            }
        }
        else {
            cursorIsMoving = cursor.nextSibling();
        }
    }
    if (i >= path.length) {
        return cursor.node;
    }
    return null;
}
export function containsAtLeastOneChild(node) {
    var child = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        child[_i - 1] = arguments[_i];
    }
    var cursor = node.cursor;
    if (!cursor.next()) {
        // let's try to move directly to the children level and
        // return false immediately if the current node doesn't have any child
        return false;
    }
    var result = false;
    do {
        result = child.some(function (n) { return cursor.type.id === n || cursor.type.name === n; });
    } while (!result && cursor.nextSibling());
    return result;
}
export function containsChild(node) {
    var child = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        child[_i - 1] = arguments[_i];
    }
    var cursor = node.cursor;
    if (!cursor.next()) {
        // let's try to move directly to the children level and
        // return false immediately if the current node doesn't have any child
        return false;
    }
    var i = 0;
    do {
        if (cursor.type.id === child[i] || cursor.type.name === child[i]) {
            i++;
        }
    } while (i < child.length && cursor.nextSibling());
    return i >= child.length;
}
// TODO logic to find leaf / subNode has been changed comparing to codemirror-promql. We should report the changes
export function retrieveAllRecursiveNodes(parentNode, recursiveNode, leaf) {
    var nodes = [];
    function recursiveRetrieveNode(node, nodes) {
        var subNode = node === null || node === void 0 ? void 0 : node.getChild(recursiveNode);
        var le = node === null || node === void 0 ? void 0 : node.getChild(leaf);
        if (le) {
            nodes.push(le);
        }
        if (subNode && subNode.type.id === recursiveNode) {
            recursiveRetrieveNode(subNode, nodes);
        }
    }
    recursiveRetrieveNode(parentNode, nodes);
    return nodes;
}
