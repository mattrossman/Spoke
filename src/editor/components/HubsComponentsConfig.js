/**
 * Utility class for storing the raw and parsed versions of a config
 * file together. This is used because we want to reference the parsed config data
 * in our app logic, but persist the raw string to retain a user's desired formatting.
 */
export default class HubsComponentsConfig {
  /** @type {string} Raw contents of the config file */
  text;

  /** @type {MOZ.Config.Json} Parsed version of the config file */
  json;

  /** @type {string} Default config file text */
  defaultText = JSON.stringify({ types: {}, components: {} }, null, 2);

  /** @param {string} [text] */
  constructor(text) {
    this.setText(text || this.defaultText);
  }

  /** @param {string} text */
  setText(text) {
    this.text = text;
    this.json = JSON.parse(text);
  }

  /** Unique `.nodeName` within the config's "nodes" fields */
  getNodeNames() {
    /** @type {Set<MOZ.Node.Name>} */
    const nodeNames = new Set();
    Object.values(this.json.components || {}).forEach(entry => {
      if (entry.nodes) {
        entry.nodes.forEach(nodeName => nodeNames.add(nodeName));
      }
    });
    return nodeNames;
  }
}
