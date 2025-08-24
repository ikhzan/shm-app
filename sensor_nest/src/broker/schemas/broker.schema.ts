import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrokerDocument = Broker & Document;

@Schema()
export class Broker {
    @Prop({ required: true })
    brokerName: string;

    @Prop({ required: true })
    brand: string;

    @Prop({ required: true })
    urlPath: string;

    @Prop({ default: Date.now }) 
    createdAt: Date;
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);