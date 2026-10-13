import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders label, placeholder, and error message', () => {
    const { getByText, getByPlaceholderText } = render(
      <Input label="Descrição" placeholder="Digite aqui" error="Obrigatória" />,
    );
    expect(getByText('Descrição')).toBeTruthy();
    expect(getByPlaceholderText('Digite aqui')).toBeTruthy();
    expect(getByText('Obrigatória')).toBeTruthy();
  });

  it('forwards text changes and supports multiline input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Detalhes" multiline onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByPlaceholderText('Detalhes'), 'Informações');
    expect(onChangeText).toHaveBeenCalledWith('Informações');
  });
});
