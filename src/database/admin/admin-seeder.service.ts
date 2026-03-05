import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/role/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeederService {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async seedAdmin() {
    this.logger.log('Iniciando o seeding do admin padrão...');
    await this.retrySeedAdmin(5, 1000);
  }

  private async retrySeedAdmin(maxRetries: number, delayMs: number) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.seedAdminInternal();
        this.logger.log('✅ Seeding do admin concluído');
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          this.logger.error(
            'Falha ao criar admin após várias tentativas:',
            (error as Error).message,
          );
          return;
        }
        this.logger.log(
          `Tentativa ${i + 1} falhou. Tentando novamente em ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  private async seedAdminInternal() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      throw new Error(
        'Role ADMIN não encontrada. Execute o seeder de roles primeiro.',
      );
    }

    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@realceseubrilho.com',
    );
    const adminPassword = this.configService.get<string>(
      'ADMIN_PASSWORD',
      'admin123',
    );
    const adminName = this.configService.get<string>(
      'ADMIN_NAME',
      'Administrador do Sistema',
    );

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log(`Admin com email ${adminEmail} já existe. Ignorando.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = this.userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: adminRole,
      verified: true,
    });

    await this.userRepository.save(adminUser);
    this.logger.log('✅ Admin padrão criado com sucesso!');
    this.logger.log(`📧 Email: ${adminEmail}`);
    this.logger.log(`🔑 Senha: ${adminPassword}`);
    this.logger.warn(
      '⚠️  IMPORTANTE: Altere a senha do admin após o primeiro login!',
    );
  }
}
