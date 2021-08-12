import React, { Component } from "react";
import PropTypes from "prop-types";
import PropertyGroup from "./PropertyGroup";
import HubsComponentsEditor from "@src/ui/properties/HubsComponentsEditor";

export default class NodeEditor extends Component {
  static propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    node: PropTypes.object,
    editor: PropTypes.object,
    children: PropTypes.node,
    disableTransform: PropTypes.bool
  };

  static defaultProps = {
    disableTransform: false
  };

  render() {
    const { node, description, children } = this.props;

    /** @type {MOZ.Node.SceneNode} */
    const sceneNode = this.props.editor.scene;
    const hasComponentsAvailable = sceneNode.hubsComponentsConfig.getNodeNames().has(node.nodeName);

    /** @type {MOZ.Component.NodeProperties} */
    const hubsComponents = node.hubsComponents;
    const hasSavedComponents = hubsComponents.value.length > 0;

    return (
      <PropertyGroup name={node.nodeName} description={description}>
        {(hasComponentsAvailable || hasSavedComponents) && <HubsComponentsEditor node={node} />}
        {children}
      </PropertyGroup>
    );
  }
}
