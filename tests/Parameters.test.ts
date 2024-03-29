import { ParamEntry, Parameters } from '../src'

describe(Parameters, (): void => {
  describe('shape', (): void => {
    it('shapes complex object following all the shape rules', async (): Promise<void> => {
      const subject = {
        user: {
          name: 'No way Jose',
          age: 99,
          createdAt: '123',
          books: [
            { name: 'Book1', category: 'fantasy', read: false },
            { name: 'Book2', category: 'serious', read: true }
          ],
          settings: {
            night: true,
            notifications: 'all',
            uiPositions: [
              { x: 1, y: 1, _other: 'nop' },
              { x: 2, y: 2 }
            ],
            uiNames: { first: 'likes', second: 'monitory', _nop: true }
          },
          extra: ['a', 'b']
        },
        previous: {
          name: 'Oscar'
        }
      }
      const shape: ParamEntry[] | [ParamEntry[]] = [
        {
          user: [
            'name',
            'age',
            {
              books: [[{ name: {} }, { status: { optional: true } }, { category: new Set(['fantasy', 'serious']) }]],
              settings: [
                { night: {}, notifications: { enum: new Set(['all', 'none']) } },
                { uiPositions: [['x', 'y']], uiNames: ['first', 'second'] }
              ],
              extra: { enumArray: new Set(['a', 'b', 'c']) }
            }
          ]
        }
      ]

      const parameters = new Parameters(subject)

      expect(parameters.shape(...shape)).toEqual({
        user: {
          name: 'No way Jose',
          age: 99,
          books: [
            { name: 'Book1', category: 'fantasy' },
            { name: 'Book2', category: 'serious' }
          ],
          settings: {
            night: true,
            notifications: 'all',
            uiPositions: [
              { x: 1, y: 1 },
              { x: 2, y: 2 }
            ],
            uiNames: { first: 'likes', second: 'monitory' }
          },
          extra: ['a', 'b']
        }
      })
    })

    describe('When a malformed subject is trying to be shaped', (): void => {
      it('throws if a string attribute is not present', async (): Promise<void> => {
        const parameters = new Parameters({ someKey: {} })

        expect((): void => {
          parameters.shape('required')
        }).toThrow('subject/required was not provided and is not optional')
      })

      it('throws if describing an array but the subject does not contain it', async (): Promise<void> => {
        const parameters = new Parameters({ deep: { array: 'nop' } })

        expect((): void => {
          parameters.shape({ deep: [{ array: [['key']] }] })
        }).toThrow('subject/deep/array is not an array')

        expect((): void => {
          parameters.shape({ deep: { shape: [{ array: [['key']] }] } })
        }).toThrow('subject/deep/array is not an array')
      })

      it('throws if root key not present', async (): Promise<void> => {
        const parameters = new Parameters({})

        expect((): void => {
          parameters.shape({ deep: [{ key: { optional: true } }] })
        }).toThrow('subject/deep was not provided and is not optional')
      })

      it('throws if describing an enum of values and the subject does not comply', async (): Promise<void> => {
        const parameters = new Parameters({ select: 'maybe' })

        expect((): void => {
          parameters.shape({ select: new Set(['yes', 'no']) })
        }).toThrow('subject/select does not provide right enum value, valid enum values are [yes, no], "maybe" was given')
        expect((): void => {
          parameters.shape({ select: { enum: new Set(['yes', 'no']) } })
        }).toThrow('subject/select does not provide right enum value, valid enum values are [yes, no], "maybe" was given')
      })

      it('throws if describing an enum of arrays and the subject does not comply', async (): Promise<void> => {
        const parameters = new Parameters({ select: ['maybe'] })

        expect((): void => {
          parameters.shape({ select: { enumArray: new Set(['yes', 'no']) } })
        }).toThrow('subject/select does not provide right enum array value, valid enum values are [yes, no], "maybe" included invalid values')
      })

      it('throws if describing a key and is not optional', async (): Promise<void> => {
        const parameters = new Parameters({ something: {} })

        expect((): void => {
          parameters.shape({ required: {} })
        }).toThrow('subject/required was not provided and is not optional')
      })
    })
  })
})
