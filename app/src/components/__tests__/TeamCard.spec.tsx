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
});

