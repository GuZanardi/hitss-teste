import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Header } from '../Header';

describe('Header', () => {
  it('renders title, subtitle and optional icon', () => {
    const { getByText } = render(
      <Header
        title="Times"
        subtitle="Acesse um time"
        renderIcon={() => <Text>ícone</Text>}
      />,
    );
    expect(getByText('Times')).toBeTruthy();
    expect(getByText('Acesse um time')).toBeTruthy();
    expect(getByText('ícone')).toBeTruthy();
  });

  it('calls back and delete actions when provided', () => {
    const onBack = jest.fn();
    const onDelete = jest.fn();
    const { getByLabelText } = render(
      <Header title="Editar" onBack={onBack} onDelete={onDelete} />,
    );
    fireEvent.press(getByLabelText('Voltar'));
    fireEvent.press(getByLabelText('Excluir'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
