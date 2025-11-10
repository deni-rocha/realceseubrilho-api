import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductCategoryManyToMany1762784687314
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar a tabela de relacionamento many-to-many
    await queryRunner.query(`
      CREATE TABLE "product_categories_relation" (
        "product_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        CONSTRAINT "PK_product_categories_relation" PRIMARY KEY ("product_id", "category_id")
      )
    `);

    // Adicionar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX "IDX_product_categories_relation_product_id"
      ON "product_categories_relation" ("product_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_categories_relation_category_id"
      ON "product_categories_relation" ("category_id")
    `);

    // Adicionar foreign keys
    await queryRunner.query(`
      ALTER TABLE "product_categories_relation"
      ADD CONSTRAINT "FK_product_categories_relation_product_id"
      FOREIGN KEY ("product_id") REFERENCES "products"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_categories_relation"
      ADD CONSTRAINT "FK_product_categories_relation_category_id"
      FOREIGN KEY ("category_id") REFERENCES "product_categories"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Migrar dados existentes da coluna category_id para a nova tabela
    await queryRunner.query(`
      INSERT INTO "product_categories_relation" ("product_id", "category_id")
      SELECT "id", "category_id"
      FROM "products"
      WHERE "category_id" IS NOT NULL
    `);

    // Remover a foreign key antiga
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "FK_products_category_id"
    `);

    // Remover a coluna category_id da tabela products
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "category_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Adicionar novamente a coluna category_id
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "category_id" uuid
    `);

    // Migrar dados de volta (pega apenas a primeira categoria de cada produto)
    await queryRunner.query(`
      UPDATE "products" p
      SET "category_id" = (
        SELECT "category_id"
        FROM "product_categories_relation" pcr
        WHERE pcr."product_id" = p."id"
        LIMIT 1
      )
    `);

    // Recriar a foreign key
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_category_id"
      FOREIGN KEY ("category_id") REFERENCES "product_categories"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Remover a tabela de relacionamento
    await queryRunner.query(`
      DROP TABLE "product_categories_relation"
    `);
  }
}
