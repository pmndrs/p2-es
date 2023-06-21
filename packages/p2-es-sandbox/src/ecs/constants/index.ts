const createStages = <T extends Array<string>>(steps: [...T]) => {
    const schedule: Partial<Record<T[number], number>> = {}

    for (let i = 0; i < steps.length; i++) {
        schedule[steps[i]] = i
    }

    return schedule as Record<T[number], number>
}

export const STAGES = createStages([
    'SANDBOX_HANDLERS',
    'PHYSICS',
    'RENDER_BODIES',
    'RENDER_SPRINGS',
    'RENDER_AABBS',
    'RENDER_CONTACTS',
    'RENDER_TOOL',
])
