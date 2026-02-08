export default class CraftingRules {
    // simple recipe list
    constructor() {
        this.recipes = [
            {
                name: 'Wooden Axe',
                ingredients: { wood: 10 },
                craftTime: 2, // seconds
                result: { name: 'Wooden Axe', type: 'axe', count: 1 }
            },
            {
                name: 'Wooden Sword',
                ingredients: { wood: 10, stone: 10 },
                craftTime: 3,
                result: { name: 'Wooden Sword', type: 'sword', count: 1 }
            }
        ];
    }

    getRecipes() {
        return this.recipes;
    }

    canCraft(player, recipe) {
        if (!recipe) return false;
        const inv = player.inventory || {};
        return Object.entries(recipe.ingredients).every(([k, v]) => (inv[k] || 0) >= v);
    }

    // attempt craft by recipe index; mutates player.inventory and returns result object or null
    attemptCraft(player, recipeIndex) {
        const r = this.recipes[recipeIndex];
        if (!r || !this.canCraft(player, r)) return null;
        // subtract ingredients
        player.inventory = player.inventory || {};
        for (const [k, v] of Object.entries(r.ingredients)) {
            player.inventory[k] = Math.max(0, (player.inventory[k] || 0) - v);
        }
        // add result to inventory by name
        const resName = r.result.name || r.result.type;
        player.inventory[resName] = (player.inventory[resName] || 0) + (r.result.count || 1);
        return r.result;
    }
}
