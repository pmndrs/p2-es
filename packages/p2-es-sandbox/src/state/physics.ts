import * as p2 from 'p2-es'
import { create } from 'zustand'

export const usePhysicsWorldStore = create<{ world: p2.World | null }>(() => ({ world: null }))
