import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '@/modules/locations/domain/entity/city.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'char', length: 2, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}