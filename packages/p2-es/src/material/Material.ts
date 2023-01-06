/**
 * Defines a physics material.
 *
 * To be used with {@link ContactMaterial}.
 *
 * @example
 *     // Create a wooden box
 *     var woodMaterial = new Material();
 *     var boxShape = new Box({
 *         material: woodMaterial
 *     });
 *     body.addShape(boxShape);
 */
export class Material {
    /**
     * The material identifier. Read only.
     */
    id: number

    /**
     * Id counter for materials
     */
    static idCounter = 0

    constructor() {
        this.id = Material.idCounter++
    }
}
