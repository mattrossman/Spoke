import React, { useContext } from "react";
import PropTypes from "prop-types";
import { CaretRight } from "styled-icons/fa-solid/CaretRight";
import { CaretDown } from "styled-icons/fa-solid/CaretDown";
import { EditorContext } from "@src/ui/contexts/EditorContext";
import { CollapsibleContainer, CollapsibleLabel, CollapsibleContent } from "@src/ui/inputs/Collapsible";
import { InputGroupContainer } from "@src/ui/inputs/InputGroup";
import SelectInput from "@src/ui/inputs/SelectInput";
import HubsComponentInput from "@src/ui/inputs/components/HubsComponentInput";
import HubsComponent from "@src/editor/components/HubsComponent";

/**
 * @typedef Props
 * @property {MOZ.Node.SpokeNode} node
 *
 * Editor dropdown for applying A-Frame components to model parts
 * @param {Props}
 */
export default function HubsComponentsProperties({ node }) {
  /** @type {MOZ.Component.NodeProperties} */
  const hubsComponents = node.hubsComponents;

  /** @type {import("@src/editor/Editor").default} */
  const editor = useContext(EditorContext);

  /** @param {{value: MOZ.Component.Class[], collapsed: boolean}} */
  const onChangeHubsComponents = ({ value = hubsComponents.value, collapsed = hubsComponents.collapsed }) => {
    editor.setPropertySelected("hubsComponents", { value, collapsed });
  };

  const hubsComponentsConfig = editor.scene.hubsComponentsConfig;

  /**
   * Only show the components that specify our node type in their "nodes" config field
   * @type {{label: string, value: string}}
   */
  const componentOptions = Object.entries(hubsComponentsConfig.json.components ?? {})
    .filter(([componentName, componentConfig]) => {
      /**
       * Only allow users to attach components that match this node's type in their "nodes" field.
       * Also, don't show options for components with the "multiple" field disabled if an instance of
       * the component is already attached to the node.
       */
      const canAttatchToNodeType = componentConfig.nodes.includes(node.nodeName);
      const alreadyAttached = hubsComponents.value.find(component => component.name === componentName) !== undefined;
      const canAttachNew = componentConfig.multiple || !alreadyAttached;
      return canAttatchToNodeType && canAttachNew;
    })
    .map(([componentName]) => ({
      label: componentName,
      value: componentName
    }));

  /** @type {(value: string) => void} */
  const onSelectAddComponent = value => {
    const component = new HubsComponent(node, value);
    onChangeHubsComponents({ value: [...hubsComponents.value, component] });
  };

  /** @type {(index: number) => void} */
  const deleteComponentAtIndex = index => {
    hubsComponents.value.splice(index, 1);
    onChangeHubsComponents({ value: hubsComponents.value });
  };

  /** @type {(component: MOZ.Component.Class, index: number) => void} */
  const setComponentAtIndex = (component, index) => {
    hubsComponents.value[index] = component;
    onChangeHubsComponents({ value: hubsComponents.value });
  };

  const toggleCollapsed = () => {
    onChangeHubsComponents({ collapsed: !hubsComponents.collapsed });
  };

  const Caret = hubsComponents.collapsed ? CaretRight : CaretDown;

  return (
    <CollapsibleContainer>
      <CollapsibleLabel onClick={toggleCollapsed}>
        <Caret size={14} />
        Components
      </CollapsibleLabel>
      {!hubsComponents.collapsed && (
        <CollapsibleContent>
          {hubsComponents.value.map((component, i) => (
            <HubsComponentInput
              key={i}
              enableSelector={node.nodeName === "Model"}
              component={component}
              onDelete={() => deleteComponentAtIndex(i)}
              onChange={c => setComponentAtIndex(c, i)}
            />
          ))}
          <InputGroupContainer>
            <SelectInput options={componentOptions} placeholder="Add Component" onChange={onSelectAddComponent} />
          </InputGroupContainer>
        </CollapsibleContent>
      )}
    </CollapsibleContainer>
  );
}

HubsComponentsProperties.propTypes = {
  node: PropTypes.object.isRequired
};
