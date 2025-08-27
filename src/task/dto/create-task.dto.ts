import { Type } from "class-transformer";
import { IsDate, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsDate()
    @Type(() => Date)
    deadline: Date;

    @IsIn(['pending','completed'])
    status: string;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsDate()
    @Type(()=> Date)
    reminder?: Date

}
