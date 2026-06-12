import { useIntl, FormattedMessage } from 'react-intl';
import { Column, Grid, Tile } from '@carbon/react';
import { PageMeta } from '@/client/ui/components/page-meta';

const ITEM_KEYS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const;

const NewsEvents = () => {
  const intl = useIntl();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'newsEvents.pageTitle' })}
        description={intl.formatMessage({ id: 'newsEvents.pageDescription' })}
      />

      <Grid className="public-hero" fullWidth>
        <Column lg={{ span: 8, offset: 4 }} md={8} sm={4}>
          <h1>
            <FormattedMessage id="newsEvents.title" />
          </h1>
          <p className="public-hero__tagline">
            <FormattedMessage id="newsEvents.subtitle" />
          </p>
        </Column>
      </Grid>

      <Grid className="public-section" fullWidth>
        <Column lg={{ span: 10, offset: 3 }} md={8} sm={4}>
          <div className="public-stack">
            {ITEM_KEYS.map(key => (
              <Tile key={key}>
                <p className="public-news-item__date">
                  <FormattedMessage id={`newsEvents.${key}.date`} />
                </p>
                <h3>
                  <FormattedMessage id={`newsEvents.${key}.title`} />
                </h3>
                <p>
                  <FormattedMessage id={`newsEvents.${key}.body`} />
                </p>
              </Tile>
            ))}
          </div>
        </Column>
      </Grid>
    </>
  );
};

export default NewsEvents;
