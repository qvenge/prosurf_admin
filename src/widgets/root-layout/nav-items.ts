import {
  CalendarBlankRegular,
  CalendarBlankFill,

  ListBulletsRegular,
  ListBulletsFill,

  UsersFill,
  UsersRegular,

  GearSixRegular,
  GearSixFill,

} from '@/shared/ds/icons';

export const navItems = [
  {
    id: 'sessions',
    title: 'Сеансы',
    iconDefault: CalendarBlankRegular,
    iconActive: CalendarBlankFill,
    path: '/'
  },
  {
    id: 'users',
    title: 'Пользователи',
    iconDefault: UsersRegular,
    iconActive: UsersFill,
    path: '/users'
  },
  {
    id: 'templates',
    title: 'Шаблоны',
    iconDefault: ListBulletsRegular,
    iconActive: ListBulletsFill,
    path: '/templates'
  },
  {
    id: 'settings',
    title: 'Настройки',
    iconDefault: GearSixRegular,
    iconActive: GearSixFill,
    path: '/settings'
  }
];
