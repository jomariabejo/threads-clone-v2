import { useIntl, FormattedMessage } from 'react-intl';
import { Accordion, AccordionItem, Column, Grid } from '@carbon/react';
import { PageMeta } from '@/client/ui/components/page-meta';

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const;

const Faq = () => {
  const intl = useIntl();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'faq.pageTitle' })}
        description={intl.formatMessage({ id: 'faq.pageDescription' })}
      />

      <Grid className="public-hero" fullWidth>
        <Column lg={{ span: 8, offset: 4 }} md={8} sm={4}>
          <h1>
            <FormattedMessage id="faq.title" />
          </h1>
          <p className="public-hero__tagline">
            <FormattedMessage id="faq.subtitle" />
          </p>
        </Column>
      </Grid>

      <Grid className="public-section" fullWidth>
        <Column lg={{ span: 10, offset: 3 }} md={8} sm={4}>
          <Accordion>
            {QUESTION_KEYS.map(key => (
              <AccordionItem key={key} title={intl.formatMessage({ id: `faq.${key}.question` })}>
                <p>
                  <FormattedMessage id={`faq.${key}.answer`} />
                </p>
              </AccordionItem>
            ))}
          </Accordion>
        </Column>
      </Grid>
    </>
  );
};

export default Faq;
