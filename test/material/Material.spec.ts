import { Material } from '../../src/material/Material'

describe('Material', () => {
    test('construct', () => {
        const material1 = new Material()
        const material2 = new Material()
        expect(material1.id).not.toBe(material2.id)
    })
})
