import { walk } from '@nexucis/kvsearch/dist/walk';
export function newRootNode(objects) {
    var keys = new Set();
    var i = 0;
    var indices = new Array(objects.length);
    for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
        var object = objects_1[_i];
        for (var _a = 0, _b = Object.keys(object); _a < _b.length; _a++) {
            var key = _b[_a];
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
        indices: indices
    };
}
export function iterateAndCreateMissingChild(depth, keyPath, objects, root) {
    var i = 0;
    var node = root;
    if (depth > keyPath.length) {
        return null;
    }
    while (i < depth) {
        var childKey = keyPath[i];
        if (childKey === undefined || node === null || !node.keys.includes(childKey)) {
            // in that case, it's impossible that node has a child matching this keyPath.
            return null;
        }
        // now let's find the child if it exists. In case it doesn't, we should create it.
        // Probably it wouldn't be super optimized for each child missing to create a complete node. Instead we should probably just create a node with the path.
        // Other fields could be completed only on demand.
        var hasBeenFound = false;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.name === childKey) {
                hasBeenFound = true;
                node = child;
                break;
            }
        }
        if (!hasBeenFound) {
            node = createChild(objects, node, childKey);
        }
        i++;
    }
    return node;
}
// createChild will create a new child according to its parent, the list of objects and the childKey requested.
// It's possible that there is no child created because the path doesn't match anything in the list of object.
// In that case, the function returns null.
function createChild(objects, parent, childKey) {
    var newPath = parent.path.concat(childKey);
    var keys = new Set();
    var values = new Set();
    var indices = [];
    for (var _i = 0, _a = parent.indices; _i < _a.length; _i++) {
        var index = _a[_i];
        var obj = walk(newPath, objects[index]);
        if (addKeys(obj, keys, values)) {
            indices.push(index);
        }
    }
    if (indices.length > 0 || values.size > 0) {
        var child = {
            name: childKey,
            path: newPath,
            indices: indices,
            children: [],
            keys: Array.from(keys),
            values: Array.from(values)
        };
        parent.children.push(child);
        return child;
    }
    else {
        return null;
    }
}
// addKeys is adding data in the result depending of the type of object.
// addKeys returns true if it adds something in the result. It returns false otherwise.
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function addKeys(obj, keys, values) {
    if (obj === undefined || obj === null) {
        return false;
    }
    else if (typeof obj === 'string') {
        // Here the object is a just a string so it means it's a value that should be used for the filtering equation not for the key.
        // So we shouldn't autocomplete it.
        values.add(obj);
        return false;
    }
    else if (Array.isArray(obj)) {
        var hasChanged = false;
        for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
            var subObj = obj_1[_i];
            hasChanged = hasChanged || addKeys(subObj, keys, values);
        }
        return hasChanged;
    }
    else if (typeof obj === 'object') {
        for (var _a = 0, _b = Object.keys(obj); _a < _b.length; _a++) {
            var key = _b[_a];
            keys.add(key);
            values.add(key);
        }
        return true;
    }
    else {
        return false;
    }
}
