import { Controller } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { UserService } from '../services/user.service';

@ApiHeader({ name: 'deviceId', required: true, description: 'Device Id' })
@ApiTags('Users')
@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
  ) {
    this.seedData();
  }

  async seedData() {
    return this.roleService.insertSeed();
  }
}
