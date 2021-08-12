import React, { useContext } from "react";
import PropTypes from "prop-types";
import SceneNode from "@src/editor/nodes/SceneNode";
import { DialogContext } from "@src/ui/contexts/DialogContext";
import { EditorContext } from "@src/ui/contexts/EditorContext";
import { PropertiesPanelButton } from "@src/ui/inputs/Button";
import HubsComponentsConfigDialog from "@src/ui/dialogs/HubsComponentsConfigDialog";

/**
 * Persists our components config on the scene node
 *
 * @typedef Props
 * @property {SceneNode} node
 *
 * @param {Props}
 */
export default function HubsComponentsConfigEditor({ node }) {
  /** @type {import("@src/editor/Editor").default} */
  const editor = useContext(EditorContext);
  const { showDialog, hideDialog } = useContext(DialogContext);

  const config = node.hubsComponentsConfig;

  /** @param {string} text */
  const save = text => {
    config.setText(text);
    editor.setPropertySelected("hubsComponentsConfig", config);
    hideDialog();
  };
  const close = () => {
    hideDialog();
  };
  const open = () => {
    showDialog(HubsComponentsConfigDialog, {
      title: "default-config.json",
      text: config.text,
      defaultText: config.defaultText,
      onSave: save,
      onCancel: close
    });
  };
  return <PropertiesPanelButton onClick={open}>Edit Components Config</PropertiesPanelButton>;
}

HubsComponentsConfigEditor.propTypes = {
  node: PropTypes.instanceOf(SceneNode).isRequired
};
