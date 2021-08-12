import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { InfoTooltip } from "@src/ui/layout/Tooltip";
import { CaretRight } from "styled-icons/fa-solid/CaretRight";
import { CaretDown } from "styled-icons/fa-solid/CaretDown";
import { Times } from "styled-icons/fa-solid/Times";
import { ExclamationTriangle } from "styled-icons/fa-solid/ExclamationTriangle";
import theme from "@src/ui/theme";

import SelectorInput from "@src/ui/inputs/components/SelectorInput";
import PropertyInput from "@src/ui/inputs/components/PropertyInput";

const ComponentContainer = styled.div`
  margin: 4px 0;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.panel2};
`;

const ComponentHeader = styled.div`
  padding: 4px 8px;
  background-color: ${props => props.theme.panel2};
  cursor: pointer;
  display: flex;
`;

const ComponentHeaderLabel = styled.span`
  flex-grow: 1;
  color: ${props => props.theme.text2};
  cursor: pointer;
  :hover {
    color: ${props => props.theme.text};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text2};
  cursor: pointer;
  :hover {
    color: ${props => props.theme.text};
  }
`;

const ComponentBody = styled.div`
  padding: 8px;
`;

const ComponentDescription = styled.p`
  background-color: ${props => props.theme.panel};
  color: ${props => props.theme.text2};
  white-space: pre-wrap;
  padding: 0 8px 8px;
`;

const PaddedTooltip = styled(InfoTooltip)`
  padding: 1px 6px;
`;

/**
 * @typedef Props
 * @property {MOZ.Component.Class} component
 * @property {boolean} enableSelector - Whether the "Selector" dropdown is enabled (only true for ModelNode)
 * @property {(component: MOZ.Component.Class) => void} onChange - Fires when component data changes
 * @property {() => void} onDelete - Fires when user clicks delete button
 *
 * UI block for configuring an A-Frame component
 * @param {Props} props
 */
export default function HubsComponentInput({
  component,
  enableSelector = false,
  onChange = () => {},
  onDelete = () => {}
}) {
  /** @param {(value: MOZ.Component.Class) => void} mutate */
  const set = mutate => {
    mutate(component);
    onChange(component);
  };

  const toggleCollapsed = () => {
    set(component => (component.collapsed = !component.collapsed));
  };

  const onChangeProperty = (property, value) => {
    set(component => {
      component.data[property] = value;
    });
  };

  const onChangeSelector = selector => {
    set(component => (component.selector = selector));
  };

  const CaretComponent = component.collapsed ? CaretRight : CaretDown;
  return (
    <ComponentContainer>
      <ComponentHeader>
        <ComponentHeaderLabel onClick={toggleCollapsed}>
          <CaretComponent size={14} />
          {component.getHubsName()}
        </ComponentHeaderLabel>
        {component.needsUpdate() && (
          <PaddedTooltip info="Outdated config">
            <ExclamationTriangle size={14} color={theme.text2} />
          </PaddedTooltip>
        )}
        <DeleteButton onClick={() => onDelete()}>
          <Times size={14} />
        </DeleteButton>
      </ComponentHeader>
      {!component.collapsed && (
        <ComponentBody>
          {component.config.description && <ComponentDescription>{component.config.description}</ComponentDescription>}
          {Object.entries(component.data).map(([property, value]) => (
            <PropertyInput
              key={property}
              name={property}
              value={value}
              config={component.config.properties[property]}
              types={component.types}
              onChange={newValue => onChangeProperty(property, newValue)}
            />
          ))}
          {enableSelector && (
            <SelectorInput selector={component.selector} node={component.node} onChange={onChangeSelector} />
          )}
        </ComponentBody>
      )}
    </ComponentContainer>
  );
}

HubsComponentInput.propTypes = {
  component: PropTypes.object.isRequired,
  enableSelector: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
