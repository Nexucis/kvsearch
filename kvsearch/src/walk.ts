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

export interface WalkingPath {
    value: Record<string, unknown> | Record<string, unknown> [] | string | number;
    path: string[];
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function walkForArray(path: (string | RegExp)[], objs: Record<string, unknown>[], index: number, pathUsed: string[]): WalkingPath | WalkingPath[] | null {
    let result: WalkingPath[] = []
    for (const obj of objs) {
        const o = walk(path, obj, index, pathUsed.concat([]))
        if (o !== null) {
            if (Array.isArray(o)) {
                result = result.concat(o)
            } else {
                result.push(o)
            }
        }
    }
    if (result.length === 0) {
        return null
    } else if (result.length === 1) {
        return result[0];
    } else {
        return result
    }
}

export function walk<T>(path: (string | RegExp)[], obj: T, index = 0, pathUsed: string[] = []): WalkingPath | WalkingPath[] | null {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let currentObj: any = obj;
    for (let i = index; i < path.length; i++) {
        if (currentObj === null || currentObj === undefined || typeof currentObj !== 'object') {
            // in that case we cannot continue to walk through the object, since the current object is not an object or is null/undefined
            return null
        }
        if (Array.isArray(currentObj)) {
            return walkForArray(path, currentObj, i, pathUsed)
        }
        const matcher = path[i]
        if (typeof matcher === 'string') {
            if (currentObj[matcher] !== undefined) {
                pathUsed.push(matcher)
                currentObj = currentObj[matcher]
            } else {
                return null
            }
        } else {
            // matcher is a regexp, so we have to test every keys to get all possibilities
            // Since it's a tree of possibilities, we have to recall walk to retry from the beginning the new key
            let possibleObj: WalkingPath[] = []
            for (const key of Object.keys(currentObj)) {
                if (matcher.test(key)) {
                    // we create another array using a concat with an empty array in order to give a different reference
                    const possibility = walk(path, currentObj[key], i + 1, pathUsed.concat([key]))
                    if (possibility !== null) {
                        if (Array.isArray(possibility)) {
                            possibleObj = possibleObj.concat(possibility)
                        } else {
                            possibleObj.push(possibility)
                        }
                    }
                }
            }
            return possibleObj;
        }
    }
    return { path: pathUsed, value: currentObj }
}
