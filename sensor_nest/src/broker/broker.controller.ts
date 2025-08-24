import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';
import { Broker } from './schemas/broker.schema';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) { }

  @Post()
  async create(@Body() createBrokerDto: CreateBrokerDto): Promise<Broker> {
    return this.brokerService.create(createBrokerDto);
  }

  @Get()
  async findAll(): Promise<Broker[]> {
    return this.brokerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Broker> {
    return this.brokerService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrokerDto: UpdateBrokerDto): Promise<Broker> {
    return this.brokerService.update(+id, updateBrokerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.brokerService.remove(+id);
  }
}
