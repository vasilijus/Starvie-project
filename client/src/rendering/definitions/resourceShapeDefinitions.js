import { getResourceVisualDefinition } from './resourceVisualDefinitions.js';

export function getResourceShapeDefinition(type) {
    const visual = getResourceVisualDefinition(type);
    return { kind: visual.kind };
}
