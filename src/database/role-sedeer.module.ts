import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeederService } from './role-sedeer.service';
import { Role } from '@/role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
  ],
  providers: [
    RoleSeederService,
  ],
  exports: [
    TypeOrmModule.forFeature([Role]),
    RoleSeederService,
  ],
})
export class DatabaseModule {}