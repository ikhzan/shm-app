import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor } from './schemas/sensor.schema';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  async create(@Body() createSensorDto: CreateSensorDto) : Promise<Sensor> {
    return this.sensorService.create(createSensorDto);
  }

  @Get()
  async findAll(): Promise<Sensor[]> {
    return this.sensorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sensor> {
    return this.sensorService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    return this.sensorService.update(+id, updateSensorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sensorService.remove(+id);
  }
}
