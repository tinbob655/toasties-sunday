interface extra {
    name: string,
    cost: number,
}

export interface courseObj {
    base: {
        baseCost: number,
        baseDescription: string,
    } | null,
    extras: extra[],
}