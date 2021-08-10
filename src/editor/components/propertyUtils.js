import * as THREE from "three";

/**
 * @param {SerializedProperty} property - Property value and configuration
 * @param {MOZ.Config.Types} types - Registry of custom type definitions
 * @returns {MOZ.Property.Value}
 */
export function deserializeProperty(property, types) {
  switch (property.type) {
    case "string":
    case "int":
    case "float":
    case "bool":
    case "nodeRef":
    case "enum":
      return property.value;
    case "vec2": {
      const { x, y } = property.value;
      return new THREE.Vector2(x, y);
    }
    case "vec3": {
      const { x, y, z } = property.value;
      return new THREE.Vector3(x, y, z);
    }
    case "color":
      return new THREE.Color(property.value);
    case "array": {
      const definition = types[property.arrayType];
      if (!definition) throw new Error(`No type definition found for arrayType "${property.arrayType}"`);

      // Recursively deserialize each property of each arrayType item
      return property.value.map(serializedCompoundValue => {
        /** @type {[propertyName: string, MOZ.Property.Value][]} */
        const compoundEntries = Object.entries(serializedCompoundValue).map(([propertyName, innerSerializedValue]) => {
          /** @type {SerializedProperty} */
          const property = {
            type: definition.properties[propertyName].type,
            value: innerSerializedValue,
            arrayType: definition.properties[propertyName].arrayType
          };
          return [propertyName, deserializeProperty(property, types)];
        });
        return Object.fromEntries(compoundEntries);
      });
    }
    default:
      throw new Error("Unknown type encountered in deserializeProperty()");
  }
}

/**
 * @param {DeserializedProperty} property - Property value and configuration
 * @param {MOZ.Config.Types} types - Registry of custom type definitions
 * @returns {MOZ.Property.SerializedValue}
 */
export function serializeProperty(property, types) {
  switch (property.type) {
    case "string":
    case "int":
    case "float":
    case "bool":
    case "nodeRef":
    case "enum":
      return property.value;
    case "vec2": {
      const { x, y } = property.value;
      return { x, y };
    }
    case "vec3": {
      const { x, y, z } = property.value;
      return { x, y, z };
    }
    case "color":
      return "#" + property.value.getHexString();
    case "array": {
      const definition = types[property.arrayType];
      if (!definition) throw new Error(`No type definition found for arrayType "${property.arrayType}"`);

      // Recursively serialize each property of each arrayType item
      return property.value.map(compoundValue => {
        /** @type {[propertyName: string, MOZ.Property.SerializedValue][]} */
        const compoundEntries = Object.entries(compoundValue).map(([propertyName, innerValue]) => {
          /** @type {DeserializedProperty} */
          const property = {
            type: definition.properties[propertyName].type,
            value: innerValue,
            arrayType: definition.properties[propertyName].arrayType
          };
          return [propertyName, serializeProperty(property, types)];
        });
        return Object.fromEntries(compoundEntries);
      });
    }
    default:
      throw new Error("Unknown type encountered in serializeProperty()");
  }
}

/**
 * Retrieves and parses the `.default` field if set, otherwise falls back
 * to sensible defaults
 *
 * @param {MOZ.Property.Entry} propConfig
 * @returns {MOZ.Property.Value}
 */
export function getPropertyDefault(propConfig) {
  if (propConfig.default) {
    // We can pass an empty types object since "array" types won't reach this branch
    return deserializeProperty({ type: propConfig.type, value: propConfig.default }, {});
  } else {
    switch (propConfig.type) {
      case "string":
        return "";
      case "int":
      case "float":
        return 0;
      case "bool":
        return false;
      case "nodeRef":
        /** @type {MOZ.Property.NodeRef} */
        return {
          uuid: null,
          objectName: null
        };
      case "enum":
        // Default to the first option in the items array
        if (propConfig.items) return propConfig.items[0][0];
        else throw new Error(`Missing or empty "items" array for enum property in getPropDefault()"`);
      case "vec2":
        return new THREE.Vector2();
      case "vec3":
        return new THREE.Vector3();
      case "color":
        return new THREE.Color();
      case "array":
        return [];
      default:
        throw new Error("Unknown type encountered in getPropDefault()");
    }
  }
}

/**
 * Fill in defaults for all properties of a custom compound type
 *
 * @param {MOZ.Config.Type} definition
 * @returns {MOZ.Property.CompoundValue}
 */
export function getCompoundDefault(definition) {
  const defaultEntries = Object.entries(definition.properties).map(([propertyName, config]) => [
    propertyName,
    getPropertyDefault(config)
  ]);
  return Object.fromEntries(defaultEntries);
}

// TODO: Support the full collection of Blender unit types, see:
// https://docs.blender.org/api/current/bpy.props.html#bpy.props.FloatProperty

/** @type {Record<MOZ.Property.Unit, string>} */
export const unitLabels = {
  LENGTH: "m",
  PIXEL: "px",
  VELOCITY: "m/s",
  TIME: "s"
};
