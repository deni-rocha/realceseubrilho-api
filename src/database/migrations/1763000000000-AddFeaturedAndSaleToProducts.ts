import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFeaturedAndSaleToProducts1763000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna isFeatured (produto em destaque)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'is_featured',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Adicionar coluna isOnSale (produto em promoção)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'is_on_sale',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Adicionar coluna salePrice (preço promocional)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'sale_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'sale_price');
    await queryRunner.dropColumn('products', 'is_on_sale');
    await queryRunner.dropColumn('products', 'is_featured');
  }
}
