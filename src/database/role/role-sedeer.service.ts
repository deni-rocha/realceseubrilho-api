import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../role/entities/role.entity';

@Injectable()
export class RoleSeederService implements OnModuleInit {
  private readonly logger = new Logger(RoleSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando o seeding de papéis...');
    await this.seedRoles();
  }

  async seedRoles() {
    const defaultRoles = [
      { name: 'CUSTOMER', description: 'Cliente da loja' },
      {
        name: 'ADMIN',
        description: 'Administrador do sistema com acesso total',
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        this.logger.log(`Papel '${roleData.name}' criado com sucesso.`);
      } else {
        this.logger.log(`Papel '${roleData.name}' já existe. Ignorando.`);
      }
    }
    this.logger.log('Seeding de papéis concluído.');
  }
}
