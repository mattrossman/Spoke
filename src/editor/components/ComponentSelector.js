/**
 * Selects parts of an {@link THREE.Object3D} for later processing.
 * For example, can be used to select all meshes with the given material name(s).
 */
export default class ComponentSelector {
  /** @type {MOZ.Selector.Type} - What is being selected on */
  type;

  /** @type {MOZ.Selector.Value} - Values to select using the above selection type */
  value;

  /** @type {boolean} - Whether the selector UI should start in collapsed state */
  collapsed;

  constructor() {
    this.type = "root";
    this.value = [];
    this.collapsed = true;
  }

  /**
   * Available `value` options for the selector type
   *
   * @param {MOZ.Node.SpokeNode} node
   * @returns {string[]}
   */
  getOptions(node) {
    switch (this.type) {
      case "root":
        return [];
      case "object":
        return /** @type {MOZ.Node.ModelNode} */ (node).gltfJson.nodes.map(n => n.name);
      case "material":
        return /** @type {MOZ.Node.ModelNode} */ (node).gltfJson.materials.map(m => m.name);
      default:
        throw new Error("Invalid selector type:", this.type);
    }
  }

  /**
   * Get list of descendants that match the selector criteria
   *
   * @param {MOZ.Node.SpokeNode} node - Node to start matching from
   * @returns {THREE.Object3D[]}
   */
  getMatches(node) {
    const objects = [];
    switch (this.type) {
      case "root":
        objects.push(node);
        break;
      case "object":
        node.traverse(obj => {
          if (this.value.includes(obj.name)) {
            objects.push(obj);
          }
        });
        break;
      case "material":
        node.traverse(obj => {
          if (obj.material && this.value.includes(obj.material.name)) {
            objects.push(obj);
          }
        });
        break;
      default:
        throw new Error("Invalid selector type:", this.type);
    }
    return objects;
  }

  /** @returns {MOZ.Selector.Serialized} */
  serialize() {
    return {
      type: this.type,
      value: this.value
    };
  }

  /**
   * @param {MOZ.Selector.Serialized} serialized
   * @param {MOZ.Node.SpokeNode} node
   * @returns {ComponentSelector}
   */
  static deserialize(serialized, node) {
    const selector = new ComponentSelector(node);
    selector.type = serialized.type;
    selector.value = serialized.value;
    return selector;
  }
}
