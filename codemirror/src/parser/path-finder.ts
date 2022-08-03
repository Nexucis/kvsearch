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

import { SyntaxNode } from '@lezer/common';

// walkBackward will iterate other the tree from the leaf to the root until it founds the given `exit` node.
// It returns null if the exit is not found.
export function walkBackward(node: SyntaxNode, exit: number): SyntaxNode | null {
  const cursor = node.cursor();
  let cursorIsMoving = true;
  while (cursorIsMoving && cursor.type.id !== exit) {
    cursorIsMoving = cursor.parent();
  }
  return cursor.type.id === exit ? cursor.node : null;
}

export function containsAtLeastOneChild(node: SyntaxNode, ...child: (number | string)[]): boolean {
  const cursor = node.cursor();
  if (!cursor.next()) {
    // let's try to move directly to the children level and
    // return false immediately if the current node doesn't have any child
    return false;
  }
  let result = false;
  do {
    result = child.some((n) => cursor.type.id === n || cursor.type.name === n);
  } while (!result && cursor.nextSibling());
  return result;
}

export function containsChild(node: SyntaxNode, ...child: (number | string)[]): boolean {
  const cursor = node.cursor();
  if (!cursor.next()) {
    // let's try to move directly to the children level and
    // return false immediately if the current node doesn't have any child
    return false;
  }
  let i = 0;

  do {
    if (cursor.type.id === child[i] || cursor.type.name === child[i]) {
      i++;
    }
  } while (i < child.length && cursor.nextSibling());

  return i >= child.length;
}


// TODO logic to find leaf / subNode has been changed comparing to codemirror-promql. We should report the changes
export function retrieveAllRecursiveNodes(parentNode: SyntaxNode | null, recursiveNode: number, ...leafs: number[]): SyntaxNode[] {
  const nodes: SyntaxNode[] = [];

  function recursiveRetrieveNode(node: SyntaxNode | null, nodes: SyntaxNode[]) {
    const subNode = node?.getChild(recursiveNode);
    for(const leaf of leafs) {
      const le = node?.getChild(leaf);
      if (le) {
        nodes.push(le);
      }
    }
    if (subNode && subNode.type.id === recursiveNode) {
      recursiveRetrieveNode(subNode, nodes);
    }
  }

  recursiveRetrieveNode(parentNode, nodes);
  return nodes;
}
