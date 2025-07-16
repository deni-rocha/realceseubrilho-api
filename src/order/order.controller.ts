import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order-satus.dto';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { UserRole } from '@/role/role.enum';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly nestConfigService: ConfigService,
  ) {}

  @Post()
  async createOrderFromCart(
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
  ) {
    const order = await this.orderService.createOrderFromCart(
      createOrderFromCartDto,
    );

    const contactNumber = this.nestConfigService.get<string>(
      'WHATSAPP_CONTACT_NUMBER',
    );
    if (!contactNumber) {
      throw new Error(
        'Número de contato do WhatsApp não configurado no servidor.',
      );
    }

    const totalAmountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(order.totalAmount);

    const message = `Olá! Gostaria de finalizar meu pedido Nº ${order.id}. Valor total: ${totalAmountFormatted}.`;

    const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodeURIComponent(
      message,
    )}`;

    return {
      message: 'Pedido criado com sucesso! Redirecionando para o WhatsApp.',
      whatsappUrl,
      orderDetails: order, // Opcional: retornar os detalhes do pedido também
    };
  }

  @Get()
  async findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.newStatus);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.orderService.remove(id);
    return { message: 'Pedido removido com sucesso.' };
  }
}
