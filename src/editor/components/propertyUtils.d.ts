/**
 * Discriminative unions used to help with narrowing
 */

type SerializedProperty = {
  [T in MOZ.Property.TypeName]: {
    type: T
    value: MOZ.Property.TypeDict[T]["serialized"]
    arrayType: T extends "array" ? string : undefined
  }
}[MOZ.Property.TypeName]

type DeserializedProperty = {
  [T in MOZ.Property.TypeName]: {
    type: T
    value: MOZ.Property.TypeDict[T]["value"]
    arrayType: T extends "array" ? string : undefined
  }
}[MOZ.Property.TypeName]