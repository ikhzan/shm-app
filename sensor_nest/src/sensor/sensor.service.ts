import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor, SensorDocument } from './schemas/sensor.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SensorService {
  constructor(@InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,) {

  }

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const sensor = new this.sensorModel(createSensorDto);
    try {
      await sensor.save();
    } catch (error) {
      throw error;
    }
    return sensor;
  }

  async findAll(): Promise<Sensor[]> {
    return this.sensorModel.find().exec();
  }

  async findOne(id: string): Promise<Sensor> {
    const sensor = await this.sensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return sensor;
  }

  async update(id: number, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.sensorModel.findByIdAndUpdate(id, updateSensorDto, { new: true }).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return sensor;
  }

  async remove(id: number): Promise<void> {
    const result = await this.sensorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
  }
}
