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

function walkForArray(path: string[], index: number, objs: Array<any>): any | Array<any> | null {
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

export function walk(path: string[], obj: any, index = 0): any | Array<any> | null {
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
        for (const key in currentObj) {
            if (path[i] === key) {
                shouldMoveToNextKey = true
                currentObj = currentObj[key]
                break
            }
        }
        if (!shouldMoveToNextKey) {
            // we didn't find a key in the path used, so we should return null to indicate we didn't find what is searching.
            return null
        }
    }
    return currentObj
}
