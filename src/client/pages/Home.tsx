import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { AspectRatio, Button, ClickableTile, Column, Grid } from '@carbon/react';
import { DocumentAdd, Locked, UserMultiple } from '@carbon/icons-react';
import type { RootState } from '@/client/redux/store';
import { ROUTES } from '@/client/utilities/constants';
import { PageMeta } from '@/client/ui/components/page-meta';

const FEATURE_KEYS = ['posts', 'privacy', 'community'] as const;
const FEATURE_ICONS = {
  posts: DocumentAdd,
  privacy: Locked,
  community: UserMultiple,
} as const;
const EXPLORE_LINKS = [
  { to: ROUTES.ABOUT, labelId: 'publicNav.about' },
  { to: ROUTES.NEWS_EVENTS, labelId: 'publicNav.newsEvents' },
  { to: ROUTES.FAQ, labelId: 'publicNav.faq' },
];

const Home = () => {
  const intl = useIntl();
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'home.pageTitle' })}
        description={intl.formatMessage({ id: 'home.pageDescription' })}
      />

      <Grid className="public-hero" fullWidth>
        <Column className="public-hero__text" lg={8} md={8} sm={4}>
          <h1>
            <FormattedMessage id="home.hero.title" />
          </h1>
          <p className="public-hero__tagline">
            <FormattedMessage id="home.hero.subtitle" />
          </p>
          <div className="public-hero__actions">
            {token ? (
              <Button as={RouterLink} to={ROUTES.FEED} kind="primary">
                <FormattedMessage id="publicNav.goToFeed" />
              </Button>
            ) : (
              <>
                <Button as={RouterLink} to={ROUTES.REGISTER} kind="primary">
                  <FormattedMessage id="home.hero.getStarted" />
                </Button>
                <Button as={RouterLink} to={ROUTES.LOGIN} kind="tertiary">
                  <FormattedMessage id="publicNav.login" />
                </Button>
              </>
            )}
          </div>
        </Column>
        <Column lg={8} md={8} sm={4}>
          <AspectRatio ratio="4x3" className="public-hero__media">
            <img src="/brand/home-hero.svg" alt={intl.formatMessage({ id: 'home.hero.imageAlt' })} />
          </AspectRatio>
        </Column>
      </Grid>

      <Grid className="public-section" fullWidth>
        <Column lg={16} md={8} sm={4}>
          <h2 className="public-section__heading">
            <FormattedMessage id="home.features.title" />
          </h2>
          <div className="public-tiles">
            {FEATURE_KEYS.map(key => {
              const Icon = FEATURE_ICONS[key];
              return (
                <ClickableTile key={key} href={ROUTES.ABOUT}>
                  <Icon size={32} className="public-tile__icon" />
                  <h3>
                    <FormattedMessage id={`home.features.${key}.title`} />
                  </h3>
                  <p>
                    <FormattedMessage id={`home.features.${key}.description`} />
                  </p>
                </ClickableTile>
              );
            })}
          </div>
        </Column>
      </Grid>

      <Grid className="public-section public-section--muted" fullWidth>
        <Column lg={16} md={8} sm={4}>
          <h2 className="public-section__heading">
            <FormattedMessage id="home.explore.title" />
          </h2>
          <p>
            <FormattedMessage id="home.explore.subtitle" />
          </p>
          <div className="public-hero__actions">
            {EXPLORE_LINKS.map(link => (
              <Button key={link.to} as={RouterLink} to={link.to} kind="tertiary">
                <FormattedMessage id={link.labelId} />
              </Button>
            ))}
          </div>
        </Column>
      </Grid>
    </>
  );
};

export default Home;
