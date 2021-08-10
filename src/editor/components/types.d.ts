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
    type Class = import('./ComponentsConfig').default

    type Properties = {
      [name: string]: Property.Entry
    }
    type TypeDefinition = {
      properties: Properties
    }
    type Types = {
      [typeName: string]: TypeDefinition
    }
    type ComponentDefinition = {
      /** Which nodes this component can attach to. If empty, component is ignored. */
      nodes?: Node.Name[]
      /** Blender field for categorizing components */
      category?: string
      /** Blender flag for whether a component is a node or scene component (our "nodes" field replaces this) */
      node?: boolean
      description?: string
      /** {@link https://aframe.io/docs/1.2.0/core/component.html#multiple} */
      multiple?: boolean
      properties: Properties
    }
    type Components = {
      [componentName: string]: ComponentDefinition
    }
    type Json = {
      types?: Types
      components?: Components
    }
  }

  namespace Node {
    type Name = "Group" | "Model"

    type AmbientLightNode = import('@src/editor/nodes/AmbientLightNode').default
    type AudioNode = import('@src/editor/nodes/AudioNode').default
    type BoxColliderNode = import('@src/editor/nodes/BoxColliderNode').default
    type DirectionalLightNode = import('@src/editor/nodes/DirectionalLightNode').default
    type FloorPlanNode = import('@src/editor/nodes/FloorPlanNode').default
    type GroundPlaneNode = import('@src/editor/nodes/GroundPlaneNode').default
    type GroupNode = import('@src/editor/nodes/GroupNode').default
    type HemisphereLightNode = import('@src/editor/nodes/HemisphereLightNode').default
    type ImageNode = import('@src/editor/nodes/ImageNode').default
    type KitPieceNode = import('@src/editor/nodes/KitPieceNode').default
    type LinkNode = import('@src/editor/nodes/LinkNode').default
    type MediaFrameNode = import('@src/editor/nodes/MediaFrameNode').default
    type ModelNode = import('@src/editor/nodes/ModelNode').default
    type ParticleEmitterNode = import('@src/editor/nodes/ParticleEmitterNode').default
    type PointLightNode = import('@src/editor/nodes/PointLightNode').default
    type SceneNode = import('@src/editor/nodes/SceneNode').default
    type ScenePreviewCameraNode = import('@src/editor/nodes/ScenePreviewCameraNode').default
    type SimpleWaterNode = import('@src/editor/nodes/SimpleWaterNode').default
    type SkyboxNode = import('@src/editor/nodes/SkyboxNode').default
    type SpawnPointNode = import('@src/editor/nodes/SpawnPointNode').default
    type SpawnerNode = import('@src/editor/nodes/SpawnerNode').default
    type SpotLightNode = import('@src/editor/nodes/SpotLightNode').default
    type TriggerVolumeNode = import('@src/editor/nodes/TriggerVolumeNode').default
    type VideoNode = import('@src/editor/nodes/VideoNode').default
    type WayPointNode = import('@src/editor/nodes/WayPointNode').default
 
    type EditorNodeMixin = import('@src/editor/nodes/EditorNodeMixin').default
    type SpokeNode = THREE.Object3D &
      ( AmbientLightNode
      | AudioNode
      | BoxColliderNode
      | DirectionalLightNode
      | FloorPlanNode
      | GroundPlaneNode
      | GroupNode
      | HemisphereLightNode
      | ImageNode
      | KitPieceNode
      | LinkNode
      | MediaFrameNode
      | ModelNode
      | ParticleEmitterNode
      | PointLightNode
      | SceneNode
      | ScenePreviewCameraNode
      | SimpleWaterNode
      | SkyboxNode
      | SpawnPointNode
      | SpawnerNode
      | SpotLightNode
      | TriggerVolumeNode
      | VideoNode
      | WayPointNode)
  }
}
