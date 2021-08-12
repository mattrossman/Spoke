import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Times } from "styled-icons/fa-solid/Times";
import { Button } from "@src/ui/inputs/Button";
import { getCompoundDefault } from "@src/editor/components/propertyUtils";
import PropertyInput from "@src/ui/inputs/components/PropertyInput";

const ArrayContainer = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ArrayLabel = styled.label`
  padding: 8px 8px 0;
  color: ${props => props.theme.text2};
`;

/**
 * Group of custom "arrayType" inputs for "array" component properties
 *
 * @typedef ArrayInputGroupProps
 * @property {string} name
 * @property {MOZ.Property.CompoundValue[]} value
 * @property {(value: MOZ.Property.CompoundValue[]) => void} onChange
 * @property {MOZ.Config.Types} types
 * @property {string} arrayType
 *
 * @param {ArrayInputGroupProps} props
 */
export default function ArrayInputGroup({ name, value: arrayValue, onChange, types, arrayType }) {
  const definition = types[arrayType];
  if (!definition) throw new Error(`No definition found for arrayType "${arrayType}"`);

  /** @type {(item: MOZ.Property.Value) => void} */
  const addItem = item => {
    const newArray = [...arrayValue, item];
    onChange(newArray);
  };

  /** @type {(item: MOZ.Property.Value, index: number) => void} */
  const setItemAtIndex = (item, index) => {
    arrayValue[index] = item;
    onChange(arrayValue);
  };

  /** @type {(index: number) => void} */
  const removeItemAtIndex = index => {
    arrayValue.splice(index, 1);
    onChange(arrayValue);
  };

  return (
    <>
      <ArrayLabel>{name}</ArrayLabel>
      <ArrayContainer>
        {arrayValue.map((compoundValue, i) => (
          <CompoundInput
            key={i}
            types={types}
            definition={definition}
            value={compoundValue}
            onChange={v => setItemAtIndex(v, i)}
            onDelete={() => removeItemAtIndex(i)}
          />
        ))}
        <Button onClick={() => addItem(getCompoundDefault(definition))}>Add item</Button>
      </ArrayContainer>
    </>
  );
}

ArrayInputGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  arrayType: PropTypes.string.isRequired
};

const CompoundContainer = styled.div`
  border-radius: 4px;
  border: 1px solid ${props => props.theme.panel2};
  display: flex;
  align-items: flex-start;
`;

const CompoundPropertiesContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  display: grid;
  place-content: center;
  padding: 0;
  cursor: pointer;
  color: ${props => props.theme.text2};
  :hover {
    color: ${props => props.theme.text};
  }
`;

const PadTopRight = styled.div`
  padding: 8px 8px 0 0;
`;

/**
 * Compound property input for custom types
 *
 * @typedef CompoundInputProps
 * @property {MOZ.Property.CompoundValue} value
 * @property {(value: MOZ.Property.CompoundValue) => void} onChange
 * @property {() => void} onDelete
 * @property {MOZ.Config.TypeDefinition} definition
 * @property {MOZ.Config.Types} types
 *
 * @param {CompoundInputProps}
 */
function CompoundInput({ value: compoundValue, onChange, onDelete, definition, types }) {
  /** @type {(value: MOZ.Property.CompoundValue, property: string)} */
  const onChangeProperty = (value, property) => {
    compoundValue[property] = value;
    onChange(compoundValue);
  };

  return (
    <CompoundContainer>
      <CompoundPropertiesContainer>
        {Object.entries(definition.properties).map(([property, config], i) => (
          <PropertyInput
            key={i}
            name={property}
            types={types}
            config={config}
            value={compoundValue[property]}
            onChange={v => onChangeProperty(v, property)}
          />
        ))}
      </CompoundPropertiesContainer>
      <PadTopRight>
        <DeleteButton onClick={onDelete}>
          <Times size={14} />
        </DeleteButton>
      </PadTopRight>
    </CompoundContainer>
  );
}

CompoundInput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  definition: PropTypes.object.isRequired,
  types: PropTypes.object.isRequired
};
