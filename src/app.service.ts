import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): object {
    return {
      name: 'Realce Seu Brilho API',
      version: '1.0.0',
      status: 'online',
    };
  }
}
