import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render the button with the provided title', () => {
    const { getByText } = render(<Button title="Criar time" />);
    expect(getByText('Criar time')).toBeTruthy();
  });

  it('should trigger onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Salvar tarefa" onPress={onPressMock} />,
    );

    fireEvent.press(getByText('Salvar tarefa'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should not trigger onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Desabilitado" disabled onPress={onPressMock} />,
    );

    fireEvent.press(getByText('Desabilitado'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows a loader and disables presses while loading', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <Button title="Salvando" loading onPress={onPressMock} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('supports secondary and danger variants', () => {
    const { getByText } = render(
      <>
        <Button title="Voltar" variant="secondary" />
        <Button title="Excluir" variant="danger" />
      </>,
    );
    expect(getByText('Voltar')).toBeTruthy();
    expect(getByText('Excluir')).toBeTruthy();
  });
});
