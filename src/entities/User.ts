import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsIn } from 'class-validator';
import { roles } from '../utils/roles';

export interface UserInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  photoUrl?: string;
  verified?: boolean;
  status?: 'active' | 'suspended';
  userType: 'Admin' | 'Buyer' | 'Vendor';
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @Column()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Column()
  @IsNotEmpty()
  password!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  gender!: string;

  @Column()
  @IsNotEmpty()
  phoneNumber!: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  verified!: boolean;

  @Column({ default: 'active' })
  @IsNotEmpty()
  @IsIn(['active', 'suspended'])
  status!: 'active' | 'suspended';

  @Column({ default: 'Buyer' })
  @IsNotEmpty()
  @IsIn(['Admin', 'Buyer', 'Vendor'])
  userType!: 'Admin' | 'Buyer' | 'Vendor';

  @Column({ default: false })
  @IsBoolean()
  twoFactorEnabled!: boolean;

  @Column({ nullable: true })
  twoFactorCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  twoFactorCodeExpiresAt?: Date;

  @Column()
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  setRole (): void {
    this.role = this.userType === 'Vendor' ? roles.vendor : roles.buyer;
  }
}
