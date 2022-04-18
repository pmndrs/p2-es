import { FrictionEquation } from '../equations/FrictionEquation'
import { Body } from '../objects/Body'
import { Pool } from './Pool'

export class FrictionEquationPool extends Pool<FrictionEquation> {
	create(): FrictionEquation {
		return new FrictionEquation(tmpBody, tmpBody, 0)
	}

	destroy(equation: FrictionEquation): FrictionEquationPool {
		equation.bodyA = equation.bodyB = tmpBody
		return this
	}
}

const tmpBody = new Body()
