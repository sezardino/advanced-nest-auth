import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as uuid from 'uuid';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UserDocument } from 'src/models';
import {
  getHashedPassword,
  isPasswordValid,
  messages,
  Models,
} from 'src/common';

import { RegistrationDto } from './dto';
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Models.USER) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private mailService: MailService,
    private tokenService: TokenService,
  ) {}

  async getUser(email: string): Promise<UserDocument | null> {
    const neededUser = await this.userModel.findOne({ email });

    if (!neededUser) {
      return null;
    }

    return neededUser;
  }

  async registration(dto: RegistrationDto) {
    const { email, name, password } = dto;
    const userExist = await this.getUser(email);

    if (userExist) {
      throw new NotFoundException(messages.USER_EXIST);
    }

    const salt = this.configService.get('SALT') as string;
    const hashedPassword = getHashedPassword(password, +salt);
    const activationLink = uuid.v4();
    const newUser = new this.userModel({
      email,
      name,
      password: hashedPassword,
      activationLink,
    });

    newUser.save();
    this.mailService.sendActivationMail(
      email,
      `${this.configService.get('API_URL')}/auth/activate/${activationLink}`,
    );

    const tokens = this.tokenService.generateToken({ email });

    this.tokenService.saveToken(newUser._id, tokens.refreshToken);

    return { ...tokens, email, name, id: newUser._id };
  }

  constructor() {}

  async getUser() {}

  async activation(link: string): Promise<void> {
    const neededUser = await this.userModel.findOne({ activationLink: link });

    if (!neededUser) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }

    if (neededUser.isActivated) {
      throw new NotFoundException(messages.ALREADY_ACTIVATED);
    }

    neededUser.isActivated = true;
    await neededUser.save();
  }

  refresh() {}

  getUsers() {}
}
