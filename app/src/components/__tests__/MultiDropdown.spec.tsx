import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MultiDropdown } from '../MultiDropdown';

describe('MultiDropdown', () => {
  const items = [
    { label: 'Time A', value: 'a', color: '#00B37E' },
    { label: 'Time B', value: 'b', color: '#F59E0B' },
  ];

  it('shows selected chips and validation feedback', () => {
    const { getByText } = render(
      <MultiDropdown
        label="Times"
        items={items}
        selectedValues={['a']}
        onChangeValues={jest.fn()}
        error="Selecione ao menos um"
      />,
    );
    expect(getByText('Time A')).toBeTruthy();
    expect(getByText('Selecione ao menos um')).toBeTruthy();
  });

  it('allows selecting another team and confirms the selection', () => {
    const onChangeValues = jest.fn();
    const { getByText } = render(
      <MultiDropdown
        items={items}
        selectedValues={['a']}
        onChangeValues={onChangeValues}
      />,
    );
    fireEvent.press(getByText('Time A'));
    fireEvent.press(getByText('Time B'));
    expect(onChangeValues).toHaveBeenCalledWith(['a', 'b']);
    fireEvent.press(getByText('Concluir seleção'));
  });

  it('renders an empty-state message when there are no options', () => {
    const { getByText } = render(
      <MultiDropdown items={[]} selectedValues={[]} onChangeValues={jest.fn()} />,
    );
    fireEvent.press(getByText('Selecione os times (opcional)'));
    expect(getByText('Nenhum time disponível.')).toBeTruthy();
  });
});
