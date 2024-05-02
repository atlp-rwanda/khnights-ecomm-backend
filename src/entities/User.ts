import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsIn } from 'class-validator';
  
  @Entity()
  @Unique(['email'])
  export class User {
    static User: any;
    save() {
        throw new Error('Method not implemented.');
    }
    static create(arg0: { accountId: string; name: string; provider: string; }): User | PromiseLike<User | null> | null {
        throw new Error('Method not implemented.');
    }
    static findOne(arg0: { accountId: any; provider: string; }) {
        throw new Error('Method not implemented.');
    }
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
  
    @Column()
    @IsNotEmpty()
    @IsBoolean()
    verified!: boolean;
  
    @Column()
    @IsNotEmpty()
    @IsIn(['active', 'suspended'])
    status!: 'active' | 'suspended';
  
    @Column({ default: "Buyer" })
    @IsNotEmpty()
    @IsIn(['Admin', 'Buyer', 'Vendor'])
    userType!: 'Admin' | 'Buyer' | 'Vendor';
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    @IsString()
    accountId?: string;
  
    @Column({ nullable: true })
    @IsString()
    name?: string;
  
    @Column({ nullable: true })
    @IsString()
    photoURL?: string;
  
    @Column({ nullable: true })
    @IsString()
    provider?: string;
    
  }