import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDataBaseSetup1769445674238 implements MigrationInterface {
    name = 'InitialDataBaseSetup1769445674238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL, \`unit_price\` decimal(10,2) NOT NULL, \`sub_total\` decimal(10,2) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`cart_id\` varchar(36) NOT NULL, \`product_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_a75bfadcd8291a0538ab7abfdc\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`price\` decimal(10,2) NOT NULL, \`cost\` decimal(10,2) NULL, \`is_featured\` tinyint NOT NULL DEFAULT 0, \`is_on_sale\` tinyint NOT NULL DEFAULT 0, \`sale_price\` decimal(10,2) NULL, \`stockQuantity\` int NOT NULL DEFAULT '0', \`imageUrls\` text NOT NULL DEFAULT '', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL, \`unit_price\` decimal(10,2) NOT NULL, \`subtotal\` decimal(10,2) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`order_id\` varchar(36) NOT NULL, \`product_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`payment_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`status\` enum ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING', \`transaction_id\` varchar(255) NULL, \`method\` enum ('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'PIX') NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`order_id\` varchar(36) NOT NULL, UNIQUE INDEX \`REL_b2f7b823a21562eeca20e72b00\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` varchar(36) NOT NULL, \`order_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`status\` enum ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING', \`total_amount\` decimal(10,2) NOT NULL, \`shipping_address\` varchar(255) NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`guest_name\` varchar(255) NULL, \`guest_whatsapp\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_5b3e94bd2aedc184f9ad8c1043\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`verified\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`role_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shopping_carts\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NOT NULL, UNIQUE INDEX \`REL_7d5a425bf2a31aa1002a041ebb\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`expenses\` (\`id\` varchar(36) NOT NULL, \`description\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`category\` enum ('INVENTORY', 'MARKETING', 'SHIPPING', 'PACKAGING', 'OPERATIONAL', 'SALARY', 'TAXES', 'MAINTENANCE', 'SOFTWARE', 'OTHER') NOT NULL, \`expense_date\` date NOT NULL, \`notes\` text NULL, \`receipt_url\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`created_by_user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`email_verification_tokens\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(255) NOT NULL, \`expires_at\` timestamp NOT NULL, \`used\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`user_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`userId\` varchar(36) NULL, UNIQUE INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`password_reset_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`used\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, UNIQUE INDEX \`IDX_ab673f0e63eac966762155508e\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_categories_relation\` (\`product_id\` varchar(36) NOT NULL, \`category_id\` varchar(36) NOT NULL, INDEX \`IDX_cb50e4a470195a29b0cf8bcb66\` (\`product_id\`), INDEX \`IDX_ae1f5d711f0e342c52770025ec\` (\`category_id\`), PRIMARY KEY (\`product_id\`, \`category_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_6385a745d9e12a89b859bb25623\` FOREIGN KEY (\`cart_id\`) REFERENCES \`shopping_carts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_30e89257a105eab7648a35c7fce\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_b2f7b823a21562eeca20e72b006\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_5b3e94bd2aedc184f9ad8c10439\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shopping_carts\` ADD CONSTRAINT \`FK_7d5a425bf2a31aa1002a041ebb6\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_45bf07fc1290c059e3884753e89\` FOREIGN KEY (\`created_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD CONSTRAINT \`FK_fdcb77f72f529bf65c95d72a147\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` ADD CONSTRAINT \`FK_d6a19d4b4f6c62dcd29daa497e2\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_categories_relation\` ADD CONSTRAINT \`FK_cb50e4a470195a29b0cf8bcb66d\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`product_categories_relation\` ADD CONSTRAINT \`FK_ae1f5d711f0e342c52770025ecf\` FOREIGN KEY (\`category_id\`) REFERENCES \`product_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_categories_relation\` DROP FOREIGN KEY \`FK_ae1f5d711f0e342c52770025ecf\``);
        await queryRunner.query(`ALTER TABLE \`product_categories_relation\` DROP FOREIGN KEY \`FK_cb50e4a470195a29b0cf8bcb66d\``);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` DROP FOREIGN KEY \`FK_d6a19d4b4f6c62dcd29daa497e2\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP FOREIGN KEY \`FK_fdcb77f72f529bf65c95d72a147\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_45bf07fc1290c059e3884753e89\``);
        await queryRunner.query(`ALTER TABLE \`shopping_carts\` DROP FOREIGN KEY \`FK_7d5a425bf2a31aa1002a041ebb6\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5b3e94bd2aedc184f9ad8c10439\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_b2f7b823a21562eeca20e72b006\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_30e89257a105eab7648a35c7fce\``);
        await queryRunner.query(`ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_6385a745d9e12a89b859bb25623\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae1f5d711f0e342c52770025ec\` ON \`product_categories_relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb50e4a470195a29b0cf8bcb66\` ON \`product_categories_relation\``);
        await queryRunner.query(`DROP TABLE \`product_categories_relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_ab673f0e63eac966762155508e\` ON \`password_reset_tokens\``);
        await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` ON \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`email_verification_tokens\``);
        await queryRunner.query(`DROP TABLE \`expenses\``);
        await queryRunner.query(`DROP INDEX \`REL_7d5a425bf2a31aa1002a041ebb\` ON \`shopping_carts\``);
        await queryRunner.query(`DROP TABLE \`shopping_carts\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_5b3e94bd2aedc184f9ad8c1043\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`REL_b2f7b823a21562eeca20e72b00\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_a75bfadcd8291a0538ab7abfdc\` ON \`product_categories\``);
        await queryRunner.query(`DROP TABLE \`product_categories\``);
        await queryRunner.query(`DROP TABLE \`cart_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }

}
