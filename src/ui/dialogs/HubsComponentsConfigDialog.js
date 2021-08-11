import React, { useRef, useState } from "react";
import * as PropTypes from "prop-types";
import MonacoEditor from "@monaco-editor/react";
import styled from "styled-components";
import { Times } from "styled-icons/fa-solid/Times";
import { Check } from "styled-icons/fa-solid/Check";
import { Hourglass } from "styled-icons/fa-solid/Hourglass";

import { DialogContainer, DialogContent, DialogHeader, DialogBottomNav } from "@src/ui/dialogs/Dialog";
import { Button, SecondaryButton } from "@src/ui/inputs/Button";
import theme from "@src/ui/theme";

const MonacoContainer = styled.div`
  /* These will cap out at the Dialog container's max width and height */
  width: 90vw;
  height: 50vh;
`;

const ValidatorContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Spacer = styled.span`
  flex-grow: 1;
`;

const DialogContentFullBleed = styled(DialogContent)`
  padding: 0;
`;

/**
 * @typedef Props
 * @property {string} title - Title listed in the dialog header
 * @property {string} text - Initial value of the config text
 * @property {string} defaultText - Default text for reset operation
 * @property {(text: string) => void} onSave - Save button handler
 * @property {() => void} onCancel - Cancel button handler
 *
 * @param {Props}
 */
export default function HubsComponentsConfigDialog({
  title,
  text,
  defaultText,
  onSave = () => {},
  onCancel = () => {}
}) {
  const monacoEditorRef = useRef();
  /**
   * @typedef State
   * @property {"done" | "validating"} status
   * @property {string[]} problems
   */

  /** @type {State} */
  const intitialState = { status: "done", problems: [] };
  const [state, setState] = useState(intitialState);

  const onMount = (editor, monaco) => {
    monacoEditorRef.current = editor;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
      trailingCommas: "error"
    });
  };
  const onValidate = markers => {
    // TODO: add custom JSON schema to enforce our desired config file structure
    // https://github.com/suren-atoyan/monaco-react/issues/69
    const problems = markers.map(marker => `Line ${marker.startLineNumber}: ${marker.message}`);
    setState({ status: "done", problems });
  };
  const onReset = () => {
    monacoEditorRef.current.setValue(defaultText);
  };
  const onClickSave = () => {
    onSave(monacoEditorRef.current.getValue());
  };
  const onChange = () => {
    setState({ status: "validating", problems: [] });
  };

  // TODO: show `problems` contents in tooltip on icon hover
  const getIconInfo = () => {
    if (state.status === "validating") return { Component: Hourglass, color: theme.text };
    else {
      if (state.problems.length === 0) return { Component: Check, color: theme.green };
      else return { Component: Times, color: theme.red };
    }
  };
  const icon = getIconInfo();
  const canSave = state.status === "done" && state.problems.length === 0;

  return (
    <DialogContainer as="div">
      <DialogHeader>
        <span>{title}</span>
      </DialogHeader>
      <DialogContentFullBleed>
        <MonacoContainer>
          <MonacoEditor
            theme="vs-dark"
            defaultLanguage="json"
            options={{
              minimap: { enabled: false },
              tabSize: 2
            }}
            defaultValue={text}
            onMount={onMount}
            onValidate={onValidate}
            onChange={onChange}
          />
        </MonacoContainer>
      </DialogContentFullBleed>
      <DialogBottomNav>
        <ValidatorContainer>
          <span>Valid JSON:</span>
          <icon.Component size={14} color={icon.color} />
        </ValidatorContainer>
        <SecondaryButton onClick={onReset}>Reset</SecondaryButton>
        <Spacer />
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <Button onClick={onClickSave} disabled={!canSave}>
          Save
        </Button>
      </DialogBottomNav>
    </DialogContainer>
  );
}

HubsComponentsConfigDialog.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  defaultText: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};
