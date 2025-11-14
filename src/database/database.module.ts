import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
export class DatabaseModule {}
