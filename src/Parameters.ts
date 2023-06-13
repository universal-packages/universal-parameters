import { ParamEntry } from './Parameters.types'

export default class Parameters {
  public readonly subject: Record<string, any> | Record<string, any>[]

  private readonly rootPath: string

  public constructor(subject: Record<string, any> | Record<string, any>[], rootPath = 'subject') {
    this.subject = Array.isArray(subject) ? [...subject] : { ...subject }
    this.rootPath = rootPath
  }

  public shape<R = any>(...entries: ParamEntry[] | [ParamEntry[]]): R {
    const finalObject = {}

    for (let i = 0; i < entries.length; i++) {
      const currentEntry = entries[i]

      if (typeof currentEntry === 'string') {
        if (this.subject[currentEntry] !== undefined) {
          finalObject[currentEntry] = this.subject[currentEntry]
        } else {
          throw new Error(`${this.rootPath}/${currentEntry} was not provided and is not optional`)
        }
      } else if (Array.isArray(currentEntry)) {
        if (Array.isArray(this.subject)) {
          return this.subject.map((subSubject: any, index: number): any => new Parameters(subSubject, `${this.rootPath}/${index}`).shape(...currentEntry)) as any
        } else {
          throw new Error(`${this.rootPath} is not an array`)
        }
      } else {
        const attributeKeys = Object.keys(currentEntry)

        for (let j = 0; j < attributeKeys.length; j++) {
          const currentAttributeKey = attributeKeys[j]
          const currentAttributeDescriptor = currentEntry[currentAttributeKey]
          const currentSubjectAttributeValue = this.subject[currentAttributeKey]

          if (currentAttributeDescriptor instanceof Set) {
            if (currentAttributeDescriptor.has(currentSubjectAttributeValue)) {
              finalObject[currentAttributeKey] = currentSubjectAttributeValue
            } else {
              throw new Error(
                `${this.rootPath}/${currentAttributeKey} does not provide right enum value, valid enum values are [${Array.from(currentAttributeDescriptor).join(
                  ', '
                )}], "${currentSubjectAttributeValue}" was given`
              )
            }
          } else if (Array.isArray(currentAttributeDescriptor)) {
            if (currentSubjectAttributeValue === undefined) {
              throw new Error(`${this.rootPath}/${currentAttributeKey} was not provided and is not optional`)
            }

            finalObject[currentAttributeKey] = new Parameters(currentSubjectAttributeValue, `${this.rootPath}/${currentAttributeKey}`).shape(...currentAttributeDescriptor)
          } else {
            if (currentSubjectAttributeValue === undefined) {
              if (!currentAttributeDescriptor.optional) {
                throw new Error(`${this.rootPath}/${currentAttributeKey} was not provided and is not optional`)
              }
            } else {
              if (currentAttributeDescriptor.enum) {
                if (currentAttributeDescriptor.enum.has(currentSubjectAttributeValue)) {
                  finalObject[currentAttributeKey] = currentSubjectAttributeValue
                } else {
                  throw new Error(
                    `${this.rootPath}/${currentAttributeKey} does not provide right enum value, valid enum values are [${Array.from(currentAttributeDescriptor.enum).join(
                      ', '
                    )}], "${currentSubjectAttributeValue}" was given`
                  )
                }
              } else if (currentAttributeDescriptor.enumArray) {
                if (Array.isArray(currentSubjectAttributeValue) && currentSubjectAttributeValue.every((value) => currentAttributeDescriptor.enumArray.has(value))) {
                  finalObject[currentAttributeKey] = currentSubjectAttributeValue
                } else {
                  throw new Error(
                    `${this.rootPath}/${currentAttributeKey} does not provide right enum array value, valid enum values are [${Array.from(
                      currentAttributeDescriptor.enumArray
                    ).join(', ')}], "${currentSubjectAttributeValue}" included invalid values`
                  )
                }
              } else if (currentAttributeDescriptor.shape) {
                finalObject[currentAttributeKey] = new Parameters(currentSubjectAttributeValue, `${this.rootPath}/${currentAttributeKey}`).shape(
                  ...currentAttributeDescriptor.shape
                )
              } else {
                finalObject[currentAttributeKey] = currentSubjectAttributeValue
              }
            }
          }
        }
      }
    }

    return finalObject as any
  }
}
