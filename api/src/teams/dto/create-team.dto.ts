import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString({ message: 'O nome do time deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do time é obrigatório.' })
  @MinLength(2, { message: 'O nome do time deve ter no mínimo 2 caracteres.' })
  name: string;

  @IsString({ message: 'A cor deve ser informada em formato hexadecimal.' })
  @IsNotEmpty({ message: 'A cor hexadecimal é obrigatória.' })
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'A cor deve estar no formato hexadecimal válido (ex: #00B37E).',
  })
  colorHex: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  description?: string;
}

