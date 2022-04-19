# CHANGELOG

## 0.8.0

- Use typescript, include generated type definitions
- Export as esm and cjs flatbundle
- Fix bug setting frictionIterations in GSSolver, and where bodies with constraint could be removed from world. @JSideris (https://github.com/schteppe/p2.js/pull/360)
- Add `upperLimit` and `lowerLimit` to DistanceConstraint options @DominicRoyStang (https://github.com/schteppe/p2.js/pull/341)
- Fix World.step reverting to fixed time step with `timeSinceLastCalled` equal to `0` @Grimeh (https://github.com/schteppe/p2.js/pull/337)
- Fix EventEmitter bug causing listeners to receive incorrect events @Fxlr8 (https://github.com/schteppe/p2.js/pull/336)
- Fix typo in AABB docs @yzpeninsula (https://github.com/schteppe/p2.js/pull/331)
- Line.raycast computes wrong fraction @palra (https://github.com/schteppe/p2.js/pull/342)
