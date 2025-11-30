import {
  CalendarBlankRegular,
  CalendarBlankFill,

  ListChecksRegular,
  ListChecksFill,

  ListBulletsRegular,
  ListBulletsFill,

  UsersFill,
  UserRegular,

  GearSixRegular,
  GearSixFill,

} from '@/shared/ds/icons';

export const navItems = [
  {
    id: 'calendar',
    title: 'Календарь',
    iconDefault: CalendarBlankRegular,
    iconActive: CalendarBlankFill,
    path: '/'
  },
  {
    id: 'sessions',
    title: 'Сеансы',
    iconDefault: ListChecksRegular,
    iconActive: ListChecksFill,
    path: '/sessions'
  },
  {
    id: 'users',
    title: 'Пользователи',
    iconDefault: UserRegular,
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
