import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductImageUrlToArray1762719664467
  implements MigrationInterface
{
  name = 'UpdateProductImageUrlToArray1762719664467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cria uma coluna temporária para armazenar os dados antigos
    await queryRunner.query(
      `ALTER TABLE "products" ADD "imageUrls" text array DEFAULT '{}'`,
    );

    // Migra dados existentes: se imageUrl existe, copia para o array
    await queryRunner.query(
      `UPDATE "products" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL AND "imageUrl" != ''`,
    );

    // Remove a coluna antiga
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUrl"`);

    // Garante que o default seja um array vazio
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "imageUrls" SET DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a coluna antiga de volta
    await queryRunner.query(
      `ALTER TABLE "products" ADD "imageUrl" character varying`,
    );

    // Migra dados de volta: pega o primeiro elemento do array
    await queryRunner.query(
      `UPDATE "products" SET "imageUrl" = "imageUrls"[1] WHERE array_length("imageUrls", 1) > 0`,
    );

    // Remove a nova coluna
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUrls"`);
  }
}
