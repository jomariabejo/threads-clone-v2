import Button from '@atlaskit/button/new';
import { DatePicker } from '@atlaskit/datetime-picker';
import Select, { type OptionType } from '@atlaskit/select';
import { Box, HStack, Text } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { useIntl } from 'react-intl';

export const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box flex="1 1 160px" minW="160px">
    <Text fontSize="xs" fontWeight="600" color="fg.subtle" mb={1}>
      {label}
    </Text>
    {children}
  </Box>
);

interface DateFilterFieldProps {
  labelId: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}

export const DateFilterField = ({ labelId, value, onChange, minDate, maxDate }: DateFilterFieldProps) => {
  const intl = useIntl();
  const label = intl.formatMessage({ id: labelId });
  const placeholder = intl.formatMessage({ id: 'admin.shared.filters.anyDate' });

  return (
    <FilterField label={label}>
      <DatePicker
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        spacing="compact"
        label={label}
        placeholder={placeholder}
      />
    </FilterField>
  );
};

interface SelectFilterFieldProps<T extends OptionType> {
  labelId: string;
  inputId: string;
  options: T[];
  value: T | undefined;
  onChange: (option: T | null) => void;
}

export const SelectFilterField = <T extends OptionType>({ labelId, inputId, options, value, onChange }: SelectFilterFieldProps<T>) => {
  const intl = useIntl();
  const label = intl.formatMessage({ id: labelId });

  return (
    <FilterField label={label}>
      <Select<T>
        inputId={inputId}
        options={options}
        value={value}
        onChange={onChange}
        isSearchable={false}
        spacing="compact"
        aria-label={label}
      />
    </FilterField>
  );
};

interface ClearFiltersButtonProps {
  labelId: string;
  isDisabled: boolean;
  onClick: () => void;
}

export const ClearFiltersButton = ({ labelId, isDisabled, onClick }: ClearFiltersButtonProps) => {
  const intl = useIntl();

  return (
    <Box>
      <Box mb={1} fontSize="xs" lineHeight="1.4" visibility="hidden">
        &nbsp;
      </Box>
      <Button appearance="subtle" isDisabled={isDisabled} onClick={onClick}>
        <HStack gap={2}>
          <LuX size={16} />
          <Text>{intl.formatMessage({ id: labelId })}</Text>
        </HStack>
      </Button>
    </Box>
  );
};
