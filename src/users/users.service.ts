import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, QueryRunner } from 'typeorm';
import { Role } from '@/role/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  // 🔧 Método base para evitar repetição
  private async findUserWithRelations(
    where: any,
    includePassword: boolean = false,
  ) {
    const select: any = {
      id: true,
      name: true,
      email: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
      role: {
        id: true,
        name: true,
      },
    };

    if (includePassword) {
      select.password = true;
    }

    return this.usersRepository.findOne({
      where,
      relations: ['role'],
      select,
    });
  }

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.role) {
      createUserDto.role = 'CUSTOMER';
    }

    const role = await this.rolesRepository.findOne({
      where: { name: createUserDto.role },
    });

    if (!role) {
      throw new BadRequestException('Role não encontrada');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: role,
    });

    await this.usersRepository.save(user);

    return { name: user.name, email: user.email, id: user.id };
  }

  findAll() {
    return this.usersRepository.find({
      relations: ['role'],
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          id: true,
          name: true,
        },
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 10,
      skip: 0,
    });
  }

  findOne(id: string) {
    return this.findUserWithRelations({ id });
  }

  findByEmail(email: string) {
    return this.findUserWithRelations({ email }, true); // true = incluir password
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const role = await this.rolesRepository.findOne({
      where: { name: updateUserDto.role },
    });

    if (!role) {
      throw new BadRequestException(
        'Erro ao atualizar, conflito ao inserir permissão do usuário',
      );
    }

    this.usersRepository.merge(user, {
      name: updateUserDto.name,
      email: updateUserDto.email,
      password: updateUserDto.password,
      role: role,
    });
    await this.usersRepository.save(user);
    return { id: user.id, name: user.name, email: user.email };
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.email === 'admin@realceseubrilho.com') {
      throw new ConflictException('Não é possível deletar esse usuário');
    }

    await this.usersRepository.remove(user);
    return { message: 'Usuário removido com sucesso' };
  }

  async markAsVerified(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.verified = true;
    await this.usersRepository.save(user);

    return { message: 'Usuário verificado com sucesso' };
  }

  async createWithTransaction(
    createUserDto: CreateUserDto,
    queryRunner: QueryRunner,
  ) {
    if (!createUserDto.role) {
      createUserDto.role = 'CUSTOMER';
    }

    const role = await this.rolesRepository.findOne({
      where: { name: createUserDto.role },
    });

    if (!role) {
      throw new BadRequestException('Role não encontrada');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: role,
    });

    // Usar o queryRunner para salvar
    return await queryRunner.manager.save(User, user);
  }
}
