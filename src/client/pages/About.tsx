import { useIntl, FormattedMessage } from 'react-intl';
import { Column, Grid, Tile } from '@carbon/react';
import { PageMeta } from '@/client/ui/components/page-meta';

const CAPABILITY_KEYS = [
  'richText',
  'media',
  'privacy',
  'social',
  'activity',
  'search',
  'personalization',
] as const;

const About = () => {
  const intl = useIntl();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'about.pageTitle' })}
        description={intl.formatMessage({ id: 'about.pageDescription' })}
      />

      <Grid className="public-hero" fullWidth>
        <Column lg={{ span: 8, offset: 4 }} md={8} sm={4}>
          <h1>
            <FormattedMessage id="about.title" />
          </h1>
          <p className="public-hero__tagline">
            <FormattedMessage id="about.intro1" />
          </p>
          <p className="public-hero__tagline">
            <FormattedMessage id="about.intro2" />
          </p>
        </Column>
      </Grid>

      <Grid className="public-section public-section--muted" fullWidth>
        <Column lg={16} md={8} sm={4}>
          <h2 className="public-section__heading">
            <FormattedMessage id="about.capabilities.title" />
          </h2>
          <div className="public-tiles">
            {CAPABILITY_KEYS.map(key => (
              <Tile key={key}>
                <h3>
                  <FormattedMessage id={`about.capabilities.${key}.title`} />
                </h3>
                <p>
                  <FormattedMessage id={`about.capabilities.${key}.description`} />
                </p>
              </Tile>
            ))}
          </div>
        </Column>
      </Grid>
    </>
  );
};

export default About;
