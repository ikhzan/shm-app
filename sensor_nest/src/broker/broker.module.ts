import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Broker, BrokerSchema } from './schemas/broker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Broker.name, schema: BrokerSchema }]),
  ],
  controllers: [BrokerController],
  providers: [BrokerService],
  exports: [BrokerService]
})
export class BrokerModule { }
