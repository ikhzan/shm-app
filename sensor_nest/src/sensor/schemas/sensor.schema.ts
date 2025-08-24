import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SensorDocument = Sensor & Document;

@Schema()
export class Sensor {
    @Prop({ required: true })
    sensorName: string;

    @Prop({ required: true })
    brand: string;

    @Prop({ required: true })
    data: string;

    @Prop({ default: Date.now }) // ✅ Automatically set creation timestamp
    createdAt: Date;

}

export const SensorSchema = SchemaFactory.createForClass(Sensor);