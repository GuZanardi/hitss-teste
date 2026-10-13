import { Team } from '../../types';

export interface TeamCardProps {
  team: Team;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
