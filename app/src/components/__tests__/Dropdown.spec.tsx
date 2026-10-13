import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Dropdown } from '../Dropdown';

describe('Dropdown', () => {
  const items = [
    { label: 'Time A', value: 'a', color: '#00B37E' },
    { label: 'Time B', value: 'b' },
  ];

  it('renders a selected option and the error state', () => {
    const { getByText } = render(
      <Dropdown
        label="Time"
        items={items}
        value="a"
        onSelect={jest.fn()}
        error="Obrigatório"
      />,
    );
    expect(getByText('Time A')).toBeTruthy();
    expect(getByText('Obrigatório')).toBeTruthy();
  });

  it('opens options and returns the selected value', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Dropdown
        items={items}
        value=""
        placeholder="Escolha"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByText('Escolha'));
    fireEvent.press(getByText('Time B'));
    expect(onSelect).toHaveBeenCalledWith('b');
  });
});
