import { Button, Clipboard, Dialog, HStack, IconButton, Portal, Text, VStack } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';

export interface ResetPasswordTarget {
  username: string;
  password: string;
}

interface ResetPasswordDialogProps {
  target: ResetPasswordTarget | null;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ target, onClose }: ResetPasswordDialogProps) => {
  const intl = useIntl();

  return (
    <Dialog.Root open={target !== null} onOpenChange={details => { if (!details.open) onClose(); }}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                <FormattedMessage id="admin.users.resetPasswordSuccess" values={{ username: target?.username }} />
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={3}>
                <Text color="fg.subtle">
                  <FormattedMessage id="admin.users.temporaryPassword" />
                </Text>
                <Clipboard.Root value={target?.password ?? ''}>
                  <HStack>
                    <Clipboard.Input fontFamily="mono" />
                    <Clipboard.Trigger asChild>
                      <IconButton aria-label={intl.formatMessage({ id: 'admin.users.copyPassword' })} variant="outline">
                        <Clipboard.Indicator copied={<LuCheck />}>
                          <LuCopy />
                        </Clipboard.Indicator>
                      </IconButton>
                    </Clipboard.Trigger>
                  </HStack>
                </Clipboard.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="solid" colorPalette="brand">
                  <FormattedMessage id="admin.users.done" />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
