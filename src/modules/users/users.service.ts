import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { Roles, User } from '../../generated/prisma/client';
import { PartialBusinessDto } from './dto/partial-business.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        buyerProfile: true,
        adminProfile: true,
        vendorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users
   */
  async findAll() {
    const users = await this.prisma.user.findMany({});

    // Exclude passwords from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...user }) => user);
  }

  /**
   * Create a new user
   */
  async create(data: User) {
    return this.prisma.user.create({ data });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    this.logger.log(`User ${id} updated`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    this.logger.log(`User ${id} deleted`);

    return {
      status: 'success',
      message: 'Account deleted successfully',
    };
  }

  //update user to a vendor
  async upgradeToVendor(id: string, partialBuiness: PartialBusinessDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'something went wrong ----user dosent exist OR',
      );
    }

    const isVendor = user.role.some((r) => r.role === Roles.VENDOR);

    if (isVendor) {
      throw new BadRequestException('User is already a vendor');
    }

    return await this.prisma.$transaction(async (tx) => {
      try {
        const vendorProfile = await tx.vendorProfile.create({
          data: {
            userId: id,
          },
        });

        await tx.store.create({
          data: {
            description: partialBuiness.description,
            storeName: partialBuiness.storeName,
            businessType: partialBuiness.businessType,
            vendorProfileId: vendorProfile.id,
          },
        });

        await tx.user.update({
          where: {
            id,
          },
          data: {
            role: {
              connect: { role: 'VENDOR' },
            },
          },
        });

        return vendorProfile;
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'Error while transitioning vendor',
        );
      }
    });
  }
}
