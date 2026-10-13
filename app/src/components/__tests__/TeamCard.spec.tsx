import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TeamCard } from '../TeamCard';

describe('TeamCard Component', () => {
  const mockTeam = {
    id: 'team-1',
    name: 'Claro Tech',
    colorHex: '#00B37E',
    description: 'Squad de inovação',
    createdAt: '2026-10-11T10:00:00.000Z',
    updatedAt: '2026-10-11T10:00:00.000Z',
  };

  it('should render the team name and description', () => {
    const { getByText } = render(
      <TeamCard team={mockTeam} onPress={jest.fn()} />,
    );

    expect(getByText('Claro Tech')).toBeTruthy();
    expect(getByText('Squad de inovação')).toBeTruthy();
  });

  it('should trigger onPress when the card is clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TeamCard team={mockTeam} onPress={onPressMock} />,
    );

    fireEvent.press(getByText('Claro Tech'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('opens team actions on long press and dispatches edit or delete', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { getByText } = render(
      <TeamCard
        team={mockTeam}
        onPress={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    fireEvent(getByText('Claro Tech'), 'longPress');
    expect(getByText('Editar')).toBeTruthy();
    expect(getByText('Excluir')).toBeTruthy();
    fireEvent.press(getByText('Editar'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('closes the actions modal without invoking actions', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { getByText } = render(
      <TeamCard
        team={mockTeam}
        onPress={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    fireEvent(getByText('Claro Tech'), 'longPress');
    fireEvent.press(getByText('Cancelar'));
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('dispatches deletion from the long-press actions modal', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <TeamCard team={mockTeam} onPress={jest.fn()} onDelete={onDelete} />,
    );
    fireEvent(getByText('Claro Tech'), 'longPress');
    fireEvent.press(getByText('Excluir'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
