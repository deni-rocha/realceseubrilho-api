import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/role/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando o seeding do admin padrão...');
    await this.seedAdmin();
  }

  async seedAdmin() {
    // Buscar o role ADMIN
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      this.logger.error('Role ADMIN não encontrada. Execute o seeder de roles primeiro.');
      return;
    }

    // Configurações do admin via variáveis de ambiente
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@realceseubrilho.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Administrador do Sistema';

    // Verificar se já existe um admin
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log(`Admin com email ${adminEmail} já existe. Ignorando.`);
      return;
    }

    // Criar o admin padrão
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = this.userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: adminRole,
      verified: true, // Admin já vem verificado
    });

    await this.userRepository.save(adminUser);
    this.logger.log('✅ Admin padrão criado com sucesso!');
    this.logger.log(`📧 Email: ${adminEmail}`);
    this.logger.log(`🔑 Senha: ${adminPassword}`);
    this.logger.warn('⚠️  IMPORTANTE: Altere a senha do admin após o primeiro login!');
  }
}