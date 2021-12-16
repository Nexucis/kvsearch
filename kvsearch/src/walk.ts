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

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function walkForArray(path: (string | RegExp)[], index: number, objs: Array<any>): any | Array<any> | null {
    const result = []
    for (const obj of objs) {
        const o = walk(path, obj, index)
        if (o !== null && o !== undefined) {
            result.push(o)
        }
    }
    if (result.length === 1) {
        // it would avoid the annoying array of array of array just for one result
        return result[0]
    } else if (result.length === 0) {
        return null
    } else {
        return result
    }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function walk(path: (string | RegExp)[], obj: any, index = 0): any | Array<any> | null {
    let currentObj = obj;
    for (let i = index; i < path.length; i++) {
        let shouldMoveToNextKey = false
        if (currentObj === null || currentObj === undefined || typeof currentObj !== 'object') {
            // in that case we cannot continue to walk through the object, since the current object is not an object or is null/undefined
            return null
        }
        if (Array.isArray(currentObj)) {
            return walkForArray(path, i, currentObj)
        }
        const matcher = path[i]
        if (typeof matcher === 'string') {
            for (const key in currentObj) {
                if (matcher === key) {
                    shouldMoveToNextKey = true
                    currentObj = currentObj[key]
                    break
                }
            }
        } else if (matcher !== undefined) {
            // matcher is a regexp so we have to test every keys to get all possibilities
            // Since it's a tree of possibilities, we have to recall walk to retry from the beginning the new key
            const possibleObj = []
            for (const key of Object.keys(currentObj)) {
                if (matcher.test(key)) {
                    const possibility = walk(path, currentObj[key], i + 1)
                    if (possibility !== null && possibility !== undefined) {
                        possibleObj.push(possibility)
                    }
                }
            }
            return possibleObj;
        }


        if (!shouldMoveToNextKey) {
            // we didn't find a key in the path used, so we should return null to indicate we didn't find what is searching.
            return null
        }
    }
    return currentObj
}
