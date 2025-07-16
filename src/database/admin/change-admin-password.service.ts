import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangeAdminPasswordService {
  private readonly logger = new Logger(ChangeAdminPasswordService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async changeAdminPassword(adminEmail: string, newPassword: string) {
    const admin = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role'],
    });

    if (!admin) {
      throw new Error('Admin não encontrado');
    }

    if (admin.role.name !== 'ADMIN') {
      throw new Error('Usuário não é um admin');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;

    await this.userRepository.save(admin);
    this.logger.log(`Senha do admin ${adminEmail} alterada com sucesso!`);
  }
}
