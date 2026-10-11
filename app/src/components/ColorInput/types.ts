export interface ColorInputProps {
  label?: string;
  value: string;
  onChangeColor: (hex: string) => void;
  error?: string;
}

