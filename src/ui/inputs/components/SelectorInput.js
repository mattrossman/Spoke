import React from "react";
import PropTypes from "prop-types";
import { CollapsibleContainer, CollapsibleLabel, CollapsibleContent } from "@src/ui/inputs/Collapsible";
import SelectInput from "@src/ui/inputs/SelectInput";
import InputGroup from "@src/ui/inputs/InputGroup";
import { CaretRight } from "styled-icons/fa-solid/CaretRight";
import { CaretDown } from "styled-icons/fa-solid/CaretDown";

/** @type {{label: string, value: MOZ.Selector.Type}[]} */
const selectorTypeOptions = [
  { label: "Root", value: "root" },
  { label: "Object", value: "object" },
  { label: "Material", value: "material" }
];

/**
 * Selector dropdown available on ModelNode components
 *
 * @typedef Props
 * @property {MOZ.Selector.Class} selector
 * @property {MOZ.Node.SpokeNode} node
 * @property {(value: MOZ.Selector.Class) => void} onChange
 *
 * @param {Props} props
 */
export default function SelectorInput({ selector, node, onChange }) {
  /** @param {(value: MOZ.Selector.Class) => void} mutate */
  const set = mutate => {
    mutate(selector);
    onChange(selector);
  };

  /** @param {string} value */
  const onChangeSelectorType = value => {
    set(selector => {
      selector.type = value;
      selector.value = []; // Reset stale values
    });
  };

  /** @param {{label: string, value: number}[]} options */
  const onChangeSelectorValue = options => {
    set(selector => {
      if (options) selector.value = options.map(option => option.label);
      else selector.value = [];
    });
  };

  const toggleCollapsed = () => {
    set(selector => (selector.collapsed = !selector.collapsed));
  };

  const selectorValueOptions = selector.getOptions(node).map((value, index) => ({
    label: value,
    value: index
  }));

  const activeSelectorValueOptions = selectorValueOptions.filter(option => selector.value.includes(option.label));

  const Caret = selector.collapsed ? CaretRight : CaretDown;

  return (
    <CollapsibleContainer>
      <CollapsibleLabel onClick={toggleCollapsed}>
        <Caret size={14} />
        Selector
      </CollapsibleLabel>
      {!selector.collapsed && (
        <CollapsibleContent>
          <InputGroup name="Type">
            <SelectInput options={selectorTypeOptions} value={selector.type} onChange={onChangeSelectorType} />
          </InputGroup>
          {selector.type !== "root" && (
            <InputGroup name="Value">
              <SelectInput
                options={selectorValueOptions}
                value={activeSelectorValueOptions}
                onChange={onChangeSelectorValue}
                isMulti
              />
            </InputGroup>
          )}
        </CollapsibleContent>
      )}
    </CollapsibleContainer>
  );
}

SelectorInput.propTypes = {
  selector: PropTypes.object,
  node: PropTypes.object,
  onChange: PropTypes.func
};
