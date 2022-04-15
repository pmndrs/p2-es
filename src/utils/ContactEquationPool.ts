import { ContactEquation } from '../equations/ContactEquation'
import { Body } from '../objects/Body'
import { Pool } from './Pool'

const tmpBody = new Body()

export class ContactEquationPool extends Pool<ContactEquation> {
	create(): ContactEquation {
		return new ContactEquation(tmpBody, tmpBody)
	}

	destroy(equation: ContactEquation): ContactEquationPool {
		equation.bodyA = equation.bodyB = tmpBody
		return this
	}
}
