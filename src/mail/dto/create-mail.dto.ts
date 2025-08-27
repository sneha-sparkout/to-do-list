import { IsDate, IsMongoId } from "class-validator";

export class CreateMailDto {

    @IsMongoId()
    task: string

    @IsDate()
    reminderTime: Date
}
