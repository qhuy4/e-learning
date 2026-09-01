import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '@/modules/locations/domain/entity/country.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'country_code', type: 'char', length: 2 })
  countryCode: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @ManyToOne(() => Country, (country) => country.cities)
  @JoinColumn({
    name: 'country_code',
    referencedColumnName: 'code',
  })
  country: Country;
}