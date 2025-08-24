import { IsArray, IsMongoId } from "class-validator";

export class UpdateUserDto {
    @IsArray()
    @IsMongoId({ each: true })
    roles: string[];
}
