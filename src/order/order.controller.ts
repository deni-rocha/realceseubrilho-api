import { Controller, Post, Get, Param, Body, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order-satus.dto';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';



@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrderFromCart(@Body() createOrderFromCartDto: CreateOrderFromCartDto) {
    return this.orderService.createOrderFromCart(createOrderFromCartDto);
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
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.newStatus);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.orderService.remove(id);
    return { message: 'Pedido removido com sucesso.' };
  }
}
