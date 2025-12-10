import {
  CalendarBlankRegular,
  CalendarBlankFill,

  ListBulletsRegular,
  ListBulletsFill,

  UsersFill,
  UsersRegular,

  GearSixRegular,
  GearSixFill,

  TicketRegular,
  TicketFill,

  CertificateRegular,
  CertificateFill

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
    id: 'season-tickets',
    title: 'Абонементы',
    iconDefault: TicketRegular,
    iconActive: TicketFill,
    path: '/season-tickets'
  },
  {
    id: 'certificates',
    title: 'Сертификаты',
    iconDefault: CertificateRegular,
    iconActive: CertificateFill,
    path: '/certificates'
  },
  {
    id: 'settings',
    title: 'Настройки',
    iconDefault: GearSixRegular,
    iconActive: GearSixFill,
    path: '/settings'
  }
];
