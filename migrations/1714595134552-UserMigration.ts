import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserMigration1614495123940 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "gender" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "photoUrl" character varying,
                "verified" boolean NOT NULL,
                "status" character varying NOT NULL CHECK (status IN ('active', 'suspended')),
                "userType" character varying NOT NULL DEFAULT 'Buyer' CHECK (userType IN ('Admin', 'Buyer', 'Vendor')),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
