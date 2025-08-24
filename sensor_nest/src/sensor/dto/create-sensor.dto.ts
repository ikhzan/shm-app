import { IsNotEmpty, IsString } from "class-validator";

export class CreateSensorDto {
    @IsString()
    @IsNotEmpty()
    sensorName: string;

    @IsString()
    @IsNotEmpty()
    data: string;
}
