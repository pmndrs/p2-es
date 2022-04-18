import { Equation } from '../equations/Equation'
import { Material } from './Material'

export interface ContactMaterialOptions {
    friction?: number | undefined
    restitution?: number | undefined
    stiffness?: number | undefined
    relaxation?: number | undefined
    frictionStiffness?: number | undefined
    frictionRelaxation?: number | undefined
    surfaceVelocity?: number | undefined
}

/**
 * Defines what happens when two materials meet, such as what friction coefficient to use.
 * You can also set other things such as restitution, surface velocity and constraint parameters.
 *
 * Also see {@link Material}
 *
 * @example
 *     var ice = new Material();
 *     var wood = new Material();
 *     var iceWoodContactMaterial = new ContactMaterial(ice, wood, {
 *         friction: 0.2,
 *         restitution: 0.3
 *     });
 *     world.addContactMaterial(iceWoodContactMaterial);
 */
export class ContactMaterial {
    /**
     * The contact material identifier. Read only.
     */
    readonly id: number

    /**
     * First material participating in the contact material
     */
    materialA: Material

    /**
     * Second material participating in the contact material
     */
    materialB: Material

    /**
     * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
     * @default 0.3
     */
    friction: number

    /**
     * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
     * @default 0
     */
    restitution: number

    /**
     * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force.
     * Default value is {@link Equation.DEFAULT_STIFFNESS}
     */
    stiffness: number

    /**
     * Relaxation of the resulting ContactEquation that this ContactMaterial generate.
     * Default value is {@link Equation.DEFAULT_RELAXATION}
     */
    relaxation: number

    /**
     * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness.
     * Default value is {@link Equation.DEFAULT_STIFFNESS}
     */
    frictionStiffness: number

    /**
     * Relaxation of the resulting friction force. The default value should be good for most simulations.
     * Default value is {@link Equation.DEFAULT_RELAXATION}
     */
    frictionRelaxation: number

    /**
     * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
     */
    surfaceVelocity: number

    /**
     * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
     */
    contactSkinSize: number

    static idCounter = 0

    constructor(materialA: Material, materialB: Material, options?: ContactMaterialOptions) {
        options = options || {}

        if (!(materialA instanceof Material) || !(materialB instanceof Material)) {
            throw new Error('First two arguments must be Material instances.')
        }

        this.id = ContactMaterial.idCounter++

        this.materialA = materialA
        this.materialB = materialB

        this.friction = options.friction !== undefined ? options.friction : 0.3
        this.restitution = options.restitution !== undefined ? options.restitution : 0
        this.stiffness = options.stiffness !== undefined ? options.stiffness : Equation.DEFAULT_STIFFNESS
        this.relaxation = options.relaxation !== undefined ? options.relaxation : Equation.DEFAULT_RELAXATION
        this.frictionStiffness =
            options.frictionStiffness !== undefined ? options.frictionStiffness : Equation.DEFAULT_STIFFNESS
        this.frictionRelaxation =
            options.frictionRelaxation !== undefined ? options.frictionRelaxation : Equation.DEFAULT_RELAXATION
        this.surfaceVelocity = options.surfaceVelocity !== undefined ? options.surfaceVelocity : 0
        this.contactSkinSize = 0.005
    }
}
