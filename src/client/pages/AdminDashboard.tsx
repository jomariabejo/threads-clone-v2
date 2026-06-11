import { Center, Heading, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAdminStats } from '@/client/hooks/api/use-admin-stats';
import { PageMeta } from '@/client/ui/components/page-meta';
import { formatNumber } from '@/client/utilities/formatting';

const AdminDashboard = () => {
  const intl = useIntl();
  const { data, isLoading } = useAdminStats();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'admin.dashboard.pageTitle' })}
        description={intl.formatMessage({ id: 'admin.dashboard.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <Heading size="xl" color="brand.800">
          <FormattedMessage id="admin.dashboard.heading" />
        </Heading>

        {isLoading ? (
          <Center py={20}>
            <Spinner size="xl" color="brand.800" />
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
            <StatCard labelId="admin.dashboard.totalUsers" value={data?.totalUsers ?? 0} locale={intl.locale} />
            <StatCard labelId="admin.dashboard.totalAdmins" value={data?.totalAdmins ?? 0} locale={intl.locale} />
            <StatCard labelId="admin.dashboard.suspendedUsers" value={data?.suspendedUsers ?? 0} locale={intl.locale} />
            <StatCard labelId="admin.dashboard.totalPosts" value={data?.totalPosts ?? 0} locale={intl.locale} />
          </SimpleGrid>
        )}
      </VStack>
    </>
  );
};

const StatCard = ({ labelId, value, locale }: { labelId: string; value: number; locale: string }) => (
  <VStack
    align="stretch"
    gap={2}
    p={5}
    bg="bg.panel"
    border="1px solid"
    borderColor="border"
    borderRadius="xl"
    boxShadow="card"
  >
    <Text color="fg.subtle" fontSize="sm" fontWeight="500">
      <FormattedMessage id={labelId} />
    </Text>
    <Heading size="2xl" color="brand.800">
      {formatNumber(value, locale)}
    </Heading>
  </VStack>
);

export default AdminDashboard;
