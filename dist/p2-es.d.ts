declare module "types/index" {
    export type Vec2 = number[] | [number, number] | Float32Array;
}
declare module "utils/Utils" {
    export const ARRAY_TYPE: new (n: number) => Float32Array | number[];
    export const appendArray: (a: unknown[], b: unknown[]) => void;
    export const splice: (array: unknown[], index: number, howmany?: number) => void;
    export const arrayRemove: (array: unknown[], element: unknown) => void;
    export const extend: <A, B>(a: A, b: B) => A & B;
    export const shallowClone: <T>(obj: T) => T;
}
declare module "math/vec2" {
    import type { Vec2 } from "types/index";
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
declare module "material/Material" {
    export class Material {
        readonly id: number;
        static idCounter: number;
        constructor();
    }
}
declare module "shapes/Shape" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Material } from "material/Material";
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
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
        type: typeof Shape.CIRCLE | typeof Shape.PARTICLE | typeof Shape.PLANE | typeof Shape.CONVEX | typeof Shape.LINE | typeof Shape.BOX | typeof Shape.CAPSULE | typeof Shape.HEIGHTFIELD;
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
        static CIRCLE: 1;
        static PARTICLE: 2;
        static PLANE: 4;
        static CONVEX: 8;
        static LINE: 16;
        static BOX: 32;
        static CAPSULE: 64;
        static HEIGHTFIELD: 128;
        constructor(options: ShapeOptions);
        abstract computeMomentOfInertia(): number;
        abstract computeAABB(out?: AABB, position?: Vec2, angle?: number): void;
        updateBoundingRadius(): void;
        updateArea(): void;
        raycast(_result: RaycastResult, _ray: Ray, _position: Vec2, _angle: number): void;
        pointTest(_localPoint: Vec2): boolean;
        worldPointToLocal(out: Vec2, worldPoint: Vec2): Vec2;
    }
}
declare module "collision/RaycastResult" {
    import type { Vec2 } from "types/index";
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    import { Ray } from "collision/Ray";
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
declare module "events/EventEmitter" {
    export class EventEmitter<EventMap extends Record<string, any>> {
        private listeners;
        on<E extends keyof EventMap>(type: E, listener: (e: EventMap[E]) => void, context?: any): EventEmitter<EventMap>;
        off<E extends keyof EventMap>(type: E, listener: Function): EventEmitter<EventMap>;
        has<E extends keyof EventMap>(type: E, listener?: Function): boolean;
        emit<E extends keyof EventMap>(event: EventMap[E]): EventEmitter<EventMap>;
    }
}
declare module "math/polyk" {
    export function getArea(p: number[]): number;
    export function triangulate(p: number[]): number[];
}
declare module "shapes/Convex" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
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
        constructor(options?: ConvexOptions);
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
declare module "collision/Broadphase" {
    import type { AABB } from "collision/AABB";
    import { Body } from "objects/Body";
    import type { World } from "world/World";
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
declare module "shapes/Heightfield" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
    export interface HeightfieldOptions extends SharedShapeOptions {
        heights?: number[];
        minValue?: number;
        maxValue?: number;
        elementWidth?: number;
    }
    export class Heightfield extends Shape {
        heights: number[];
        maxValue?: number;
        minValue?: number;
        elementWidth: number;
        constructor(options?: HeightfieldOptions);
        updateMaxMinValues(): void;
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        updateArea(): void;
        computeAABB(out: AABB, position: [number, number], angle: number): void;
        getLineSegment(start: Vec2, end: Vec2, i: number): void;
        getSegmentIndex(position: Vec2): number;
        getClampedSegmentIndex(position: Vec2): number;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
    }
}
declare module "shapes/Circle" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
    export interface CircleOptions extends SharedShapeOptions {
        radius?: number;
    }
    export class Circle extends Shape {
        radius: number;
        constructor(options?: CircleOptions);
        updateBoundingRadius(): void;
        computeMomentOfInertia(): number;
        updateArea(): void;
        computeAABB(out: AABB, position: Vec2): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "equations/Equation" {
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
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
        constructor(bodyA: Body, bodyB: Body, minForce?: number, maxForce?: number);
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
declare module "equations/ContactEquation" {
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    import type { Vec2 } from "types/index";
    import { Equation } from "equations/Equation";
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
declare module "equations/FrictionEquation" {
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    import type { Vec2 } from "types/index";
    import type { ContactEquation } from "equations/ContactEquation";
    import { Equation } from "equations/Equation";
    export class FrictionEquation extends Equation {
        contactPointA: Vec2;
        contactPointB: Vec2;
        t: Vec2;
        contactEquations: ContactEquation[];
        shapeA: Shape | null;
        shapeB: Shape | null;
        frictionCoefficient: number;
        constructor(bodyA: Body, bodyB: Body, slipForce?: number);
        setSlipForce(slipForce: number): void;
        getSlipForce(): number;
        computeB(a: number, b: number, h: number): number;
    }
}
declare module "material/ContactMaterial" {
    import { Material } from "material/Material";
    export interface ContactMaterialOptions {
        friction?: number;
        restitution?: number;
        stiffness?: number;
        relaxation?: number;
        frictionStiffness?: number;
        frictionRelaxation?: number;
        surfaceVelocity?: number;
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
declare module "shapes/Box" {
    import type { AABB } from "collision/AABB";
    import type { Vec2 } from "types/index";
    import { Convex } from "shapes/Convex";
    import type { SharedShapeOptions } from "shapes/Shape";
    export interface BoxOptions extends SharedShapeOptions {
        width?: number;
        height?: number;
    }
    export class Box extends Convex {
        width: number;
        height: number;
        constructor(options?: BoxOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        updateArea(): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "shapes/Capsule" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
    export interface CapsuleOptions extends SharedShapeOptions {
        length?: number;
        radius?: number;
    }
    export class Capsule extends Shape {
        length: number;
        radius: number;
        constructor(options?: CapsuleOptions);
        computeMomentOfInertia(): number;
        updateArea(): void;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
        pointTest(localPoint: Vec2): boolean;
    }
}
declare module "shapes/Line" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
    export interface LineOptions extends SharedShapeOptions {
        length?: number;
    }
    export class Line extends Shape {
        length: number;
        constructor(options?: LineOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: Vec2, angle: number): void;
        raycast(result: RaycastResult, ray: Ray, position: Vec2, angle: number): void;
    }
}
declare module "shapes/Particle" {
    import type { AABB } from "collision/AABB";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
    export class Particle extends Shape {
        constructor(options?: SharedShapeOptions);
        computeMomentOfInertia(): number;
        updateBoundingRadius(): void;
        computeAABB(out: AABB, position: [number, number]): void;
    }
}
declare module "shapes/Plane" {
    import type { AABB } from "collision/AABB";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Vec2 } from "types/index";
    import type { SharedShapeOptions } from "shapes/Shape";
    import { Shape } from "shapes/Shape";
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
declare module "utils/Pool" {
    export interface PoolOptions {
        size?: number;
    }
    export abstract class Pool<T> {
        objects: T[];
        constructor(options?: PoolOptions);
        abstract create(): T;
        abstract destroy(object: T): void;
        resize(size: number): Pool<T>;
        get(): T;
        release(object: T): Pool<T>;
    }
}
declare module "utils/ContactEquationPool" {
    import { ContactEquation } from "equations/ContactEquation";
    import { Pool } from "utils/Pool";
    export class ContactEquationPool extends Pool<ContactEquation> {
        create(): ContactEquation;
        destroy(equation: ContactEquation): ContactEquationPool;
    }
}
declare module "utils/FrictionEquationPool" {
    import { FrictionEquation } from "equations/FrictionEquation";
    import { Pool } from "utils/Pool";
    export class FrictionEquationPool extends Pool<FrictionEquation> {
        create(): FrictionEquation;
        destroy(equation: FrictionEquation): FrictionEquationPool;
    }
}
declare module "utils/TupleDictionary" {
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
declare module "collision/Narrowphase" {
    import type { Heightfield } from "shapes/Heightfield";
    import type { ContactEquation } from "equations/ContactEquation";
    import type { FrictionEquation } from "equations/FrictionEquation";
    import type { ContactMaterial } from "material/ContactMaterial";
    import type { Body } from "objects/Body";
    import { Box } from "shapes/Box";
    import type { Capsule } from "shapes/Capsule";
    import { Circle } from "shapes/Circle";
    import { Convex } from "shapes/Convex";
    import type { Line } from "shapes/Line";
    import type { Particle } from "shapes/Particle";
    import type { Plane } from "shapes/Plane";
    import { Shape } from "shapes/Shape";
    import type { Vec2 } from "types/index";
    import { ContactEquationPool } from "utils/ContactEquationPool";
    import { FrictionEquationPool } from "utils/FrictionEquationPool";
    import { TupleDictionary } from "utils/TupleDictionary";
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
        convexLine: (_convexBody: Body, _convexShape: Convex, _convexOffset: Vec2, _convexAngle: number, _lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _justTest?: boolean) => number;
        lineBox: (_lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _boxBody: Body, _boxShape: Box, _boxOffset: Vec2, _boxAngle: number, _justTest?: boolean) => number;
        convexCapsule: (convexBody: Body, convexShape: Convex, convexPosition: Vec2, convexAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest?: boolean) => number;
        lineCapsule: (_lineBody: Body, _lineShape: Line, _linePosition: Vec2, _lineAngle: number, _capsuleBody: Body, _capsuleShape: Capsule, _capsulePosition: Vec2, _capsuleAngle: number, _justTest?: boolean) => number;
        capsuleCapsule: (bi: Body, si: Capsule, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest?: boolean) => number;
        lineLine: (_bodyA: Body, _shapeA: Line, _positionA: Vec2, _angleA: number, _bodyB: Body, _shapeB: Line, _positionB: Vec2, _angleB: number, _justTest?: boolean) => number;
        planeLine: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest?: boolean) => number;
        particleCapsule: (particleBody: Body, particleShape: Particle, particlePosition: Vec2, particleAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest?: boolean) => number;
        circleLine: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, _circleAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest?: boolean, lineRadius?: number, circleRadius?: number) => number;
        circleCapsule: (bi: Body, si: Circle, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest?: boolean) => number;
        circleConvex: (circleBody: Body, circleShape: Circle | Capsule, circleOffset: Vec2, _circleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest?: boolean, circleRadius?: number) => number;
        particleConvex: (particleBody: Body, particleShape: Particle, particleOffset: Vec2, _particleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest?: boolean) => number;
        circleCircle: (bodyA: Body, shapeA: Circle | Capsule, offsetA: Vec2, _angleA: number, bodyB: Body, shapeB: Circle | Capsule, offsetB: Vec2, _angleB: number, justTest?: boolean, radiusA?: number, radiusB?: number) => number;
        planeConvex: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest?: boolean) => number;
        particlePlane: (particleBody: Body, particleShape: Particle, particleOffset: Vec2, _particleAngle: number, planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, justTest?: boolean) => number;
        circleParticle: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, _circleAngle: number, particleBody: Body, particleShape: Particle, particleOffset: Vec2, _particleAngle: number, justTest?: boolean) => number;
        planeCapsule: (planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsuleOffset: Vec2, capsuleAngle: number, justTest?: boolean) => number;
        circlePlane: (circleBody: Body, circleShape: Circle, circleOffset: Vec2, _circleAngle: number, planeBody: Body, planeShape: Plane, planeOffset: Vec2, planeAngle: number, justTest?: boolean) => number;
        convexConvex: (bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest?: boolean) => number;
        circleHeightfield: (circleBody: Body, circleShape: Circle, circlePos: Vec2, _circleAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, _fAngle: number, justTest?: boolean, radius?: number) => number;
        convexHeightfield: (convexBody: Body, convexShape: Convex, convexPos: Vec2, convexAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, _hfAngle: number, justTest?: boolean) => number;
        narrowphases: {
            [x: number]: ((_lineBody: Body, _lineShape: Line, _lineOffset: Vec2, _lineAngle: number, _boxBody: Body, _boxShape: Box, _boxOffset: Vec2, _boxAngle: number, _justTest?: boolean) => number) | ((convexBody: Body, convexShape: Convex, convexPosition: Vec2, convexAngle: number, capsuleBody: Body, capsuleShape: Capsule, capsulePosition: Vec2, capsuleAngle: number, justTest?: boolean) => number) | ((bi: Body, si: Capsule, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest?: boolean) => number) | ((circleBody: Body, circleShape: Circle, circleOffset: Vec2, _circleAngle: number, lineBody: Body, lineShape: Line, lineOffset: Vec2, lineAngle: number, justTest?: boolean, lineRadius?: number, circleRadius?: number) => number) | ((bi: Body, si: Circle, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest?: boolean) => number) | ((circleBody: Body, circleShape: Circle | Capsule, circleOffset: Vec2, _circleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest?: boolean, circleRadius?: number) => number) | ((particleBody: Body, particleShape: Particle, particleOffset: Vec2, _particleAngle: number, convexBody: Body, convexShape: Convex, convexOffset: Vec2, convexAngle: number, justTest?: boolean) => number) | ((bodyA: Body, shapeA: Circle | Capsule, offsetA: Vec2, _angleA: number, bodyB: Body, shapeB: Circle | Capsule, offsetB: Vec2, _angleB: number, justTest?: boolean, radiusA?: number, radiusB?: number) => number) | ((circleBody: Body, circleShape: Circle, circleOffset: Vec2, _circleAngle: number, particleBody: Body, particleShape: Particle, particleOffset: Vec2, _particleAngle: number, justTest?: boolean) => number) | ((bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest?: boolean) => number) | ((circleBody: Body, circleShape: Circle, circlePos: Vec2, _circleAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, _fAngle: number, justTest?: boolean, radius?: number) => number) | ((convexBody: Body, convexShape: Convex, convexPos: Vec2, convexAngle: number, hfBody: Body, hfShape: Heightfield, hfPos: Vec2, _hfAngle: number, justTest?: boolean) => number);
            64: (bi: Body, si: Capsule, xi: Vec2, ai: number, bj: Body, sj: Capsule, xj: Vec2, aj: number, justTest?: boolean) => number;
            16: (_bodyA: Body, _shapeA: Line, _positionA: Vec2, _angleA: number, _bodyB: Body, _shapeB: Line, _positionB: Vec2, _angleB: number, _justTest?: boolean) => number;
            1: (bodyA: Body, shapeA: Circle | Capsule, offsetA: Vec2, _angleA: number, bodyB: Body, shapeB: Circle | Capsule, offsetB: Vec2, _angleB: number, justTest?: boolean, radiusA?: number, radiusB?: number) => number;
            8: (bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest?: boolean) => number;
            32: (bodyA: Body, polyA: Convex, positionA: Vec2, angleA: number, bodyB: Body, polyB: Convex, positionB: Vec2, angleB: number, justTest?: boolean) => number;
        };
    }
}
declare module "collision/SAPBroadphase" {
    import type { AABB } from "collision/AABB";
    import type { Body } from "objects/Body";
    import type { World } from "world/World";
    import { Broadphase } from "collision/Broadphase";
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
declare module "constraints/Constraint" {
    import type { Equation } from "equations/Equation";
    import type { Body } from "objects/Body";
    export type ConstraintOptions = {
        collideConnected?: boolean;
        wakeUpBodies?: boolean;
    };
    export class Constraint {
        static OTHER: -1;
        static DISTANCE: 1;
        static GEAR: 2;
        static LOCK: 3;
        static PRISMATIC: 4;
        static REVOLUTE: 5;
        type: typeof Constraint.DISTANCE | typeof Constraint.GEAR | typeof Constraint.LOCK | typeof Constraint.PRISMATIC | typeof Constraint.REVOLUTE | typeof Constraint.OTHER;
        equations: Equation[];
        bodyA: Body;
        bodyB: Body;
        collideConnected: boolean;
        constructor(bodyA: Body, bodyB: Body, type?: typeof Constraint.DISTANCE | typeof Constraint.GEAR | typeof Constraint.LOCK | typeof Constraint.PRISMATIC | typeof Constraint.REVOLUTE | typeof Constraint.OTHER, options?: ConstraintOptions);
        update(): void;
        setStiffness(stiffness: number): void;
        setRelaxation(relaxation: number): void;
        setMaxBias(maxBias: number): void;
    }
}
declare module "objects/Spring" {
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
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
declare module "solver/Solver" {
    import type { Equation } from "equations/Equation";
    import type { World } from "world/World";
    export interface SolverOptions {
        equationSortFunction?: (a: Equation, b: Equation) => number;
    }
    export abstract class Solver {
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
declare module "solver/GSSolver" {
    import type { World } from "world/World";
    import type { SolverOptions } from "solver/Solver";
    import { Solver } from "solver/Solver";
    export interface GSSolverOptions extends SolverOptions {
        iterations?: number;
        tolerance?: number;
        frictionIterations?: number;
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
declare module "utils/OverlapKeeperRecord" {
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    export class OverlapKeeperRecord {
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
        constructor(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape);
        set(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void;
    }
}
declare module "utils/OverlapKeeperRecordPool" {
    import { OverlapKeeperRecord } from "utils/OverlapKeeperRecord";
    import { Pool } from "utils/Pool";
    export class OverlapKeeperRecordPool extends Pool<OverlapKeeperRecord> {
        create(): OverlapKeeperRecord;
        destroy(record: OverlapKeeperRecord): OverlapKeeperRecordPool;
    }
}
declare module "utils/OverlapKeeper" {
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    import type { OverlapKeeperRecord } from "utils/OverlapKeeperRecord";
    import { OverlapKeeperRecordPool } from "utils/OverlapKeeperRecordPool";
    import { TupleDictionary } from "utils/TupleDictionary";
    export class OverlapKeeper {
        recordPool: OverlapKeeperRecordPool;
        overlappingShapesLastState: TupleDictionary<OverlapKeeperRecord>;
        overlappingShapesCurrentState: TupleDictionary<OverlapKeeperRecord>;
        tmpDict: TupleDictionary<OverlapKeeperRecord>;
        tmpArray1: OverlapKeeperRecord[];
        constructor();
        tick(): void;
        bodiesAreOverlapping(bodyA: Body, bodyB: Body): boolean;
        setOverlapping(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape): void;
        getNewOverlaps(result?: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        getEndOverlaps(result?: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        getDiff(dictA: TupleDictionary<OverlapKeeperRecord>, dictB: TupleDictionary<OverlapKeeperRecord>, result?: OverlapKeeperRecord[]): OverlapKeeperRecord[];
        isNewOverlap(shapeA: Shape, shapeB: Shape): boolean;
        getNewBodyOverlaps(result?: Body[]): Body[];
        getEndBodyOverlaps(result?: Body[]): Body[];
        getBodyDiff(overlaps: OverlapKeeperRecord[], result?: Body[]): Body[];
    }
}
declare module "world/UnionFind" {
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
declare module "world/World" {
    import type { Broadphase } from "collision/Broadphase";
    import { Narrowphase } from "collision/Narrowphase";
    import type { Ray } from "collision/Ray";
    import type { RaycastResult } from "collision/RaycastResult";
    import type { Constraint } from "constraints/Constraint";
    import type { ContactEquation } from "equations/ContactEquation";
    import type { FrictionEquation } from "equations/FrictionEquation";
    import { EventEmitter } from "events/EventEmitter";
    import { ContactMaterial } from "material/ContactMaterial";
    import { Material } from "material/Material";
    import { Body } from "objects/Body";
    import type { Spring } from "objects/Spring";
    import { Shape } from "shapes/Shape";
    import type { Solver } from "solver/Solver";
    import type { Vec2 } from "types/index";
    import { OverlapKeeper } from "utils/OverlapKeeper";
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
    export type WorldEventMap = {
        postStep: PostStepEvent;
        addBody: AddBodyEvent;
        removeBody: RemoveBodyEvent;
        addSpring: AddSpringEvent;
        impact: ImpactEvent;
        postBroadphase: PostBroadphaseEvent;
        beginContact: BeginContactEvent;
        endContact: EndContactEvent;
        preSolve: PreSolveEvent;
    };
    export interface WorldOptions {
        solver?: Solver;
        gravity?: Vec2;
        broadphase?: Broadphase;
        islandSplit?: boolean;
    }
    export class World extends EventEmitter<WorldEventMap> {
        static NO_SLEEPING: number;
        static BODY_SLEEPING: number;
        static ISLAND_SLEEPING: number;
        springs: Spring[];
        bodies: Body[];
        hasActiveBodies: boolean;
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
declare module "objects/Body" {
    import { AABB } from "collision/AABB";
    import { EventEmitter } from "events/EventEmitter";
    import type { Shape } from "shapes/Shape";
    import type { Vec2 } from "types/index";
    import type { World } from "world/World";
    export interface BodyOptions {
        type?: typeof Body.DYNAMIC | typeof Body.STATIC | typeof Body.KINEMATIC;
        force?: Vec2;
        position?: Vec2;
        velocity?: Vec2;
        allowSleep?: boolean;
        collisionResponse?: boolean;
        angle?: number;
        angularDamping?: number;
        angularForce?: number;
        angularVelocity?: number;
        ccdIterations?: number;
        ccdSpeedThreshold?: number;
        damping?: number;
        fixedRotation?: boolean;
        gravityScale?: number;
        id?: number;
        mass?: number;
        sleepSpeedLimit?: number;
        sleepTimeLimit?: number;
        fixedX?: boolean;
        fixedY?: boolean;
    }
    export type SleepyEvent = {
        type: 'sleepy';
    };
    export type SleepEvent = {
        type: 'sleep';
    };
    export type WakeUpEvent = {
        type: 'wakeup';
    };
    export type BodyEventMap = {
        sleepy: SleepyEvent;
        sleep: SleepEvent;
        wakeup: WakeUpEvent;
    };
    export class Body extends EventEmitter<BodyEventMap> {
        static DYNAMIC: number;
        static STATIC: number;
        static KINEMATIC: number;
        static AWAKE: number;
        static SLEEPY: number;
        static SLEEPING: number;
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
        private concavePath;
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
            optimalDecomp?: boolean;
            skipSimpleCheck?: boolean;
            removeCollinearPoints?: boolean | number;
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
declare module "collision/Ray" {
    import type { Body } from "objects/Body";
    import type { Shape } from "shapes/Shape";
    import type { Vec2 } from "types/index";
    import type { AABB } from "collision/AABB";
    import type { RaycastResult } from "collision/RaycastResult";
    export type RayOptions = {
        from?: Vec2;
        to?: Vec2;
        checkCollisionResponse?: boolean;
        skipBackfaces?: boolean;
        collisionMask?: number;
        collisionGroup?: number;
        mode?: typeof Ray.CLOSEST | typeof Ray.ANY | typeof Ray.ALL;
        callback?: (result: RaycastResult) => void;
    };
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
declare module "collision/AABB" {
    import type { Ray } from "collision/Ray";
    import type { Vec2 } from "types/index";
    export type AABBOptions = {
        upperBound?: Vec2;
        lowerBound?: Vec2;
    };
    export class AABB {
        upperBound: Vec2;
        lowerBound: Vec2;
        constructor(options?: AABBOptions);
        setFromPoints(points: Vec2[], position: Vec2, angle?: number, skinSize?: number): void;
        copy(aabb: AABB): void;
        extend(aabb: AABB): void;
        overlaps(aabb: AABB): boolean;
        containsPoint(point: Vec2): boolean;
        overlapsRay(ray: Ray): number;
    }
}
declare module "collision/NaiveBroadphase" {
    import type { AABB } from "collision/AABB";
    import type { Body } from "objects/Body";
    import type { World } from "world/World";
    import { Broadphase } from "collision/Broadphase";
    export class NaiveBroadphase extends Broadphase {
        constructor();
        getCollisionPairs(world: World): Body[];
        aabbQuery(world: World, aabb: AABB, result?: Body[]): Body[];
    }
}
declare module "constraints/DistanceConstraint" {
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
    import type { ConstraintOptions } from "constraints/Constraint";
    import { Constraint } from "constraints/Constraint";
    export interface DistanceConstraintOptions extends ConstraintOptions {
        distance?: number;
        localAnchorA?: Vec2;
        localAnchorB?: Vec2;
        maxForce?: number;
        upperLimit?: number;
        lowerLimit?: number;
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
declare module "equations/AngleLockEquation" {
    import type { Body } from "objects/Body";
    import { Equation } from "equations/Equation";
    export interface AngleLockEquationOptions {
        angle?: number;
        ratio?: number;
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
declare module "constraints/GearConstraint" {
    import type { Body } from "objects/Body";
    import type { ConstraintOptions } from "constraints/Constraint";
    import { Constraint } from "constraints/Constraint";
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
declare module "constraints/LockConstraint" {
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
    import type { ConstraintOptions } from "constraints/Constraint";
    import { Constraint } from "constraints/Constraint";
    export interface LockConstraintOptions extends ConstraintOptions {
        localOffsetB?: Vec2;
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
declare module "equations/RotationalLockEquation" {
    import type { Body } from "objects/Body";
    import { Equation } from "equations/Equation";
    export interface RotationalLockEquationOptions {
        angle?: number;
    }
    export class RotationalLockEquation extends Equation {
        angle: number;
        constructor(bodyA: Body, bodyB: Body, options?: RotationalLockEquationOptions);
        computeGq(): number;
    }
}
declare module "constraints/PrismaticConstraint" {
    import { ContactEquation } from "equations/ContactEquation";
    import { Equation } from "equations/Equation";
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
    import type { ConstraintOptions } from "constraints/Constraint";
    import { Constraint } from "constraints/Constraint";
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
declare module "equations/RotationalVelocityEquation" {
    import type { Body } from "objects/Body";
    import { Equation } from "equations/Equation";
    export class RotationalVelocityEquation extends Equation {
        ratio: number;
        constructor(bodyA: Body, bodyB: Body);
        computeB(a: number, b: number, h: number): number;
    }
}
declare module "constraints/RevoluteConstraint" {
    import { RotationalLockEquation } from "equations/RotationalLockEquation";
    import { RotationalVelocityEquation } from "equations/RotationalVelocityEquation";
    import type { Body } from "objects/Body";
    import type { Vec2 } from "types/index";
    import type { ConstraintOptions } from "constraints/Constraint";
    import { Constraint } from "constraints/Constraint";
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
declare module "objects/LinearSpring" {
    import type { Vec2 } from "types/index";
    import type { Body } from "objects/Body";
    import type { SpringOptions } from "objects/Spring";
    import { Spring } from "objects/Spring";
    export interface LinearSpringOptions extends SpringOptions {
        restLength?: number;
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
declare module "objects/RotationalSpring" {
    import type { Body } from "objects/Body";
    import type { SpringOptions } from "objects/Spring";
    import { Spring } from "objects/Spring";
    export interface RotationalSpringOptions extends SpringOptions {
        restAngle?: number;
    }
    export class RotationalSpring extends Spring {
        restAngle: number;
        constructor(bodyA: Body, bodyB: Body, options?: RotationalSpringOptions);
        applyForce(): void;
    }
}
declare module "objects/TopDownVehicle" {
    import { Constraint } from "constraints/Constraint";
    import { FrictionEquation } from "equations/FrictionEquation";
    import type { Vec2 } from "types/index";
    import type { World } from "world/World";
    import { Body } from "objects/Body";
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
        constructor(chassisBody: Body);
        addToWorld(world: World): void;
        removeFromWorld(): void;
        addWheel(wheelOptions?: WheelConstraintOptions): WheelConstraint;
    }
}
declare module "p2-es" {
    export * from "collision/AABB";
    export * from "collision/Broadphase";
    export * from "collision/NaiveBroadphase";
    export * from "collision/Narrowphase";
    export * from "collision/Ray";
    export * from "collision/RaycastResult";
    export * from "collision/SAPBroadphase";
    export * from "constraints/Constraint";
    export * from "constraints/DistanceConstraint";
    export * from "constraints/GearConstraint";
    export * from "constraints/LockConstraint";
    export * from "constraints/PrismaticConstraint";
    export * from "constraints/RevoluteConstraint";
    export * from "equations/AngleLockEquation";
    export * from "equations/ContactEquation";
    export * from "equations/Equation";
    export * from "equations/FrictionEquation";
    export * from "equations/RotationalVelocityEquation";
    export * from "events/EventEmitter";
    export * from "material/ContactMaterial";
    export * from "material/Material";
    export * as vec2 from "math/vec2";
    export * from "objects/Body";
    export * from "objects/LinearSpring";
    export * from "objects/RotationalSpring";
    export * from "objects/Spring";
    export * from "objects/TopDownVehicle";
    export * from "shapes/Box";
    export * from "shapes/Capsule";
    export * from "shapes/Circle";
    export * from "shapes/Convex";
    export * from "shapes/Heightfield";
    export * from "shapes/Line";
    export * from "shapes/Particle";
    export * from "shapes/Plane";
    export * from "shapes/Shape";
    export * from "solver/GSSolver";
    export * from "solver/Solver";
    export * from "types/index";
    export * from "utils/ContactEquationPool";
    export * from "utils/FrictionEquationPool";
    export * from "utils/Pool";
    export * as Utils from "utils/Utils";
    export * from "world/World";
}
