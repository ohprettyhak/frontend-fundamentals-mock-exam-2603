import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface MessageBannerProps {
  type: 'success' | 'error';
  message: string;
}

export function MessageBanner({ type, message }: MessageBannerProps) {
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      css={css`
        padding: 10px 14px; border-radius: 10px;
        background: ${isSuccess ? colors.blue50 : colors.red50};
        display: flex; align-items: center; gap: 8px;
      `}
    >
      <Text
        typography="t7"
        fontWeight="medium"
        color={isSuccess ? colors.blue600 : colors.red500}
      >
        {message}
      </Text>
    </div>
  );
}
