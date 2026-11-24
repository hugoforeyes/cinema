import type {VideoSource} from './types.js';
export function selectSource(sources:VideoSource[],provider:string):VideoSource|undefined{
 return sources.find(s=>s.provider===provider);
}
