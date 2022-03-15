import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema()
export class UserModel {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  isActivated: boolean;

  @Prop({ unique: true })
  activationLink: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
