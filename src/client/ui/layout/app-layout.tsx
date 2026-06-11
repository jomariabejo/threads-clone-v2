import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Box, HStack, Heading, IconButton, Text, VStack } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { LuChevronsLeft, LuChevronsRight, LuHeart, LuHouse, LuLogOut, LuMenu, LuSearch, LuSquarePen, LuUser, LuX } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { ROUTES } from '@/client/utilities/constants';
import { logout } from '@/client/redux/auth';
import { type AppDispatch, type RootState } from '@/client/redux/store';
import { useNotificationSocket } from '@/client/hooks/use-notification-socket';
import { Link } from '../components/link';
import { ColorModeToggle } from '../components/color-mode-toggle';
import { LanguageSwitcher } from '../components/language-switcher';

interface NavItem {
  icon: IconType;
  labelId: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LuHouse, labelId: 'nav.feed', to: ROUTES.FEED },
  { icon: LuSearch, labelId: 'nav.search', to: ROUTES.SEARCH },
  { icon: LuSquarePen, labelId: 'nav.create', to: ROUTES.CREATE },
  { icon: LuHeart, labelId: 'nav.activity', to: ROUTES.ACTIVITY },
  { icon: LuUser, labelId: 'nav.profile', to: ROUTES.PROFILE },
];

const SIDEBAR_WIDTH = '280px';
const SIDEBAR_COLLAPSED_WIDTH = '88px';
const MOBILE_HEADER_HEIGHT = '56px';
const MOBILE_NAV_HEIGHT = '64px';

const isNavItemActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);

export const AppLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  useNotificationSocket();

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  const handleLogout = useCallback(() => {
    dispatch(logout());
    void navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const borderColor = isDark ? 'gray.700' : 'gray.200';
  const bg = isDark ? 'gray.900' : 'white';

  return (
    <Box minH="100vh" bg={bg}>
      {/* Desktop sidebar */}
      <VStack
        as="nav"
        aria-label="Primary"
        align="stretch"
        gap={1}
        w={collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}
        p={4}
        borderRight="1px solid"
        borderColor={borderColor}
        display={{ base: 'none', md: 'flex' }}
        position="fixed"
        h="100vh"
        transition="width 0.2s"
        overflow="hidden"
      >
        {collapsed ? (
          <IconButton
            aria-label="Expand sidebar"
            variant="ghost"
            size="sm"
            alignSelf="center"
            mb={6}
            onClick={() => { setCollapsed(false); }}
          >
            <LuChevronsLeft size={20} />
          </IconButton>
        ) : (
          <HStack justify="space-between" align="center" mb={6} px={3}>
            <Heading asChild size="lg" color="brand.800">
              <Link to={ROUTES.FEED}>
                <FormattedMessage id="app.name" />
              </Link>
            </Heading>
            <IconButton
              aria-label="Collapse sidebar"
              variant="ghost"
              size="sm"
              onClick={() => { setCollapsed(true); }}
            >
              <LuChevronsRight size={20} />
            </IconButton>
          </HStack>
        )}

        {NAV_ITEMS.map(item => (
          <SidebarNavLink
            key={item.to}
            item={item}
            active={isNavItemActive(location.pathname, item.to)}
            collapsed={collapsed}
            count={item.to === ROUTES.ACTIVITY ? unreadCount : 0}
          />
        ))}

        <Box flex="1" />

        <HStack px={3} justify={collapsed ? 'center' : 'space-between'}>
          {!collapsed && <LanguageSwitcher />}
          <ColorModeToggle />
        </HStack>

        <HStack
          as="button"
          onClick={handleLogout}
          p={3}
          borderRadius="lg"
          color="gray.600"
          _hover={{ bg: isDark ? 'gray.800' : 'gray.50', color: 'brand.800' }}
          gap={3}
          justify={collapsed ? 'center' : 'flex-start'}
          textAlign="start"
          title="Logout"
        >
          <LuLogOut size={20} />
          {!collapsed && (
            <Text fontWeight="500">
              <FormattedMessage id="nav.logout" />
            </Text>
          )}
        </HStack>

        {collapsed && (
          <Box pt={2} alignSelf="center">
            <img src="/brand/not-expanded.png" alt="Connectly" width={32} height={32} />
          </Box>
        )}
      </VStack>

      {/* Mobile top bar */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top={0}
        insetX={0}
        h={MOBILE_HEADER_HEIGHT}
        bg={bg}
        borderBottom="1px solid"
        borderColor={borderColor}
        zIndex="overlay"
        align="center"
        justify="space-between"
        px={4}
      >
        <Heading asChild size="md" color="brand.800">
          <Link to={ROUTES.FEED}>
            <FormattedMessage id="app.name" />
          </Link>
        </Heading>
        <IconButton
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          variant="ghost"
          size="lg"
          minH="44px"
          minW="44px"
          onClick={() => { setMobileOpen(open => !open); }}
        >
          {mobileOpen ? <LuX /> : <LuMenu />}
        </IconButton>
      </HStack>

      {mobileOpen && (
        <VStack
          display={{ base: 'flex', md: 'none' }}
          position="fixed"
          top={MOBILE_HEADER_HEIGHT}
          insetX={0}
          bg={bg}
          borderBottom="1px solid"
          borderColor={borderColor}
          zIndex="overlay"
          align="stretch"
          gap={1}
          p={4}
        >
          <HStack justify="space-between" px={3} pb={2}>
            <LanguageSwitcher />
            <ColorModeToggle />
          </HStack>
          <HStack
            as="button"
            onClick={handleLogout}
            p={3}
            borderRadius="lg"
            color="gray.600"
            gap={3}
            textAlign="start"
          >
            <LuLogOut size={20} />
            <Text fontWeight="500">
              <FormattedMessage id="nav.logout" />
            </Text>
          </HStack>
        </VStack>
      )}

      {/* Main content */}
      <Box
        ml={{ base: 0, md: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        pt={{ base: MOBILE_HEADER_HEIGHT, md: 0 }}
        pb={{ base: MOBILE_NAV_HEIGHT, md: 0 }}
        transition="margin-left 0.2s"
      >
        <Box maxW="620px" mx="auto" px={4} py={8}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        bottom={0}
        insetX={0}
        h={MOBILE_NAV_HEIGHT}
        bg={bg}
        borderTop="1px solid"
        borderColor={borderColor}
        justify="space-around"
        zIndex="overlay"
      >
        {NAV_ITEMS.map(item => (
          <BottomNavLink
            key={item.to}
            item={item}
            active={isNavItemActive(location.pathname, item.to)}
            count={item.to === ROUTES.ACTIVITY ? unreadCount : 0}
          />
        ))}
      </HStack>
    </Box>
  );
};

const SidebarNavLink = ({ item, active, collapsed, count }: { item: NavItem; active: boolean; collapsed: boolean; count: number }) => {
  const { theme } = useTheme();
  const intl = useIntl();
  const isDark = theme === 'dark';
  const Icon = item.icon;
  const activeBg = isDark ? 'gray.800' : 'gray.100';
  const label = intl.formatMessage({ id: item.labelId });

  return (
    <HStack
      asChild
      p={3}
      borderRadius="lg"
      bg={active ? activeBg : 'transparent'}
      color={active ? 'brand.800' : 'gray.600'}
      _hover={{ bg: isDark ? 'gray.800' : 'gray.50', color: 'brand.800' }}
      gap={3}
      justify={collapsed ? 'center' : 'flex-start'}
    >
      <Link to={item.to} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}>
        <Box position="relative">
          <Icon size={22} />
          <NotificationBadge count={count} />
        </Box>
        {!collapsed && (
          <Text fontWeight={active ? '600' : '500'}>
            {label}
          </Text>
        )}
      </Link>
    </HStack>
  );
};

const BottomNavLink = ({ item, active, count }: { item: NavItem; active: boolean; count: number }) => {
  const Icon = item.icon;

  return (
    <VStack asChild gap={1} flex="1" py={2} color={active ? 'brand.800' : 'gray.500'}>
      <Link to={item.to}>
        <Box position="relative">
          <Icon size={22} />
          <NotificationBadge count={count} />
        </Box>
        <Text fontSize="2xs" fontWeight={active ? '600' : '400'}>
          <FormattedMessage id={item.labelId} />
        </Text>
      </Link>
    </VStack>
  );
};

const NotificationBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;

  return (
    <Box
      position="absolute"
      top="-6px"
      right="-8px"
      minW="16px"
      h="16px"
      px="3px"
      borderRadius="full"
      bg="red.500"
      color="white"
      fontSize="9px"
      fontWeight="700"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {count > 99 ? '99+' : count}
    </Box>
  );
};
