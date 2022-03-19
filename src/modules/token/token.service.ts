import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Models, TokenPayload } from 'src/common';
import { TokenDocument } from 'src/models';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Models.TOKEN) private tokenModel: Model<TokenDocument>,
  ) {}

  validateToken(token: string, isRefresh = false): TokenPayload {
    const secret = this.configService.get(
      isRefresh ? 'JWT_REFRESH_SECRET' : 'JWT_ACCESS_SECRET',
    );

    let userData: any;

    try {
      userData = this.jwtService.verify(token, { secret });
    } catch (error) {
      return null;
    }

    if (!userData) {
      return null;
    }

    return userData as TokenPayload;
  }

  generateToken(payload: Record<string, any>): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    return { accessToken, refreshToken };
  }

  async removeToken(token: string) {
    const tokenData = await this.tokenModel.findOneAndDelete({
      refreshToken: token,
    });

    return tokenData;
  }

  async findToken(token: string): Promise<TokenDocument> {
    const tokenData = await this.tokenModel.findOne({
      refreshToken: token,
    });

    return tokenData;
  }

  async saveToken(
    userId: string,
    refreshToken: string,
  ): Promise<TokenDocument> {
    const neededToken = await this.tokenModel.findOne({ userId });

    if (neededToken) {
      neededToken.refreshToken = refreshToken;

      return neededToken.save();
    }

    const newToken = await this.tokenModel.create({ userId, refreshToken });

    return await newToken.save();
  }

  async deleteToken(refreshToken: string): Promise<void> {
    return await this.tokenModel.findOneAndDelete({ refreshToken });
  }
}
