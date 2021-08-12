import React, { useContext } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { EditorContext } from "@src/ui/contexts/EditorContext";
import getNodeWithUUID from "@src/editor/utils/getNodeWithUUID";
import ModelNode from "@src/editor/nodes/ModelNode";
import SelectInput from "@src/ui/inputs/SelectInput";

const NodeContainer = styled.span`
  display: flex;
  align-items: center;
`;

const NodeIcon = styled.div`
  width: 12px;
  height: 12px;
  margin-right: 4px;
`;

const SelectInputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/**
 * Dropdown(s) for referencing an object in the scene
 *
 * @typedef NodeRefInputProps
 * @property {MOZ.Property.NodeRef} value
 * @property {(value: MOZ.Property.NodeRef) => void} onChange
 *
 * @param {NodeRefInputProps}
 */
export default function NodeRefInput({ value, onChange }) {
  /** @type {import("@src/editor/Editor").default} */
  const editor = useContext(EditorContext);

  const node = getNodeWithUUID(editor.scene, value.uuid);

  const onChangeUuid = uuid => {
    if (uuid !== value.uuid) value.objectName = null;
    onChange({ ...value, uuid });
  };

  const onChangeObjectName = objectName => {
    onChange({ ...value, objectName });
  };

  const getNodeLabel = node => {
    /**
     * Note: nodeEditors maps from e.g. ModelNodel to ModelNodeEditor
     * and the -Editor classes contain the static .iconComponent visible in the hierarchy
     */
    const nodeEditorClass = editor.nodeEditors.get(node.constructor);
    return (
      <NodeContainer>
        <NodeIcon as={nodeEditorClass.iconComponent} />
        {node.name}
      </NodeContainer>
    );
  };

  /**
   * <SelectInput /> only respects an explicit .value field in its onChange handler
   * so we can't use the getOptionValue prop to simplify things
   *
   * Also, the first element in editor.nodes is a duplicate (stale) SceneNode so we ignore it.
   */
  const options = editor.nodes.slice(1).map(node => ({ node, value: node.uuid }));

  /** @type {(a: string, b: string) => boolean} - true if A fuzzy matches B */
  const fuzzyMatch = (a, b) => a.toLowerCase().includes(b.toLowerCase());

  return (
    <SelectInputContainer>
      <SelectInput
        options={options}
        value={value.uuid}
        getOptionLabel={option => getNodeLabel(option.node)}
        onChange={onChangeUuid}
        filterOption={(option, rawInput) => rawInput.length === 0 || fuzzyMatch(option.data.node.name, rawInput)}
      />
      {node instanceof ModelNode && (
        <ModelObjectRefInput node={node} value={value.objectName} onChange={onChangeObjectName} />
      )}
    </SelectInputContainer>
  );
}

NodeRefInput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * Sub-input for selecting an object inside of a model
 *
 * @typedef ModelObjectRefInputProps
 * @property {ModelNode} node
 * @property {?string} value - Name of the selected object. If null, the model root is used.
 * @property {(value: ?string) => void} onChange
 *
 * @param {ModelNodeRefInputProps}
 */
function ModelObjectRefInput({ node, value, onChange }) {
  /** @type {{value: string}[]} */
  const options = node.gltfJson.nodes.map(n => ({ value: n.name }));

  return (
    <SelectInput
      isClearable
      placeholder="(Root)"
      options={options}
      value={value}
      getOptionLabel={option => option.value}
      onChange={onChange}
    />
  );
}

ModelObjectRefInput.propTypes = {
  node: PropTypes.instanceOf(ModelNode).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
