namespace MOZ {
  namespace Property {
    type TypeDict = {
      int: { value: number, serialized: number }
      float: { value: number, serialized: number }
      bool: { value: boolean, serialized: boolean }
      string: { value: string, serialized: string }
      vec2: { value: THREE.Vector2, serialized: { x: number, y: number } }
      vec3: { value: THREE.Vector3, serialized: { x: number, y: number, z: number } }
      color: { value: THREE.Color, serialized: string }
      enum: { value: string, serialized: string }
      nodeRef: { value: NodeRef, serialized: NodeRef }
      array: { value: CompoundValue[], serialized: SerializedCompoundValue[] }
    }

    type TypeName = keyof TypeDict
    type Unit = "LENGTH" | "PIXEL" | "VELOCITY" | "TIME"
    
    type EnumItem = [value: string, label: string, description: string]

    type NodeRef = {
      /** UUID of a {@link Node.SpokeNode} */
      uuid?: string
      /** Optional sub-object name, for referencing inside {@link Node.ModelNode} only */
      objectName?: string
    }
  
    /** User-defined "types" */
    type CompoundValue = {
      [propertyName: string]: Value
    }
    type SerializedCompoundValue = {
      [propertyName: string]: SerializedValue
    }

    type Value = {[T in TypeName]: TypeDict[T]["value"]}[TypeName]
    type SerializedValue = {[T in TypeName]: TypeDict[T]["serialized"]}[TypeName]

    /** An entry inside a "properties" field */
    type Entry = {
      [T in TypeName]: {
        /** Type of data that this property accepts */
        type: T
        /** Dictate which custom type the array holds */
        arrayType: T extends "array" ? string : undefined
        /** Options for type "enum" */
        items: T extends "enum" ? EnumItem[] : undefined
        default?: SerializedValue
        unit?: Unit
        description?: string
      }
    }[TypeName]
  }

  namespace Config {
    type Type = {
      properties: {
        [propertyName: string]: Property.Entry
      }
    }
    type Types = {
      [typeName: string]: Type
    }
  }
}
