declare module "src/types/index" {
    export type Point = [number, number];
    export type Polygon = Point[];
    export type Vec2 = number[] | [number, number] | Float32Array;
}
declare module "src/utils/Utils" {
    export class Utils {
        static ARRAY_TYPE: new (n: number) => Float32Array | number[];
        static appendArray(a: any[], b: any[]): void;
        static splice(array: any[], index: number, howmany?: number): void;
        static arrayRemove(array: any[], element: any): void;
        static extend(a: any, b: any): void;
        static shallowClone(obj: any): {};
    }
}
declare module "src/math/vec2" {
    import type { Vec2 } from "src/types/index";
    export function crossLength(a: Vec2, b: Vec2): number;
    export function crossVZ(out: Vec2, vec: Vec2, zcomp: number): Vec2;
    export function crossZV(out: Vec2, zcomp: number, vec: Vec2): Vec2;
    export function rotate(out: Vec2, a: Vec2, angle: number): Vec2;
    export function rotate90cw(out: Vec2, a: Vec2): Vec2;
    export function toLocalFrame(out: Vec2, worldPoint: Vec2, framePosition: Vec2, frameAngle: number): Vec2;
    export function toGlobalFrame(out: Vec2, localPoint: Vec2, framePosition: Vec2, frameAngle: number): void;
    export function vectorToLocalFrame(out: Vec2, worldVector: Vec2, frameAngle: number): Vec2;
    export const vectorToGlobalFrame: typeof rotate;
    export function centroid(out: Vec2, a: Vec2, b: Vec2, c: Vec2): Vec2;
    export function create(): Vec2;
    export function clone(a: Vec2): Vec2;
    export function fromValues(x: number, y: number): Vec2;
    export function copy(out: Vec2, a: Vec2): Vec2;
    export function set(out: Vec2, x: number, y: number): Vec2;
    export function add(out: Vec2, a: Vec2, b: Vec2): Vec2;
    export function subtract(out: Vec2, a: Vec2, b: Vec2): Vec2;
    export function multiply(out: Vec2, a: Vec2, b: Vec2): Vec2;
    export function divide(out: Vec2, a: Vec2, b: Vec2): Vec2;
    export function scale(out: Vec2, a: Vec2, b: number): Vec2;
    export function distance(a: Vec2, b: Vec2): number;
    export function squaredDistance(a: Vec2, b: Vec2): number;
    export function length(a: Vec2): number;
    export function squaredLength(a: Vec2): number;
    export function negate(out: Vec2, a: Vec2): Vec2;
    export function normalize(out: Vec2, a: Vec2): Vec2;
    export function dot(a: Vec2, b: Vec2): number;
    export function str(a: Vec2): string;
    export function lerp(out: Vec2, a: Vec2, b: Vec2, t: number): Vec2;
    export function reflect(out: Vec2, vector: Vec2, normal: Vec2): Vec2;
    export function getLineSegmentsIntersection(out: Vec2, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): boolean;
    export function getLineSegmentsIntersectionFraction(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): number;
}
declare module "src/material/Material" {
    export class Material {
        readonly id: number;
        static idCounter: number;
        constructor();
    }
}
declare module "src/shapes/Shape" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Material } from "src/material/Material";
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    export interface SharedShapeOptions {
        position?: Vec2;
        angle?: number;
        collisionGroup?: number;
        collisionMask?: number;
        sensor?: boolean;
        collisionResponse?: boolean;
        material?: Material;
    }
    export interface ShapeOptions extends SharedShapeOptions {
        type?: typeof Shape.CIRCLE | typeof Shape.PARTICLE | typeof Shape.PLANE | typeof Shape.CONVEX | typeof Shape.LINE | typeof Shape.BOX | typeof Shape.CAPSULE | typeof Shape.HEIGHTFIELD | undefined;
    }
    export abstract class Shape {
        body: Body | null;
        position: Vec2;
        angle: number;
        type: typeof Shape.CIRCLE | typeof Shape.PARTICLE | typeof Shape.PLANE | typeof Shape.CONVEX | typeof Shape.LINE | typeof Shape.BOX | typeof Shape.CAPSULE | typeof Shape.HEIGHTFIELD;
        readonly id: number;
        boundingRadius: number;
        collisionGroup: number;
        collisionResponse: boolean;
        collisionMask: number;
        material: Material | null;
        area: number;
        sensor: boolean;
        static idCounter: number;
        static CIRCLE: number;
        static PARTICLE: number;
        static PLANE: number;
        static CONVEX: number;
        static LINE: number;
        static BOX: number;
        static CAPSULE: number;
        static HEIGHTFIELD: number;
        constructor({ angle, type, collisionGroup, collisionResponse, collisionMask, material, sensor, ...rest }: ShapeOptions);
        abstract computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        updateArea(): void;
        abstract computeAABB(out?: AABB, position?: Vec2, angle?: number): void;
        raycast(_result: RaycastResult, _ray: Ray, _position: Vec2, _angle: number): void;
        pointTest(_localPoint: Vec2): boolean;
        worldPointToLocal: (out: Vec2, worldPoint: Vec2) => Vec2;
    }
}
declare module "src/collision/RaycastResult" {
    import type { Vec2 } from "src/types/index";
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    import { Ray } from "src/collision/Ray";
    export class RaycastResult {
        normal: Vec2;
        shape: Shape | null;
        body: Body | null;
        faceIndex: number;
        fraction: number;
        isStopped: boolean;
        constructor();
        reset(): void;
        getHitDistance(ray: Ray): number;
        hasHit(): boolean;
        getHitPoint(out: Vec2, ray: Ray): Vec2;
        stop(): void;
        shouldStop(ray: Ray): boolean;
        set(normal: Vec2, shape: Shape, body: Body, fraction: number, faceIndex: number): void;
    }
}
declare module "src/events/EventEmitter" {
    export class EventEmitter {
        private tmpArray;
        private _listeners;
        on<E>(type: string, listener: (e: E) => void, context?: any): this;
        off(type: string, listener: Function): EventEmitter;
        has(type: string, listener?: Function): boolean;
        emit<T extends {
            type: string;
        }>(event: T): this;
    }
}
declare module "src/math/polyk" {
    export function getArea(p: number[]): number;
    export function triangulate(p: number[]): number[];
}
declare module "src/shapes/Convex" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export interface ConvexOptions extends SharedShapeOptions {
        vertices?: Vec2[];
        axes?: Vec2[];
        type?: number;
    }
    export class Convex extends Shape {
        vertices: Vec2[];
        axes: Vec2[];
        normals: Vec2[];
        centerOfMass: Vec2;
        triangles: Vec2[];
        boundingRadius: number;
        constructor({ vertices, axes, ...rest }: ConvexOptions);
        updateNormals(): void;
        projectOntoLocalAxis(localAxis: Vec2, result: Vec2): void;
        projectOntoWorldAxis(localAxis: Vec2, shapeOffset: Vec2, shapeAngle: number, result: Vec2): void;
        updateTriangles(): void;
        updateCenterOfMass(): void;
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        updateArea(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
        pointTest(localPoint: Vec2): boolean;
        static triangleArea(a: Vec2, b: Vec2, c: Vec2): number;
    }
}
declare module "src/collision/Broadphase" {
    import type { AABB } from "src/collision/AABB";
    import { Body } from "src/objects/Body";
    import type { World } from "src/world/World";
    export abstract class Broadphase {
        static AABB: 1;
        static BOUNDING_CIRCLE: 2;
        static NAIVE: 1;
        static SAP: 2;
        static boundingRadiusCheck(bodyA: Body, bodyB: Body): boolean;
        static aabbCheck(bodyA: Body, bodyB: Body): boolean;
        static canCollide(bodyA: Body, bodyB: Body): boolean;
        type: typeof Broadphase.NAIVE | typeof Broadphase.SAP;
        result: Body[];
        world?: World;
        boundingVolumeType: typeof Broadphase.AABB | typeof Broadphase.BOUNDING_CIRCLE;
        constructor(type: typeof Broadphase.NAIVE | typeof Broadphase.SAP);
        abstract getCollisionPairs(world: World): Body[];
        abstract aabbQuery(world?: World, aabb?: AABB, result?: Body[]): Body[];
        setWorld(world: World): void;
        boundingVolumeCheck(bodyA: Body, bodyB: Body): boolean;
    }
}
declare module "src/shapes/Heightfield" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export interface HeightfieldOptions extends SharedShapeOptions {
        heights?: number[];
        minValue?: number;
        maxValue?: number;
        elementWidth?: number;
    }
    export class Heightfield extends Shape {
        heights: number[];
        maxValue: number | undefined;
        minValue: number | undefined;
        elementWidth: number;
        constructor({ heights, elementWidth, ...rest }: HeightfieldOptions);
        updateMaxMinValues(): void;
        computeMomentOfInertia(): number;
        updateArea(): void;
        computeAABB(out: AABB, position: [number, number], angle: number): void;
        getLineSegment(start: Vec2, end: Vec2, i: number): void;
        getSegmentIndex(position: Vec2): number;
        getClampedSegmentIndex(position: Vec2): number;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
    }
}
declare module "src/shapes/Circle" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export interface CircleOptions extends SharedShapeOptions {
        radius?: number;
    }
    export class Circle extends Shape {
        radius: number;
        constructor({ radius, ...rest }: CircleOptions);
        updateBoundingRadius(): void;
        computeMomentOfInertia(): number;
        updateArea(): void;
        computeAABB(out: AABB, position: Vec2): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "src/equations/Equation" {
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    export class Equation {
        static DEFAULT_STIFFNESS: number;
        static DEFAULT_RELAXATION: number;
        enabled: boolean;
        minForce: number;
        maxForce: number;
        maxBias: number;
        bodyA: Body;
        bodyB: Body;
        stiffness: number;
        relaxation: number;
        G: Vec2;
        needsUpdate: boolean;
        multiplier: number;
        relativeVelocity: number;
        epsilon: number;
        timeStep: number;
        offset: number;
        invC: number;
        a: number;
        b: number;
        B: number;
        lambda: number;
        index: number;
        minForceDt: number;
        maxForceDt: number;
        constructor(bodyA: Body, bodyB: Body, minForce: number, maxForce: number);
        update(): void;
        gmult(G: Vec2, vi: Vec2, wi: number, vj: Vec2, wj: number): number;
        computeB(a: number, b: number, h: number): number;
        computeGq(): number;
        computeGW(): number;
        computeGWlambda(): number;
        computeGiMf(): number;
        computeGiMGt(): number;
        addToWlambda(deltalambda: number): void;
        computeInvC(eps: number): number;
    }
}
declare module "src/equations/ContactEquation" {
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    import type { Vec2 } from "src/types/index";
    import { Equation } from "src/equations/Equation";
    export class ContactEquation extends Equation {
        contactPointA: Vec2;
        penetrationVec: Vec2;
        contactPointB: Vec2;
        normalA: Vec2;
        restitution: number;
        firstImpact: boolean;
        shapeA: Shape;
        shapeB: Shape;
        constructor(bodyA: Body, bodyB: Body);
        computeB(a: number, b: number, h: number): number;
        getVelocityAlongNormal(): number;
    }
}
declare module "src/equations/FrictionEquation" {
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    import type { Vec2 } from "src/types/index";
    import type { ContactEquation } from "src/equations/ContactEquation";
    import { Equation } from "src/equations/Equation";
    export class FrictionEquation extends Equation {
        contactPointA: Vec2;
        contactPointB: Vec2;
        t: Vec2;
        contactEquations: ContactEquation[];
        shapeA: Shape | null;
        shapeB: Shape | null;
        frictionCoefficient: number;
        constructor(bodyA: Body, bodyB: Body, slipForce: number);
        setSlipForce(slipForce: number): void;
        getSlipForce(): number;
        computeB(a: number, b: number, h: number): number;
    }
}
declare module "src/material/ContactMaterial" {
    import { Material } from "src/material/Material";
    export interface ContactMaterialOptions {
        friction?: number | undefined;
        restitution?: number | undefined;
        stiffness?: number | undefined;
        relaxation?: number | undefined;
        frictionStiffness?: number | undefined;
        frictionRelaxation?: number | undefined;
        surfaceVelocity?: number | undefined;
    }
    export class ContactMaterial {
        readonly id: number;
        materialA: Material;
        materialB: Material;
        friction: number;
        restitution: number;
        stiffness: number;
        relaxation: number;
        frictionStiffness: number;
        frictionRelaxation: number;
        surfaceVelocity: number;
        contactSkinSize: number;
        static idCounter: number;
        constructor(materialA: Material, materialB: Material, options?: ContactMaterialOptions);
    }
}
declare module "src/shapes/Box" {
    import type { AABB } from "src/collision/AABB";
    import type { Vec2 } from "src/types/index";
    import { Convex } from "src/shapes/Convex";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    export interface BoxOptions extends SharedShapeOptions {
        width?: number;
        height?: number;
    }
    export class Box extends Convex {
        width: number;
        height: number;
        constructor({ width, height, ...rest }: BoxOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        updateArea(): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "src/shapes/Capsule" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export interface CapsuleOptions extends SharedShapeOptions {
        length?: number;
        radius?: number;
    }
    export class Capsule extends Shape {
        length: number;
        radius: number;
        constructor({ length, radius, ...rest }: CapsuleOptions);
        computeMomentOfInertia(): number;
        updateArea(): void;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "src/shapes/Line" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export interface LineOptions extends SharedShapeOptions {
        length?: number;
    }
    export class Line extends Shape {
        length: number;
        constructor({ length, ...rest }: LineOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
    }
}
declare module "src/shapes/Particle" {
    import type { AABB } from "src/collision/AABB";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export class Particle extends Shape {
        constructor(options?: SharedShapeOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: [number, number]): void;
    }
}
declare module "src/shapes/Plane" {
    import type { AABB } from "src/collision/AABB";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Vec2 } from "src/types/index";
    import type { SharedShapeOptions } from "src/shapes/Shape";
    import { Shape } from "src/shapes/Shape";
    export class Plane extends Shape {
        constructor(options?: SharedShapeOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        updateArea(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "src/utils/Pool" {
    export interface PoolOptions {
        size?: number | undefined;
    }
    export abstract class Pool<T> {
        objects: T[];
        constructor(options?: PoolOptions);
        abstract create(): T;
        abstract destroy(object: T): void;
        resize(size: number): this;
        get(): T;
        release(object: T): this;
    }
}
declare module "src/utils/ContactEquationPool" {
    import { ContactEquation } from "src/equations/ContactEquation";
    import { Pool } from "src/utils/Pool";
    export class ContactEquationPool extends Pool<ContactEquation> {
        create(): ContactEquation;
        destroy(equation: ContactEquation): ContactEquationPool;
    }
}
declare module "src/utils/FrictionEquationPool" {
    import { FrictionEquation } from "src/equations/FrictionEquation";
    import { Pool } from "src/utils/Pool";
    export class FrictionEquationPool extends Pool<FrictionEquation> {
        create(): FrictionEquation;
        destroy(equation: FrictionEquation): FrictionEquationPool;
    }
}
declare module "src/utils/TupleDictionary" {
    export class TupleDictionary<T> {
        data: {
            [id: string]: T;
        };
        keys: number[];
        getKey(id1: number, id2: number): number;
        getByKey(key: number): T;
        get(i: number, j: number): T;
        set(i: number, j: number, value: T): number;
        reset(): void;
        copy(dict: TupleDictionary<T>): void;
    }
}
declare module "src/collision/Narrowphase" {
    import type { Heightfield } from "src/shapes/Heightfield";
    import type { ContactEquation } from "src/equations/ContactEquation";
    import type { FrictionEquation } from "src/equations/FrictionEquation";
    import type { ContactMaterial } from "src/material/ContactMaterial";
    import type { Body } from "src/objects/Body";
    import { Box } from "src/shapes/Box";
    import type { Capsule } from "src/shapes/Capsule";
    import { Circle } from "src/shapes/Circle";
    import { Convex } from "src/shapes/Convex";
    import type { Line } from "src/shapes/Line";
    import type { Particle } from "src/shapes/Particle";
    import type { Plane } from "src/shapes/Plane";
    import { Shape } from "src/shapes/Shape";
    import type { Vec2 } from "src/types/index";
    import { ContactEquationPool } from "src/utils/ContactEquationPool";
    import { FrictionEquationPool } from "src/utils/FrictionEquationPool";
    import { TupleDictionary } from "src/utils/TupleDictionary";
    export class Narrowphase {
        contactEquations: ContactEquation[];
        frictionEquations: FrictionEquation[];
        enableFriction: boolean;
        enabledEquations: boolean;
        slipForce: number;
        contactEquationPool: ContactEquationPool;
        frictionEquationPool: FrictionEquationPool;
        enableFrictionReduction: boolean;
        collidingBodiesLastStep: TupleDictionary<boolean>;
        currentContactMaterial: ContactMaterial | null;
        constructor();
        bodiesOverlap(bodyA: Body, bodyB: Body, checkCollisionMasks?: boolean): boolean;
        collidedLastStep(bodyA: Body, bodyB: Body): boolean;
        reset(): void;
        createContactEquation(bodyA: Body, bodyB: Body, shapeA: Shape, shapeB: Shape): ContactEquation;
        createFrictionEquation(bodyA: Body, bodyB: Body, shapeA: Shape, shapeB: Shape): FrictionEquation;
        createFrictionFromContact(c: ContactEquation): FrictionEquation;
        createFrictionFromAverage(numContacts: number): FrictionEquation;
        convexLine: (_convexBody: Body, _convexShape: Convex, _convexOffset: Vec2, _convexAngle: number, _lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _justTest: boolean) => number;
        lineBox: (_lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _boxBody: Body, _boxShape: Box, _boxOffset: Vec2, _boxAngle: number, _justTest: boolean) => number;
        convexCapsule: (convexBody: Body, convexShape: Convex, convexPosition: Vec2, convexAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest: boolean) => number;
        lineCapsule: (_lineBody: Body, _lineShape: Line, _linePosition: Vec2, _lineAngle: number, _capsuleBody: Body, _capsuleShape: Capsule, _capsulePosition: Vec2, _capsuleAngle: number, _justTest: boolean) => number;
        capsuleCapsule: (bi: Body, si: Capsule, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest: boolean) => number;
        lineLine: (_bodyA: Body, _shapeA: Line, _positionA: Vec2, _angleA: number, _bodyB: Body, _shapeB: Line, _positionB: Vec2, _angleB: number, _justTest: boolean) => number;
        planeLine: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest: boolean) => number;
        particleCapsule: (particleBody: Body, particleShape: Particle, particlePosition: Vec2, particleAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest: boolean) => number;
        circleLine: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, circleAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest: boolean, lineRadius: number, circleRadius: number) => number;
        circleCapsule: (bi: Body, si: Circle, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest: boolean) => number;
        circleConvex: (circleBody: Body, circleShape: Circle | Capsule, circleOffset: Vec2, circleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest: boolean, circleRadius: number) => number;
        particleConvex: (particleBody: Body, particleShape: Particle, particleOffset: Vec2, particleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest: boolean) => number;
        circleCircle: (bodyA: Body, shapeA: Circle | Capsule, offsetA: Vec2, angleA: number, bodyB: Body, shapeB: Circle | Capsule, offsetB: Vec2, angleB: number, justTest: boolean, radiusA: number, radiusB: number) => number;
        planeConvex: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest: boolean) => number;
        particlePlane: (particleBody: Body, particleShape: Particle, particleOffset: Vec2, particleAngle: number, planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, justTest: boolean) => number;
        circleParticle: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, circleAngle: number, particleBody: Body, particleShape: Particle, particleOffset: Vec2, particleAngle: number, justTest: boolean) => number;
        planeCapsule: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsuleOffset: Vec2, capsuleAngle: number, justTest: boolean) => number;
        circlePlane: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, circleAngle: number, planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, justTest: boolean) => number;
        convexConvex: (bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest: boolean) => number;
        circleHeightfield: (circleBody: Body, circleShape: Circle, circlePos: Vec2, circleAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, hfAngle: number, justTest: boolean, radius: number) => number;
        convexHeightfield: (convexBody: Body, convexShape: Convex, convexPos: Vec2, convexAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, hfAngle: number, justTest: boolean) => number;
        narrowphases: {
            [x: number]: ((_lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _boxBody: Body, _boxShape: Box, _boxOffset: Vec2, _boxAngle: number, _justTest: boolean) => number) | ((convexBody: Body, convexShape: Convex, convexPosition: Vec2, convexAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest: boolean) => number) | ((bi: Body, si: Capsule, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest: boolean) => number) | ((circleBody: Body, circleShape: Circle, circleOffset: Vec2, circleAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest: boolean, lineRadius: number, circleRadius: number) => number) | ((bi: Body, si: Circle, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest: boolean) => number) | ((circleBody: Body, circleShape: Circle | Capsule, circleOffset: Vec2, circleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest: boolean, circleRadius: number) => number) | ((particleBody: Body, particleShape: Particle, particleOffset: Vec2, particleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest: boolean) => number) | ((bodyA: Body, shapeA: Circle | Capsule, offsetA: Vec2, angleA: number, bodyB: Body, shapeB: Circle | Capsule, offsetB: Vec2, angleB: number, justTest: boolean, radiusA: number, radiusB: number) => number) | ((circleBody: Body, circleShape: Circle, circleOffset: Vec2, circleAngle: number, particleBody: Body, particleShape: Particle, particleOffset: Vec2, particleAngle: number, justTest: boolean) => number) | ((bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest: boolean) => number) | ((circleBody: Body, circleShape: Circle, circlePos: Vec2, circleAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, hfAngle: number, justTest: boolean, radius: number) => number) | ((convexBody: Body, convexShape: Convex, convexPos: Vec2, convexAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, hfAngle: number, justTest: boolean) => number);
        };
    }
}
declare module "src/collision/SAPBroadphase" {
    import type { AABB } from "src/collision/AABB";
    import type { Body } from "src/objects/Body";
    import type { World } from "src/world/World";
    import { Broadphase } from "src/collision/Broadphase";
    export class SAPBroadphase extends Broadphase {
        axisList: Body[];
        axisIndex: number;
        private addBodyHandler;
        private removeBodyHandler;
        constructor();
        setWorld(world: World): void;
        sortList(): void;
        getCollisionPairs(_world: World): Body[];
        aabbQuery(world: World, aabb: AABB, result?: Body[]): Body[];
    }
}
declare module "src/constraints/Constraint" {
    import type { Equation } from "src/equations/Equation";
    import type { Body } from "src/objects/Body";
    export interface ConstraintOptions {
        collideConnected?: boolean;
        wakeUpBodies?: boolean;
    }
    export class Constraint {
        static OTHER: number;
        static DISTANCE: number;
        static GEAR: number;
        static LOCK: number;
        static PRISMATIC: number;
        static REVOLUTE: number;
        type: typeof Constraint.DISTANCE | typeof Constraint.GEAR | typeof Constraint.LOCK | typeof Constraint.PRISMATIC | typeof Constraint.REVOLUTE | typeof Constraint.OTHER;
        equations: Equation[];
        bodyA: Body;
        bodyB: Body;
        collideConnected: boolean;
        constructor(bodyA: Body, bodyB: Body, type: typeof Constraint.DISTANCE | typeof Constraint.GEAR | typeof Constraint.LOCK | typeof Constraint.PRISMATIC | typeof Constraint.REVOLUTE | typeof Constraint.OTHER, options?: ConstraintOptions);
        update(): void;
        setStiffness(stiffness: number): void;
        setRelaxation(relaxation: number): void;
        setMaxBias(maxBias: number): void;
    }
}
declare module "src/objects/Spring" {
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    export interface SpringOptions {
        stiffness?: number;
        damping?: number;
        localAnchorA?: Vec2;
        localAnchorB?: Vec2;
        worldAnchorA?: Vec2;
        worldAnchorB?: Vec2;
    }
    export abstract class Spring {
        stiffness: number;
        damping: number;
        bodyA: Body;
        bodyB: Body;
        constructor(bodyA: Body, bodyB: Body, options?: SpringOptions);
        abstract applyForce(): void;
    }
}
declare module "src/solver/Solver" {
    import type { Equation } from "src/equations/Equation";
    import { EventEmitter } from "src/events/EventEmitter";
    import type { World } from "src/world/World";
    export interface SolverOptions {
        equationSortFunction?: (a: Equation, b: Equation) => number;
    }
    export abstract class Solver extends EventEmitter {
        static GS: 1;
        type: number;
        equations: Equation[];
        equationSortFunction?: (a: Equation, b: Equation) => number;
        constructor(options: SolverOptions | undefined, type: typeof Solver.GS);
        abstract solve(dt: number, world: World): void;
        sortEquations(): void;
        addEquation(eq: Equation): void;
        addEquations(eqs: Equation[]): void;
        removeEquation(eq: Equation): void;
        removeAllEquations(): void;
    }
}
declare module "src/solver/GSSolver" {
    import type { World } from "src/world/World";
    import type { SolverOptions } from "src/solver/Solver";
    import { Solver } from "src/solver/Solver";
    export interface GSSolverOptions extends SolverOptions {
        iterations?: number | undefined;
        tolerance?: number | undefined;
        frictionIterations?: number | undefined;
    }
    export class GSSolver extends Solver {
        type: 1;
        iterations: number;
        tolerance: number;
        frictionIterations: number;
        usedIterations: number;
        constructor(options?: GSSolverOptions);
        solve(h: number, world: World): void;
    }
}
declare module "src/utils/OverlapKeeperRecord" {
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    export class OverlapKeeperRecord {
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
        constructor(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape);
        set(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void;
    }
}
declare module "src/utils/OverlapKeeperRecordPool" {
    import { OverlapKeeperRecord } from "src/utils/OverlapKeeperRecord";
    import { Pool } from "src/utils/Pool";
    export class OverlapKeeperRecordPool extends Pool<OverlapKeeperRecord> {
        create(): OverlapKeeperRecord;
        destroy(record: OverlapKeeperRecord): OverlapKeeperRecordPool;
    }
}
declare module "src/utils/OverlapKeeper" {
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    import type { OverlapKeeperRecord } from "src/utils/OverlapKeeperRecord";
    import { OverlapKeeperRecordPool } from "src/utils/OverlapKeeperRecordPool";
    import { TupleDictionary } from "src/utils/TupleDictionary";
    export class OverlapKeeper {
        recordPool: OverlapKeeperRecordPool;
        overlappingShapesLastState: TupleDictionary<OverlapKeeperRecord>;
        overlappingShapesCurrentState: TupleDictionary<OverlapKeeperRecord>;
        tmpDict: TupleDictionary<OverlapKeeperRecord>;
        tmpArray1: any[];
        constructor();
        tick(): void;
        bodiesAreOverlapping(bodyA: Body, bodyB: Body): boolean;
        setOverlapping(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void;
        getNewOverlaps(result: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        getEndOverlaps(result: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        getDiff(dictA: TupleDictionary<OverlapKeeperRecord>, dictB: TupleDictionary<OverlapKeeperRecord>, result: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        isNewOverlap(shapeA: Shape, shapeB: Shape): boolean;
        getNewBodyOverlaps(result: Body[]): Body[];
        getEndBodyOverlaps(result: Body[]): Body[];
        getBodyDiff(overlaps: OverlapKeeperRecord[], result?: Body[]): Body[];
    }
}
declare module "src/world/UnionFind" {
    export class UnionFind {
        id: number[];
        sz: number[];
        size: number;
        count: number;
        constructor(size: number);
        resize(size: number): void;
        find(p: number): number;
        union(p: number, q: number): void;
    }
}
declare module "src/world/World" {
    import type { Broadphase } from "src/collision/Broadphase";
    import { Narrowphase } from "src/collision/Narrowphase";
    import type { Ray } from "src/collision/Ray";
    import type { RaycastResult } from "src/collision/RaycastResult";
    import type { Constraint } from "src/constraints/Constraint";
    import type { ContactEquation } from "src/equations/ContactEquation";
    import type { FrictionEquation } from "src/equations/FrictionEquation";
    import { EventEmitter } from "src/events/EventEmitter";
    import { ContactMaterial } from "src/material/ContactMaterial";
    import { Material } from "src/material/Material";
    import { Body } from "src/objects/Body";
    import type { Spring } from "src/objects/Spring";
    import { Shape } from "src/shapes/Shape";
    import type { Solver } from "src/solver/Solver";
    import type { Vec2 } from "src/types/index";
    import { OverlapKeeper } from "src/utils/OverlapKeeper";
    export type PostStepEvent = {
        type: 'postStep';
    };
    export type AddBodyEvent = {
        type: 'addBody';
        body: Body;
    };
    export type RemoveBodyEvent = {
        type: 'removeBody';
        body: Body;
    };
    export type AddSpringEvent = {
        type: 'addSpring';
        spring: Spring;
    };
    export type ImpactEvent = {
        type: 'impact';
        bodyA: Body;
        bodyB: Body;
        shapeA: Shape;
        shapeB: Shape;
        contactEquation: ContactEquation;
    };
    export type PostBroadphaseEvent = {
        type: 'postBroadphase';
        pairs: Body[];
    };
    export type BeginContactEvent = {
        type: 'beginContact';
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
        contactEquations: ContactEquation[];
    };
    export type EndContactEvent = {
        type: 'endContact';
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
    };
    export type PreSolveEvent = {
        type: 'preSolve';
        contactEquations: ContactEquation[];
        frictionEquations: FrictionEquation[];
    };
    export interface WorldOptions {
        solver?: Solver | undefined;
        gravity?: [number, number] | undefined;
        broadphase?: Broadphase | undefined;
        islandSplit?: boolean | undefined;
    }
    export class World extends EventEmitter {
        static NO_SLEEPING: number;
        static BODY_SLEEPING: 2;
        static ISLAND_SLEEPING: 4;
        springs: Spring[];
        bodies: Body[];
        solver: Solver;
        narrowphase: Narrowphase;
        gravity: Vec2;
        frictionGravity: number;
        useWorldGravityAsFrictionGravity: boolean;
        useFrictionGravityOnZeroGravity: boolean;
        broadphase: Broadphase;
        constraints: Constraint[];
        defaultMaterial: Material;
        defaultContactMaterial: ContactMaterial;
        lastTimeStep: number;
        applySpringForces: boolean;
        applyDamping: boolean;
        applyGravity: boolean;
        solveConstraints: boolean;
        contactMaterials: ContactMaterial[];
        time: number;
        accumulator: number;
        stepping: boolean;
        islandSplit: boolean;
        emitImpactEvent: boolean;
        sleepMode: typeof World.NO_SLEEPING | typeof World.BODY_SLEEPING | typeof World.ISLAND_SLEEPING;
        overlapKeeper: OverlapKeeper;
        disabledBodyCollisionPairs: Body[];
        private unionFind;
        constructor(options?: WorldOptions);
        addConstraint(constraint: Constraint): void;
        addContactMaterial(contactMaterial: ContactMaterial): void;
        removeContactMaterial(cm: ContactMaterial): void;
        getContactMaterial(materialA: Material, materialB: Material): ContactMaterial | false;
        removeConstraint(constraint: Constraint): void;
        step(dt: number, timeSinceLastCalled?: number, maxSubSteps?: number): void;
        private internalStep;
        addSpring(spring: Spring): void;
        removeSpring(spring: Spring): void;
        addBody(body: Body): void;
        removeBody(body: Body): void;
        getBodyByID(id: number): Body | false;
        disableBodyCollision(bodyA: Body, bodyB: Body): void;
        enableBodyCollision(bodyA: Body, bodyB: Body): void;
        clear(): void;
        hitTest(worldPoint: [number, number], bodies: Body[], precision?: number): Body[];
        setGlobalStiffness(stiffness: number): void;
        setGlobalRelaxation(relaxation: number): void;
        raycast(result: RaycastResult, ray: Ray): boolean;
        private setGlobalEquationParameters;
    }
}
declare module "src/objects/Body" {
    import { AABB } from "src/collision/AABB";
    import { EventEmitter } from "src/events/EventEmitter";
    import type { Shape } from "src/shapes/Shape";
    import type { Vec2 } from "src/types/index";
    import type { World } from "src/world/World";
    export interface BodyOptions {
        type?: typeof Body.DYNAMIC | typeof Body.STATIC | typeof Body.KINEMATIC | undefined;
        force?: Vec2 | undefined;
        position?: Vec2 | undefined;
        velocity?: Vec2 | undefined;
        allowSleep?: boolean | undefined;
        collisionResponse?: boolean | undefined;
        angle?: number | undefined;
        angularDamping?: number | undefined;
        angularForce?: number | undefined;
        angularVelocity?: number | undefined;
        ccdIterations?: number | undefined;
        ccdSpeedThreshold?: number | undefined;
        damping?: number | undefined;
        fixedRotation?: boolean | undefined;
        gravityScale?: number | undefined;
        id?: number | undefined;
        mass?: number | undefined;
        sleepSpeedLimit?: number | undefined;
        sleepTimeLimit?: number | undefined;
        fixedX?: boolean | undefined;
        fixedY?: boolean | undefined;
    }
    export type SleepyEvent = typeof Body.sleepyEvent;
    export type SleepEvent = typeof Body.sleepEvent;
    export type WakeUpEvent = typeof Body.wakeUpEvent;
    export class Body extends EventEmitter {
        static sleepyEvent: {
            type: string;
        };
        static sleepEvent: {
            type: string;
        };
        static wakeUpEvent: {
            type: string;
        };
        static DYNAMIC: 1;
        static STATIC: 2;
        static KINEMATIC: 4;
        static AWAKE: 0;
        static SLEEPY: 1;
        static SLEEPING: 2;
        static _idCounter: number;
        id: number;
        index: number;
        world: World | null;
        shapes: Shape[];
        mass: number;
        invMass: number;
        inertia: number;
        invInertia: number;
        invMassSolve: number;
        invInertiaSolve: number;
        fixedRotation: boolean;
        fixedX: boolean;
        fixedY: boolean;
        position: Vec2;
        interpolatedPosition: Vec2;
        previousPosition: Vec2;
        velocity: Vec2;
        vlambda: Vec2;
        wlambda: number;
        angle: number;
        previousAngle: number;
        interpolatedAngle: number;
        angularVelocity: number;
        force: Vec2;
        angularForce: number;
        damping: number;
        angularDamping: number;
        type: typeof Body.DYNAMIC | typeof Body.STATIC | typeof Body.KINEMATIC;
        boundingRadius: number;
        aabb: AABB;
        aabbNeedsUpdate: boolean;
        allowSleep: boolean;
        sleepState: typeof Body.AWAKE | typeof Body.SLEEPY | typeof Body.SLEEPING;
        sleepSpeedLimit: number;
        sleepTimeLimit: number;
        wantsToSleep: boolean;
        timeLastSleepy: number;
        gravityScale: number;
        collisionResponse: boolean;
        idleTime: number;
        ccdSpeedThreshold: number;
        ccdIterations: number;
        massMultiplier: Vec2;
        islandId: number;
        concavePath: Vec2[] | null;
        _wakeUpAfterNarrowphase: boolean;
        constructor(options?: BodyOptions);
        updateSolveMassProperties(): void;
        setDensity(density: number): void;
        getArea(): number;
        getAABB(): AABB;
        updateAABB(): void;
        updateBoundingRadius(): void;
        addShape(shape: Shape, offset?: Vec2, angle?: number): void;
        removeShape(shape: Shape): boolean;
        updateMassProperties(): void;
        applyForce(force: Vec2, relativePoint?: Vec2): void;
        applyForceLocal(localForce: Vec2, localPoint?: Vec2): void;
        applyImpulse(impulseVector: Vec2, relativePoint?: Vec2): void;
        applyImpulseLocal(localImpulse: Vec2, localPoint?: Vec2): void;
        toLocalFrame(out: Vec2, worldPoint: Vec2): void;
        toWorldFrame(out: Vec2, localPoint: Vec2): void;
        vectorToLocalFrame(out: Vec2, worldVector: Vec2): void;
        vectorToWorldFrame(out: Vec2, localVector: Vec2): void;
        fromPolygon(path: Vec2[], options?: {
            optimalDecomp?: boolean | undefined;
            skipSimpleCheck?: boolean | undefined;
            removeCollinearPoints?: boolean | number | undefined;
        }): boolean;
        adjustCenterOfMass(): void;
        setZeroForce(): void;
        applyDamping(dt: number): void;
        wakeUp(): void;
        sleep(): void;
        sleepTick(time: number, dontSleep: boolean, dt: number): void;
        overlaps(body: Body): boolean;
        integrate(dt: number): void;
        getVelocityAtPoint(result: Vec2, relativePoint: Vec2): Vec2;
        integrateToTimeOfImpact(dt: number): boolean;
        resetConstraintVelocity(): void;
        addConstraintVelocity(): void;
    }
}
declare module "src/collision/Ray" {
    import type { Body } from "src/objects/Body";
    import type { Shape } from "src/shapes/Shape";
    import type { Vec2 } from "src/types/index";
    import type { AABB } from "src/collision/AABB";
    import type { RaycastResult } from "src/collision/RaycastResult";
    export interface RayOptions {
        from?: Vec2;
        to?: Vec2;
        checkCollisionResponse?: boolean | undefined;
        skipBackfaces?: boolean | undefined;
        collisionMask?: number | undefined;
        collisionGroup?: number | undefined;
        mode?: typeof Ray.CLOSEST | typeof Ray.ANY | typeof Ray.ALL | undefined;
        callback?: ((result: RaycastResult) => void) | undefined;
    }
    export class Ray {
        static CLOSEST: number;
        static ANY: number;
        static ALL: number;
        from: Vec2;
        to: Vec2;
        checkCollisionResponse: boolean;
        skipBackfaces: boolean;
        collisionMask: number;
        collisionGroup: number;
        mode: typeof Ray.CLOSEST | typeof Ray.ANY | typeof Ray.ALL;
        callback: (result: RaycastResult) => void;
        direction: Vec2;
        length: number;
        private _currentBody;
        private _currentShape;
        constructor(options?: RayOptions);
        update(): void;
        intersectBodies(result: RaycastResult, bodies: Body[]): void;
        intersectBody(result: RaycastResult, body: Body): void;
        intersectShape(result: RaycastResult, shape: Shape, angle: number, position: Vec2, body: Body): void;
        getAABB(result: AABB): void;
        reportIntersection(result: RaycastResult, fraction: number, normal: Vec2, faceIndex?: number): void;
    }
}
declare module "src/collision/AABB" {
    import type { Ray } from "src/collision/Ray";
    import type { Vec2 } from "src/types/index";
    export interface AABBOptions {
        upperBound?: [number, number] | undefined;
        lowerBound?: [number, number] | undefined;
    }
    export class AABB {
        lowerBound: Vec2;
        upperBound: Vec2;
        constructor(options?: AABBOptions);
        setFromPoints(points: Vec2[], position: Vec2, angle?: number, skinSize?: number): void;
        copy(aabb: AABB): void;
        extend(aabb: AABB): void;
        overlaps(aabb: AABB): boolean;
        containsPoint(point: Vec2): boolean;
        overlapsRay(ray: Ray): number;
    }
}
declare module "src/collision/NaiveBroadphase" {
    import type { AABB } from "src/collision/AABB";
    import type { Body } from "src/objects/Body";
    import type { World } from "src/world/World";
    import { Broadphase } from "src/collision/Broadphase";
    export class NaiveBroadphase extends Broadphase {
        constructor();
        getCollisionPairs(world: World): Body[];
        aabbQuery(world: World, aabb: AABB, result?: Body[]): Body[];
    }
}
declare module "src/constraints/DistanceConstraint" {
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    import type { ConstraintOptions } from "src/constraints/Constraint";
    import { Constraint } from "src/constraints/Constraint";
    export interface DistanceConstraintOptions extends ConstraintOptions {
        distance?: number;
        localAnchorA?: Vec2;
        localAnchorB?: Vec2;
        maxForce?: number;
    }
    export class DistanceConstraint extends Constraint {
        localAnchorA: Vec2;
        localAnchorB: Vec2;
        distance: number;
        maxForce: number;
        upperLimitEnabled: boolean;
        upperLimit: number;
        lowerLimitEnabled: boolean;
        lowerLimit: number;
        position: number;
        constructor(bodyA: Body, bodyB: Body, options?: DistanceConstraintOptions);
        setMaxForce(maxForce: number): void;
        getMaxForce(): number;
        update(): void;
    }
}
declare module "src/equations/AngleLockEquation" {
    import type { Body } from "src/objects/Body";
    import { Equation } from "src/equations/Equation";
    export interface AngleLockEquationOptions {
        angle?: number | undefined;
        ratio?: number | undefined;
    }
    export class AngleLockEquation extends Equation {
        angle: number;
        ratio: number;
        constructor(bodyA: Body, bodyB: Body, options?: AngleLockEquationOptions);
        setRatio(ratio: number): void;
        setMaxTorque(torque: number): void;
        computeGq(): number;
    }
}
declare module "src/constraints/GearConstraint" {
    import type { Body } from "src/objects/Body";
    import type { ConstraintOptions } from "src/constraints/Constraint";
    import { Constraint } from "src/constraints/Constraint";
    export interface GearConstraintOptions extends ConstraintOptions {
        angle?: number;
        ratio?: number;
        maxTorque?: number;
    }
    export class GearConstraint extends Constraint {
        ratio: number;
        angle: number;
        constructor(bodyA: Body, bodyB: Body, options?: GearConstraintOptions);
        setMaxTorque(torque: number): void;
        getMaxTorque(): number;
        update(): void;
    }
}
declare module "src/constraints/LockConstraint" {
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    import type { ConstraintOptions } from "src/constraints/Constraint";
    import { Constraint } from "src/constraints/Constraint";
    export interface LockConstraintOptions extends ConstraintOptions {
        localOffsetB?: [number, number];
        localAngleB?: number;
        maxForce?: number;
    }
    export class LockConstraint extends Constraint {
        localOffsetB: Vec2;
        localAngleB: number;
        constructor(bodyA: Body, bodyB: Body, options?: LockConstraintOptions);
        setMaxForce(force: number): void;
        getMaxForce(): number;
        update(): void;
    }
}
declare module "src/equations/RotationalLockEquation" {
    import type { Body } from "src/objects/Body";
    import { Equation } from "src/equations/Equation";
    export interface RotationalLockEquationOptions {
        angle?: number | undefined;
    }
    export class RotationalLockEquation extends Equation {
        angle: number;
        constructor(bodyA: Body, bodyB: Body, options?: RotationalLockEquationOptions);
        computeGq(): number;
    }
}
declare module "src/constraints/PrismaticConstraint" {
    import { ContactEquation } from "src/equations/ContactEquation";
    import { Equation } from "src/equations/Equation";
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    import type { ConstraintOptions } from "src/constraints/Constraint";
    import { Constraint } from "src/constraints/Constraint";
    export interface PrismaticConstraintOptions extends ConstraintOptions {
        maxForce?: number;
        localAnchorA?: Vec2;
        localAnchorB?: Vec2;
        localAxisA?: Vec2;
        disableRotationalLock?: boolean;
        upperLimit?: number;
        lowerLimit?: number;
    }
    export class PrismaticConstraint extends Constraint {
        localAnchorA: Vec2;
        localAnchorB: Vec2;
        localAxisA: Vec2;
        position: number;
        velocity: number;
        lowerLimitEnabled: boolean;
        upperLimitEnabled: boolean;
        lowerLimit: number;
        upperLimit: number;
        upperLimitEquation: ContactEquation;
        lowerLimitEquation: ContactEquation;
        motorEquation: Equation;
        motorEnabled: boolean;
        motorSpeed: number;
        maxForce: number;
        constructor(bodyA: Body, bodyB: Body, options?: PrismaticConstraintOptions);
        enableMotor(): void;
        disableMotor(): void;
        setLimits(lower: number, upper: number): void;
        update(): void;
    }
}
declare module "src/equations/RotationalVelocityEquation" {
    import type { Body } from "src/objects/Body";
    import { Equation } from "src/equations/Equation";
    export class RotationalVelocityEquation extends Equation {
        ratio: number;
        constructor(bodyA: Body, bodyB: Body);
        computeB(a: number, b: number, h: number): number;
    }
}
declare module "src/constraints/RevoluteConstraint" {
    import { RotationalLockEquation } from "src/equations/RotationalLockEquation";
    import { RotationalVelocityEquation } from "src/equations/RotationalVelocityEquation";
    import type { Body } from "src/objects/Body";
    import type { Vec2 } from "src/types/index";
    import type { ConstraintOptions } from "src/constraints/Constraint";
    import { Constraint } from "src/constraints/Constraint";
    export interface RevoluteConstraintOptions extends ConstraintOptions {
        worldPivot?: Vec2;
        localPivotA?: Vec2;
        localPivotB?: Vec2;
        maxForce?: number;
    }
    export class RevoluteConstraint extends Constraint {
        angle: number;
        lowerLimitEnabled: boolean;
        upperLimitEnabled: boolean;
        lowerLimit: number;
        upperLimit: number;
        get motorEnabled(): boolean;
        set motorEnabled(value: boolean);
        get motorSpeed(): number;
        set motorSpeed(value: number);
        get motorMaxForce(): number;
        set motorMaxForce(value: number);
        maxForce: number;
        pivotA: Vec2;
        pivotB: Vec2;
        motorEquation: RotationalVelocityEquation;
        upperLimitEquation: RotationalLockEquation;
        lowerLimitEquation: RotationalLockEquation;
        constructor(bodyA: Body, bodyB: Body, options?: RevoluteConstraintOptions);
        setLimits(lower: number, upper: number): void;
        update(): void;
        enableMotor(): void;
        disableMotor(): void;
        motorIsEnabled(): boolean;
        setMotorSpeed(speed: number): void;
        getMotorSpeed(): number;
    }
}
declare module "src/objects/LinearSpring" {
    import type { Vec2 } from "src/types/index";
    import type { Body } from "src/objects/Body";
    import type { SpringOptions } from "src/objects/Spring";
    import { Spring } from "src/objects/Spring";
    export interface LinearSpringOptions extends SpringOptions {
        restLength?: number | undefined;
        localAnchorA?: Vec2;
        localAnchorB?: Vec2;
        worldAnchorA?: Vec2;
        worldAnchorB?: Vec2;
        stiffness?: number;
        damping?: number;
    }
    export class LinearSpring extends Spring {
        localAnchorA: Vec2;
        localAnchorB: Vec2;
        restLength: number;
        constructor(bodyA: Body, bodyB: Body, options?: LinearSpringOptions);
        setWorldAnchorA(worldAnchorA: Vec2): void;
        setWorldAnchorB(worldAnchorB: Vec2): void;
        getWorldAnchorA(result: Vec2): void;
        getWorldAnchorB(result: Vec2): void;
        applyForce(): void;
    }
}
declare module "src/objects/RotationalSpring" {
    import type { Body } from "src/objects/Body";
    import type { SpringOptions } from "src/objects/Spring";
    import { Spring } from "src/objects/Spring";
    export interface RotationalSpringOptions extends SpringOptions {
        restAngle?: number | undefined;
    }
    export class RotationalSpring extends Spring {
        restAngle: number;
        constructor(bodyA: Body, bodyB: Body, options?: RotationalSpringOptions);
        applyForce(): void;
    }
}
declare module "src/objects/TopDownVehicle" {
    import { Constraint } from "src/constraints/Constraint";
    import { FrictionEquation } from "src/equations/FrictionEquation";
    import type { Vec2 } from "src/types/index";
    import type { World } from "src/world/World";
    import { Body } from "src/objects/Body";
    export interface WheelConstraintOptions {
        localForwardVector?: Vec2;
        localPosition?: Vec2;
        sideFriction?: number;
    }
    export class WheelConstraint extends Constraint {
        protected vehicle: TopDownVehicle;
        protected forwardEquation: FrictionEquation;
        protected sideEquation: FrictionEquation;
        steerValue: number;
        engineForce: number;
        localForwardVector: Vec2;
        localPosition: Vec2;
        constructor(vehicle: TopDownVehicle, options?: WheelConstraintOptions);
        setBrakeForce(force: number): void;
        setSideFriction(force: number): void;
        getSpeed(): number;
        update(): void;
    }
    export class TopDownVehicle {
        chassisBody: Body;
        groundBody: Body;
        wheels: WheelConstraint[];
        world: World | null;
        preStepCallback: () => void;
        constructor(chassisBody: Body);
        addToWorld(world: World): void;
        removeFromWorld(): void;
        addWheel(wheelOptions?: WheelConstraintOptions): WheelConstraint;
        update(): void;
    }
}
declare module "src/p2-es" {
    export const version = "0.7.3";
    export * from "src/collision/AABB";
    export * from "src/collision/Broadphase";
    export * from "src/collision/NaiveBroadphase";
    export * from "src/collision/Narrowphase";
    export * from "src/collision/Ray";
    export * from "src/collision/RaycastResult";
    export * from "src/collision/SAPBroadphase";
    export * from "src/constraints/Constraint";
    export * from "src/constraints/DistanceConstraint";
    export * from "src/constraints/GearConstraint";
    export * from "src/constraints/LockConstraint";
    export * from "src/constraints/PrismaticConstraint";
    export * from "src/constraints/RevoluteConstraint";
    export * from "src/equations/AngleLockEquation";
    export * from "src/equations/ContactEquation";
    export * from "src/equations/Equation";
    export * from "src/equations/FrictionEquation";
    export * from "src/equations/RotationalVelocityEquation";
    export * from "src/events/EventEmitter";
    export * from "src/material/ContactMaterial";
    export * from "src/material/Material";
    export * as vec2 from "src/math/vec2";
    export * from "src/objects/Body";
    export * from "src/objects/LinearSpring";
    export * from "src/objects/RotationalSpring";
    export * from "src/objects/Spring";
    export * from "src/objects/TopDownVehicle";
    export * from "src/shapes/Box";
    export * from "src/shapes/Capsule";
    export * from "src/shapes/Circle";
    export * from "src/shapes/Convex";
    export * from "src/shapes/Heightfield";
    export * from "src/shapes/Line";
    export * from "src/shapes/Particle";
    export * from "src/shapes/Plane";
    export * from "src/shapes/Shape";
    export * from "src/solver/GSSolver";
    export * from "src/solver/Solver";
    export * from "src/utils/ContactEquationPool";
    export * from "src/utils/FrictionEquationPool";
    export * from "src/utils/Pool";
    export * from "src/utils/Utils";
    export * from "src/world/World";
}
declare module "test/collision/AABB.spec" { }
declare module "test/events/EventEmitter.spec" { }
declare module "test/material/Material.spec" { }
declare module "test/math/vec2.spec" { }
declare module "test/shapes/Convex.spec" { }
declare module "test/utils/TupleDictionary.spec" { }
declare module "test/utils/Utils.spec" { }