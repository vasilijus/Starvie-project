// Handles gathering & inventory rewards

function rewardPlayer(player, rewards) {
    for (const [type, amount] of Object.entries(rewards)) {
        if (type === "xpReward") {
            player.addXP(amount);
        } else {
            player.inventory.addResource(type, amount);
        }
    }
}

export function harvestWorldResource(player, resource) {
    if (!resource?.canHarvest) return false;

    const harvested = resource.harvestResources();
    if (!harvested) return false;

    rewardPlayer(player, harvested);
    return true;
}

export function collectEnemyDrop(player, drop) {
    const amount = drop.collect();
    if (amount <= 0) return false;

    player.inventory.addResource(drop.type, amount);
    player.addXP(drop.xpReward);

    return drop.isCollected;
}
