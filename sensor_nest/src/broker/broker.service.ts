import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Broker, BrokerDocument } from './schemas/broker.schema';
import { Model } from 'mongoose';

@Injectable()
export class BrokerService {
  constructor(@InjectModel(Broker.name) private brokerModel: Model<BrokerDocument>,) {

  }

  async create(createBrokerDto: CreateBrokerDto): Promise<Broker> {
      const broker = new this.brokerModel(createBrokerDto);
      try {
        await broker.save();
      } catch (error) {
        throw error;
      }
      return broker;
    }
  
    async findAll(): Promise<Broker[]> {
      return this.brokerModel.find().exec();
    }
  
    async findOne(id: string): Promise<Broker> {
      const broker = await this.brokerModel.findById(id).exec();
      if (!broker) {
        throw new NotFoundException(`broker with ID ${id} not found`);
      }
      return broker;
    }
  
    async update(id: number, updateBrokerDto: UpdateBrokerDto): Promise<Broker> {
      const broker = await this.brokerModel.findByIdAndUpdate(id, updateBrokerDto, { new: true }).exec();
      if (!broker) {
        throw new NotFoundException(`broker with ID ${id} not found`);
      }
      return broker;
    }
  
    async remove(id: number): Promise<void> {
      const result = await this.brokerModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`broker with ID ${id} not found`);
      }
    }
}
