import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestOrders1762720000000 implements MigrationInterface {
  name = 'AddGuestOrders1762720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna guest_name
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "guest_name" character varying`,
    );

    // Adicionar coluna guest_whatsapp
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "guest_whatsapp" character varying`,
    );

    // Tornar user_id nullable
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter user_id para NOT NULL
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL`,
    );

    // Remover coluna guest_whatsapp
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "guest_whatsapp"`,
    );

    // Remover coluna guest_name
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "guest_name"`);
  }
}
