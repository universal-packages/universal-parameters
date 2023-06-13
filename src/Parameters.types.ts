export type ParamEntry = string | ParamShape
export type AttributeDescriptor = ParamEntry[] | [ParamEntry[]] | Set<string> | AttributeOptions

export interface ParamShape {
  [attribute: string]: AttributeDescriptor
}

export interface AttributeOptions {
  enum?: Set<string>
  enumArray?: Set<string>
  optional?: boolean
  shape?: ParamEntry[] | [ParamEntry[]]
}
