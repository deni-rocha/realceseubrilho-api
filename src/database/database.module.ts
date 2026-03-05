import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule, InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoleSeederService } from './role/role-sedeer.service';
import { Role } from '@/role/entities/role.entity';
import { User } from '@/users/entities/user.entity';
import { AdminSeederService } from './admin/admin-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  providers: [RoleSeederService, AdminSeederService],
  exports: [
    TypeOrmModule.forFeature([Role, User]),
    RoleSeederService,
    AdminSeederService,
  ],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  @InjectDataSource()
  private dataSource: DataSource;

  constructor(
    private readonly roleSeederService: RoleSeederService,
    private readonly adminSeederService: AdminSeederService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔄 Executando migrations...');
    await this.dataSource.runMigrations();
    this.logger.log('✅ Migrations concluídas');

    this.logger.log('🔄 Executando seeders...');
    await this.roleSeederService.seedRoles();
    await this.adminSeederService.seedAdmin();
    this.logger.log('✅ Seeders concluídos');
  }
}
