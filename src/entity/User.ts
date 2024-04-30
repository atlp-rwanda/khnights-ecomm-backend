import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
  } from 'typeorm';
  
  @Entity()
  @Unique(['email'])
  export class User {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    firstName!: string;
  
    @Column()
    lastName!: string;
  
    @Column()
    email!: string;
  
    @Column()
    password!: string;
  
    @Column({ default: "User"} )
    userType!: string;
  }
  