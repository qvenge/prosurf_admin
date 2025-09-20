import {
  CalendarBlankRegular,
  CalendarBlankFill,

  ListChecksRegular,
  ListChecksFill,

  UsersFill,
  UserRegular,

  BarbellRegular,
  BarbellFill,

  TicketRegular,
  TicketFill,

  CertificateRegular,
  CertificateFill,

  ConfettiRegular,
  ConfettiFill,

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
    title: 'Записи',
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
    id: 'trainings',
    title: 'Тренировки',
    iconDefault: BarbellRegular,
    iconActive: BarbellFill,
    path: '/trainings'
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
    id: 'events',
    title: 'События',
    iconDefault: ConfettiRegular,
    iconActive: ConfettiFill,
    path: '/events'
  },
  {
    id: 'settings',
    title: 'Настройки',
    iconDefault: GearSixRegular,
    iconActive: GearSixFill,
    path: '/settings'
  }
];
