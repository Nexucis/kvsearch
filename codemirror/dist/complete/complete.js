import { iterateAndCreateMissingChild, newRootNode } from './tree';
import { syntaxTree } from '@codemirror/language';
import { Identifier, Pattern, Query, QueryPath } from '../grammar/parser.terms';
import { objectList } from './objectlist';
import { retrieveAllRecursiveNodes, walkBackward } from '../parser/path-finder';
// ContextKind is the different possible value determinate by the autocompletion
export var ContextKind;
(function (ContextKind) {
    ContextKind[ContextKind["KeyPath"] = 0] = "KeyPath";
    ContextKind[ContextKind["Pattern"] = 1] = "Pattern";
    ContextKind[ContextKind["QueryOperator"] = 2] = "QueryOperator";
})(ContextKind || (ContextKind = {}));
function arrayToCompletionResult(data, from, to, span) {
    if (span === void 0) { span = true; }
    return {
        from: from,
        to: to,
        options: data,
        span: span ? /^[a-zA-Z0-9_:]+$/ : undefined
    };
}
function computeStartCompletePosition(node, pos) {
    var start = node.from;
    if (node.type.id === QueryPath) {
        start = pos;
    }
    return start;
}
function calculateQueryPath(state, node, pos) {
    var terms = retrieveAllRecursiveNodes(walkBackward(node, Query), QueryPath, Identifier);
    var decodedTerms = [];
    var depth = 0;
    var i = 0;
    for (var _i = 0, terms_1 = terms; _i < terms_1.length; _i++) {
        var term = terms_1[_i];
        decodedTerms.push(state.sliceDoc(term.from, term.to));
        if (node.type.id === Identifier && term.from === node.from && term.to === node.to) {
            depth = i;
        }
        else if (node.type.id === QueryPath && term.to === pos - 1) {
            // This case is quite particular. We are in this situation:
            // `labels.` where the cursor is after the dot.
            // The current node is a `QueryPath` and the tree looks like this: KVSearch(Expression(Query(QueryPath(Identifier,⚠),⚠))).
            // In this case there is basically no node that is matching the position of the cursor.
            // So an idea is to actually matched the first Identifier that is one position before (so in this case the Identifier matching `labels`).
            // And since we are at the next level in the tree we need to increase the depth to one point.
            depth = i + 1;
        }
        i++;
    }
    return { terms: decodedTerms, depth: depth };
}
export function analyzeCompletion(state, node, pos) {
    var result = [];
    switch (node.type.id) {
        case Pattern:
            // eslint-disable-next-line no-case-declarations
            var treeTerms = calculateQueryPath(state, node, pos);
            result.push({
                kind: ContextKind.Pattern,
                treeTerms: { terms: treeTerms.terms, depth: treeTerms.terms.length }
            });
            break;
        case Identifier:
        case QueryPath:
            // this is the usual case when user is typing the path/list of key that should be used for the search.
            // Like `labels.instance`.
            // Here we have to know what is currently requested to be autocompleted (with the example above: labels or instance).
            // In a later stage it will be used to give the position in the tres and change the list to complete.
            result.push({ kind: ContextKind.KeyPath, treeTerms: calculateQueryPath(state, node, pos) });
            break;
    }
    return result;
}
var Complete = /** @class */ (function () {
    function Complete() {
        this.tree = newRootNode(objectList);
        this.objectList = objectList;
    }
    Complete.prototype.kvSearch = function (context) {
        var state = context.state, pos = context.pos;
        var tree = syntaxTree(state).resolve(pos, -1);
        /*        syntaxTree(state).iterate({
                    enter(type: NodeType, from: number, to: number, get: () => SyntaxNode): false | void {
                        console.log(`${type.name} from ${from} to ${to}`)
                    }
                })*/
        var contexts = analyzeCompletion(state, tree, pos);
        var result = [];
        for (var _i = 0, contexts_1 = contexts; _i < contexts_1.length; _i++) {
            var context_1 = contexts_1[_i];
            switch (context_1.kind) {
                case ContextKind.KeyPath:
                    result = this.autocompleteQueryPath(result, context_1);
                    break;
                case ContextKind.Pattern:
                    result = this.autocompleteQueryPattern(result, context_1);
                    break;
            }
        }
        console.log("current node: ".concat(tree.name));
        console.log("current tree: ".concat(syntaxTree(state)));
        console.log("from ".concat(tree.from, " pos ").concat(pos));
        return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos);
    };
    Complete.prototype.autocompleteQueryPath = function (result, context) {
        var node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree);
        if (node !== null) {
            return result.concat(node.keys.map(function (value) { return ({ label: value, type: 'text' }); }));
        }
        else {
            return result;
        }
    };
    Complete.prototype.autocompleteQueryPattern = function (result, context) {
        var node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree);
        if (node !== null) {
            return result.concat(node.values.map(function (value) { return ({ label: value, type: 'text' }); }));
        }
        else {
            return result;
        }
    };
    return Complete;
}());
export { Complete };
