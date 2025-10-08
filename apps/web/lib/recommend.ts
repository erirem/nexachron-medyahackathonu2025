import type { ProfileVector, Reel, ReelCategory } from './types/reels';

// In-memory client stub for profile vector. In real app this would live in a store.
let profileVector: ProfileVector = {};

export function getProfileVector(): ProfileVector {
    return profileVector;
}

export function resetProfileVector() {
    profileVector = {};
}

function bump(category: ReelCategory, amount: number) {
    const current = profileVector[category] ?? 0;
    profileVector = { ...profileVector, [category]: current + amount };
}

export function onReaction(reel: Reel, delta: 1 | -1) {
    bump(reel.category, delta);
}

export function onWatchComplete(reel: Reel) {
    bump(reel.category, 1);
}

export function onSkip(reel: Reel) {
    bump(reel.category, -1);
}

// Serialize vector to pass via querystring
export function serializeProfileVector(vector: ProfileVector = profileVector): string {
    try {
        return encodeURIComponent(JSON.stringify(vector));
    } catch {
        return encodeURIComponent('{}');
    }
}

export function deserializeProfileVector(encoded: string | undefined): ProfileVector {
    if (!encoded) return {};
    try {
        return JSON.parse(decodeURIComponent(encoded));
    } catch {
        return {};
    }
}


