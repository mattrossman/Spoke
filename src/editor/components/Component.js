import { diff } from "deep-object-diff";

import ComponentSelector from "./ComponentSelector";
import { serializeProperty, deserializeProperty, getPropertyDefault } from "./propertyUtils";

/**  An A-Frame component applied to part of a node */
export default class Component {
  /** @type {MOZ.Node.SpokeNode} - Node where this component will persist */
  node;

  /** @type {string} - Name of the component */
  name;

  /** @type {MOZ.Config.Types} - Local copy of type definitions that this component references */
  types;

  /** @type {MOZ.Config.ComponentDefinition} - Local copy of this component's config */
  config;

  /** @type {MOZ.Config.Class} - Reference to scene level config (might be more recent) */
  sceneConfig;

  /** @type {MOZ.Component.Data} - Component data following the "config" properties structure */
  data;

  /** @type {ComponentSelector} - What part(s) of the (model) node the component should be applied to */
  selector;

  /** @type {boolean} - Whether this component's UI entry should start in collapsed state */
  collapsed;

  /**
   * Constructs an empty instance of the component using the latest scene config.
   * Note: Component might no longer exist in the scene config
   *
   * @param {MOZ.Node.SpokeNode} node
   * @param {string} name
   */
  constructor(node, name) {
    /** @type {MOZ.Config.Class} */
    this.sceneConfig = node.editor.scene.componentsConfig;

    this.node = node;
    this.name = name;
    this.collapsed = false;

    this.config = this.sceneConfig.json.components?.[name];
    this.selector = new ComponentSelector();

    // Fill data with default values if config exists
    if (this.config) {
      const entries = Object.entries(this.config.properties).map(([propName, propConfig]) => [
        propName,
        getPropertyDefault(propConfig)
      ]);
      this.data = Object.fromEntries(entries);
      this.types = this.getDependentTypes(this.config.properties, this.sceneConfig.json.types);
    } else {
      this.data = {};
      this.types = {};
    }
  }

  /** @returns {MOZ.Component.Serialized} */
  serialize() {
    const serialized = {
      name: this.name,
      selector: this.selector.serialize(),
      config: this.config,
      types: this.types,
      data: {}
    };

    // Check for special types like THREE.Color in component data
    Object.entries(this.data).forEach(([prop, value]) => {
      const { type, arrayType } = this.config.properties[prop];
      serialized.data[prop] = serializeProperty({ value, type, arrayType }, this.types);
    });
    return serialized;
  }

  /**
   * @param {MOZ.Component.Serialized} serialized
   * @param {MOZ.Node.SpokeNode} node
   * @returns {Component}
   */
  static deserialize(serialized, node) {
    // Start from an empty component with default values
    const component = new Component(node, serialized.name);

    // Fill in properties from serialized object
    component.selector = ComponentSelector.deserialize(serialized.selector, node);
    component.types = serialized.types ?? {};

    const data = {};
    Object.entries(serialized.data).forEach(([prop, value]) => {
      const { type, arrayType } = serialized.config.properties[prop];
      data[prop] = deserializeProperty({ value, type, arrayType }, component.types);
    });
    component.data = data;
    component.config = serialized.config;

    return component;
  }

  /**
   * Find all custom types that a component references in its properties
   *
   * @param {MOZ.Config.Properties} properties
   * @param {MOZ.Config.Types} types
   * @param {string[]} [dependencies] - Names of types that the properties depend on (prevent infinite loops)
   * @returns {MOZ.Config.Types} - Subset of the provided types which this component references
   */
  getDependentTypes(properties, types, dependencies = []) {
    const referencedTypes = {};
    Object.entries(properties).forEach(([propName, propConfig]) => {
      if (propConfig.type === "array") {
        const typeName = propConfig.arrayType;
        const typeConfig = types[typeName];

        // Check that the type has a definition
        if (!typeConfig) {
          throw new Error(`No matching type definition found for type "${typeName}" in property "${propName}"`);
        }
        // Check that we're not creating an infinite loop
        if (dependencies.includes(typeName)) {
          throw new Error(`Invalid type definition: arrayType "${typeName}" depends on itself`);
        }

        // If those checks passed add the type definition to our collection
        referencedTypes[typeName] = typeConfig;

        // Recursively check the dependencies of this type's properties
        const newDependencies = [...dependencies, typeName];
        Object.assign(referencedTypes, this.getDependentTypes(typeConfig.properties, types, newDependencies));
      }
    });
    return referencedTypes;
  }

  /**
   * When multiple instancing is enabled, component names have a suffix appended
   * by GLTFModelPlus in Hubs. We should display that name in the UI so users
   * understand how to query for the component.
   *
   * @returns {string} - Name of the component as it is attached in Hubs
   */
  getHubsName() {
    if (this.config.multiple) {
      /** @type {MOZ.Component.NodeProperties} */
      const components = this.node.components;
      const index = components.value.filter(c => c.name === this.name).indexOf(this);
      return `${this.name}__${index}`;
    } else return this.name;
  }

  /**
   * Add this component's data to the provided object's Hubs GLTF extension field
   *
   * Based on EditorNodeMixin.addGLTFComponent, but this lets you apply the component
   * to an arbitrary object rather than a root node
   *
   * @param {THREE.Object3D} object
   * @param {THREE.Scene} sceneForExport
   */
  prepareForExport(object, sceneForExport) {
    const serialized = this.serialize();

    /** @type {THREE.Scene} */
    const sceneWithNodes = this.node.editor.scene;

    /**
     * @param {THREE.Object3D} object
     * @param {string} componentName
     * @param {MOZ.Component.Data} componentData
     * @param {boolean} multiple - If true, append a suffix to enable multiple instancing {@link https://aframe.io/docs/1.2.0/core/component.html#multiple}
     */
    const addComponent = (object, componentName, componentData, multiple) => {
      object.userData.gltfExtensions = object.userData.gltfExtensions ?? {};
      object.userData.gltfExtensions.MOZ_hubs_components = object.userData.gltfExtensions.MOZ_hubs_components ?? {};
      const mozHubsComponents = object.userData.gltfExtensions.MOZ_hubs_components;

      if (multiple) {
        mozHubsComponents[componentName] = mozHubsComponents[componentName] ?? [];
        mozHubsComponents[componentName].push(componentData);
      } else {
        mozHubsComponents[componentName] = componentData;
      }
    };

    /**
     *
     * @param {MOZ.Component.SerializedData | MOZ.Property.SerializedCompoundValue} data
     * @param {MOZ.Config.Properties} properties
     */
    const replaceNodeRefs = (data, properties) => {
      Object.keys(data).forEach(prop => {
        const propertyType = properties[prop].type;
        if (propertyType === "nodeRef") {
          /** @type {MOZ.Property.NodeRef} */
          const nodeRef = data[prop];

          if (nodeRef.uuid) {
            /**
             * For {@link MOZ.Node.ModelNode} use `sceneForExport`, otherwise use `sceneWithNodes`
             * This is because the UUIDs inside of glTF models differ between these scenes
             */
            const targetObject =
              nodeRef.objectName !== null
                ? sceneForExport.getObjectByUUID(nodeRef.uuid).getObjectByName(nodeRef.objectName)
                : sceneWithNodes.getObjectByUUID(nodeRef.uuid);

            // Mark it with a magic { __gltfIndexForUUID: "..." } flag
            data[prop] = this.node.gltfIndexForUUID(targetObject.uuid);
            targetObject.userData.MOZ_spoke_uuid = targetObject.uuid;

            // Give it a placeholder component to ensure GLTFModelPlus turns the object into an entity
            addComponent(targetObject, "__noderef", {}, false);
          } else {
            throw new Error(`Error on node ${this.node.name}: component "${this.name}" has empty nodeRef "${prop}"`);
          }
        } else if (propertyType === "array") {
          const definition = this.types[properties[prop].arrayType];
          if (!definition) {
            throw new Error(`Missing type definition for arrayType "${properties[prop].arrayType}"`);
          }
          /** @type {MOZ.Property.SerializedCompoundValue[]} */
          (data[prop]).forEach(item => {
            replaceNodeRefs(item, definition.properties);
          });
        }
      });
    };

    replaceNodeRefs(serialized.data, this.config.properties);

    addComponent(object, this.name, serialized.data, this.config.multiple ?? false);
  }

  /**
   * Has this component's local config diverged from the scene's config?
   * @returns {boolean}
   */
  needsUpdate() {
    const latestProperties = this.sceneConfig.json.components?.[this.name]?.properties ?? {};
    const latestTypes = this.sceneConfig.json.types ?? {};
    const latestDependentTypes = this.getDependentTypes(latestProperties, latestTypes);

    const diffProperties = diff(this.config.properties, latestProperties);
    const diffTypes = diff(this.types, latestDependentTypes);
    const numChanges = Object.keys(diffProperties).length + Object.keys(diffTypes).length;

    return numChanges > 0;
  }
}
