import { Team } from '../../types';

export interface TeamCardProps {
  team: Team;
  onPress: () => void;
  onDelete?: () => void;
}

