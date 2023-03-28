import { RoleMetaKye, UserRoleTitle, UserRoleType } from 'src/enums/roles.enum';

export const UserTypesSeedData = [
  {
    title: UserRoleTitle.SuperAdmin,
    slug: UserRoleType.SuperAdmin,
    metaKey: RoleMetaKye.SUPER_ADMIN,
    isActive: true,
  },
  {
    title: UserRoleTitle.User,
    slug: UserRoleType.User,
    metaKey: RoleMetaKye.USER,
    isActive: true,
  },
];

export const SuperAdminSeed = {
  //   name: ENV.SUPER_ADMIN_NAME,
  //   phoneNumber: ENV.SUPER_ADMIN_PHONE_NUMBER,
  //   password: ENV.SUPER_ADMIN_PASSWORD,
  userType: UserRoleType.SuperAdmin,
};
