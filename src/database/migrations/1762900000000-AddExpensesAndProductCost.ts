import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddExpensesAndProductCost1762900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna 'cost' na tabela 'products'
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'cost',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        default: 0,
      }),
    );

    // Criar tabela 'expenses'
    await queryRunner.createTable(
      new Table({
        name: 'expenses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'INVENTORY',
              'MARKETING',
              'SHIPPING',
              'PACKAGING',
              'OPERATIONAL',
              'SALARY',
              'TAXES',
              'MAINTENANCE',
              'SOFTWARE',
              'OTHER',
            ],
            isNullable: false,
          },
          {
            name: 'expense_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'receipt_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Criar foreign key para 'created_by_user_id'
    await queryRunner.createForeignKey(
      'expenses',
      new TableForeignKey({
        columnNames: ['created_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key da tabela 'expenses'
    const expensesTable = await queryRunner.getTable('expenses');
    const foreignKey = expensesTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('created_by_user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('expenses', foreignKey);
    }

    // Remover tabela 'expenses'
    await queryRunner.dropTable('expenses');

    // Remover coluna 'cost' da tabela 'products'
    await queryRunner.dropColumn('products', 'cost');
  }
}
