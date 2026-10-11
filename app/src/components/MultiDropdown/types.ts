import { DropdownItem } from '../Dropdown/types';

export interface MultiDropdownProps {
  label?: string;
  placeholder?: string;
  items: DropdownItem[];
  selectedValues: string[];
  onChangeValues: (values: string[]) => void;
  error?: string;
}

