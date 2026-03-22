import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface SectionHeaderProps {
  title: string;
  count?: number;
  countUnit?: string;
}

export function SectionHeader({ title, count, countUnit = '개' }: SectionHeaderProps) {
  return (
    <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
      <Text typography="t5" fontWeight="bold" color={colors.grey900}>
        {title}
      </Text>
      {count != null && count > 0 && (
        <Text typography="t7" fontWeight="medium" color={colors.grey500}>
          {count}{countUnit}
        </Text>
      )}
    </div>
  );
}
