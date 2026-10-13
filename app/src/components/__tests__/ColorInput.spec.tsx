import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ColorInput } from '../ColorInput';

describe('ColorInput', () => {
  it('shows the current color and validation error', () => {
    const { getByText } = render(
      <ColorInput
        label="Cor"
        value="#00B37E"
        onChangeColor={jest.fn()}
        error="Selecione uma cor"
      />,
    );

    expect(getByText('#00B37E')).toBeTruthy();
    expect(getByText('Selecione uma cor')).toBeTruthy();
  });

  it('offers 15 distinct choices and selects a color', () => {
    const onChangeColor = jest.fn();
    const { getByText, getByLabelText, getAllByLabelText } = render(
      <ColorInput value="#00B37E" onChangeColor={onChangeColor} />,
    );

    fireEvent.press(getByText('#00B37E'));
    expect(getByText('Escolha a cor do time')).toBeTruthy();
    expect(getAllByLabelText(/Selecionar cor/)).toHaveLength(15);
    fireEvent.press(getByLabelText('Selecionar cor #F59E0B'));
    expect(onChangeColor).toHaveBeenCalledWith('#F59E0B');
  });
});
