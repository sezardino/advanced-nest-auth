import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema, UserSchema } from 'src/models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig, Models } from 'src/common';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Models.USER, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Models.TOKEN, schema: TokenSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
  providers: [AuthService, MailService, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
