export interface DropdownItem {
  label: string;
  value: string;
  color?: string;
}

export interface DropdownProps {
  label?: string;
  placeholder?: string;
  items: DropdownItem[];
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
}

