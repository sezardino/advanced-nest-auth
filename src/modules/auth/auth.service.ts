import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as uuid from 'uuid';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UserDocument } from 'src/models';
import {
  getHashedPassword,
  isPasswordValid,
  messages,
  Models,
  TokenPayload,
  Tokens,
} from 'src/common';

import { RegistrationDto } from './dto';
import { LoginDto } from './dto/login';
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

    const tokens = await this.saveTokens(newUser._id, { email });

    return { ...tokens, email, name, id: newUser._id };
  }

  async login(dto: LoginDto): Promise<string> {
    const { email, password } = dto;
    const neededUser = await this.getUser(email);

    if (!neededUser) {
      throw new BadRequestException(messages.USER_NOT_FOUND);
    }

    const passwordMatch = isPasswordValid(password, neededUser.password);

    if (!passwordMatch) {
      throw new BadRequestException(messages.PASSWORD_MISMATCH);
    }

    const tokens = await this.saveTokens(neededUser._id, { email });

    return tokens.accessToken;
  }

  async logout(token: string): Promise<void> {
    this.tokenService.deleteToken(token);
  }

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

  async refresh(refreshToken?: string): Promise<Tokens> {
    if (!refreshToken) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    const tokenData = await this.tokenService.findToken(refreshToken);
    const userData = this.tokenService.validateToken(refreshToken, true);

    if (!tokenData || !userData) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    const user = await this.userModel.findById(userData.userId);
    const newTokens = await this.saveTokens(user._id, { email: user.email });

    return newTokens;
  }

  async getUsers(): Promise<void> {}

  async saveTokens(
    userId: string,
    payload: Pick<TokenPayload, 'email'>,
  ): Promise<Tokens> {
    const tokens = this.tokenService.generateToken(payload);

    await this.tokenService.saveToken(userId, tokens.refreshToken);

    return tokens;
  }
}
