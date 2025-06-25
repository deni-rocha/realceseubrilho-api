import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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

  async create(createUserDto: CreateUserDto) {
    const defaultRole = await this.rolesRepository.findOne({
      where: { name: 'USER' },
    });

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: defaultRole!,
    });

    await this.usersRepository.save(user);

    return { nome: user.name, email: user.email, id: user.id };
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
    return this.usersRepository.findOne({
      where: { id: id },
      relations: ['role'],
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
    });
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
    return { id: user.id, nome: user.name, email: user.email };
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.usersRepository.remove(user);
    return { message: 'Usuário removido com sucesso' };
  }
}
