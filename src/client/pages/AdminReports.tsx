import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LuFlag } from 'react-icons/lu';
import { PageMeta } from '@/client/ui/components/page-meta';

const AdminReports = () => {
  const intl = useIntl();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'admin.reports.pageTitle' })}
        description={intl.formatMessage({ id: 'admin.reports.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <Heading size="xl" color="brand.800">
          <FormattedMessage id="admin.reports.heading" />
        </Heading>

        <Center py={20}>
          <VStack gap={3} color="fg.subtle">
            <LuFlag size={40} />
            <Text fontSize="lg" fontWeight="500">
              <FormattedMessage id="admin.reports.comingSoon" />
            </Text>
          </VStack>
        </Center>
      </VStack>
    </>
  );
};

export default AdminReports;
