import { useSelector } from 'react-redux';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  SkipToContent,
  Theme,
  Content,
  Grid,
  Column,
} from '@carbon/react';
import { Asleep, Awake } from '@carbon/icons-react';
import type { RootState } from '@/client/redux/store';
import { ROUTES } from '@/client/utilities/constants';
import { LanguageSwitcher } from '@/client/ui/components/language-switcher';
import '@/client/ui/styles/carbon.scss';

interface NavItem {
  to: string;
  labelId: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.HOME, labelId: 'publicNav.home' },
  { to: ROUTES.ABOUT, labelId: 'publicNav.about' },
  { to: ROUTES.NEWS_EVENTS, labelId: 'publicNav.newsEvents' },
  { to: ROUTES.FAQ, labelId: 'publicNav.faq' },
];

const CURRENT_YEAR = new Date().getFullYear();

export const PublicLayout = () => {
  const intl = useIntl();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const token = useSelector((state: RootState) => state.auth.token);

  const authNavItem: NavItem = token
    ? { to: ROUTES.FEED, labelId: 'publicNav.goToFeed' }
    : { to: ROUTES.LOGIN, labelId: 'publicNav.login' };

  const appName = intl.formatMessage({ id: 'app.name' });

  return (
    <Theme theme={isDark ? 'g100' : 'white'}>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <Header aria-label={appName}>
            <SkipToContent />
            <HeaderMenuButton
              aria-label={intl.formatMessage({ id: isSideNavExpanded ? 'publicNav.closeMenu' : 'publicNav.openMenu' })}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
            />
            <HeaderName as={RouterLink} to={ROUTES.HOME} prefix="">
              {appName}
            </HeaderName>
            <HeaderNavigation aria-label={appName}>
              {NAV_ITEMS.map(item => (
                <HeaderMenuItem key={item.to} as={RouterLink} to={item.to} isActive={location.pathname === item.to}>
                  <FormattedMessage id={item.labelId} />
                </HeaderMenuItem>
              ))}
              <HeaderMenuItem as={RouterLink} to={authNavItem.to} isActive={location.pathname === authNavItem.to}>
                <FormattedMessage id={authNavItem.labelId} />
              </HeaderMenuItem>
            </HeaderNavigation>
            <HeaderGlobalBar>
              <HeaderGlobalAction
                aria-label={intl.formatMessage({ id: isDark ? 'publicNav.lightMode' : 'publicNav.darkMode' })}
                onClick={() => { setTheme(isDark ? 'light' : 'dark'); }}
              >
                {isDark ? <Awake size={20} /> : <Asleep size={20} />}
              </HeaderGlobalAction>
            </HeaderGlobalBar>
            <SideNav aria-label={appName} expanded={isSideNavExpanded} isPersistent={false}>
              <SideNavItems>
                <HeaderSideNavItems>
                  {NAV_ITEMS.map(item => (
                    <HeaderMenuItem key={item.to} as={RouterLink} to={item.to} isActive={location.pathname === item.to}>
                      <FormattedMessage id={item.labelId} />
                    </HeaderMenuItem>
                  ))}
                  <HeaderMenuItem as={RouterLink} to={authNavItem.to} isActive={location.pathname === authNavItem.to}>
                    <FormattedMessage id={authNavItem.labelId} />
                  </HeaderMenuItem>
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          </Header>
        )}
      />
      <Content className="public-content">
        <Outlet />
      </Content>
      <PublicFooter />
    </Theme>
  );
};

const PublicFooter = () => (
  <footer className="public-footer">
    <Grid fullWidth>
      <Column sm={4} md={4} lg={4}>
        <p>
          <FormattedMessage id="app.name" />
        </p>
        <p className="public-footer__meta">
          <FormattedMessage id="footer.copyright" values={{ year: CURRENT_YEAR }} />
        </p>
        <p className="public-footer__meta">
          <FormattedMessage id="footer.cookiesEssential" />
        </p>
      </Column>
      <Column sm={4} md={4} lg={8}>
        <nav className="public-footer__links" aria-label="Footer">
          <RouterLink to={ROUTES.ABOUT}><FormattedMessage id="publicNav.about" /></RouterLink>
          <RouterLink to={ROUTES.NEWS_EVENTS}><FormattedMessage id="publicNav.newsEvents" /></RouterLink>
          <RouterLink to={ROUTES.FAQ}><FormattedMessage id="publicNav.faq" /></RouterLink>
        </nav>
      </Column>
      <Column sm={4} md={8} lg={4}>
        <LanguageSwitcher />
      </Column>
    </Grid>
  </footer>
);
