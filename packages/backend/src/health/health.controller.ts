import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get()
  async check() {
    const isMongoConnected = this.mongoConnection.readyState === 1;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongo: isMongoConnected ? 'connected' : 'disconnected',
    };
  }
} 