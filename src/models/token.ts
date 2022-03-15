import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';

export type TokenDocument = TokenModel & Document;

@Schema()
export class TokenModel {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);
