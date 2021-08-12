import React from "react";
import PropTypes from "prop-types";
import InputGroup from "@src/ui/inputs/InputGroup";
import NumericInputGroup from "@src/ui/inputs/NumericInputGroup";
import SelectInput from "@src/ui/inputs/SelectInput";
import ColorInput from "@src/ui/inputs/ColorInput";
import Vector2Input from "@src/ui/inputs/Vector2Input";
import StringInput from "@src/ui/inputs/StringInput";
import BooleanInput from "@src/ui/inputs/BooleanInput";
import Vector3Input from "@src/ui/inputs/Vector3Input";
import NodeRefInput from "@src/ui/inputs/components/NodeRefInput";
import ArrayInputGroup from "@src/ui/inputs/components/ArrayInputGroup";
import { unitLabels } from "@src/editor/components/propertyUtils";

/**
 * @typedef Props
 * @property {string} name
 * @property {MOZ.Property.Value} value
 * @property {(value: MOZ.Property.Value) => void} onChange
 * @property {MOZ.Property.Entry} config
 * @property {MOZ.Config.Types} types
 *
 * @param {Props}
 */
export default function PropertyInput({ name, value, onChange, config, types }) {
  const sharedInputGroupProps = { name, info: config.description };
  const sharedInputProps = { value, onChange, unit: unitLabels[config.unit] };
  switch (config.type) {
    case "string":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <StringInput {...sharedInputProps} />
        </InputGroup>
      );
    case "bool":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <BooleanInput {...sharedInputProps} />
        </InputGroup>
      );
    case "float":
      return (
        <NumericInputGroup
          smallStep={0.01}
          mediumStep={0.05}
          largeStep={0.1}
          {...sharedInputProps}
          {...sharedInputGroupProps}
        />
      );
    case "int":
      return (
        <NumericInputGroup
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1}
          convertTo={v => Math.floor(v)}
          displayPrecision={0}
          {...sharedInputProps}
          {...sharedInputGroupProps}
        />
      );
    case "color":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <ColorInput {...sharedInputProps} />
        </InputGroup>
      );
    case "vec2":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <Vector2Input smallStep={0.01} mediumStep={0.05} largeStep={0.1} {...sharedInputProps} />
        </InputGroup>
      );
    case "vec3":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <Vector3Input smallStep={0.01} mediumStep={0.05} largeStep={0.1} {...sharedInputProps} />
        </InputGroup>
      );
    case "nodeRef":
      return (
        <InputGroup {...sharedInputGroupProps}>
          <NodeRefInput {...sharedInputProps} />
        </InputGroup>
      );
    case "enum":
      if (config.items) {
        const options = config.items.map(([value, label, description]) => ({ value, label, description }));
        const activeOption = options.find(option => option.value === value);

        /**
         * Setting up the tooltip next to enum inputs
         *
         * In the Blender extension, they treat the `.description` field for enum types
         * like a short prefix for the enum labels, so we'll follow that pattern.
         * The description for the option then goes below this.
         */
        let enumInfo = config.description ? `${config.description}: ${activeOption.label}` : "";
        enumInfo += config.description && activeOption.description.length > 0 ? "\n" : "";
        enumInfo += activeOption.description;
        return (
          <InputGroup name={name} info={enumInfo}>
            <SelectInput options={options} {...sharedInputProps} />
          </InputGroup>
        );
      } else {
        throw new Error(`Missing or empty "items" array for enum property "${name}"`);
      }
    case "array":
      return <ArrayInputGroup name={name} types={types} arrayType={config.arrayType} {...sharedInputProps} />;
    default:
      throw new Error("Unhandled property type in <PropertyInput />");
  }
}

PropertyInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired
};
