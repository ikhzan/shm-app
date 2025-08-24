import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrokerDto {
    @IsString()
    @IsNotEmpty()
    brokerName: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsNotEmpty()
    urlPath: string;
}
