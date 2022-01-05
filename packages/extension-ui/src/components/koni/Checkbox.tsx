// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback } from 'react';
import styled from 'styled-components';
import checkmark from "@polkadot/extension-ui/assets/checkmark.svg";

interface Props {
  checked: boolean;
  className?: string;
  label: string;
  onChange?: (checked: boolean) => void;
  onClick?: () => void;
}

function Checkbox ({ checked, className, label, onChange, onClick }: Props): React.ReactElement<Props> {
  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(event.target.checked),
    [onChange]
  );

  const _onClick = useCallback(
    () => onClick && onClick(),
    [onClick]
  );

  return (
    <div className={className}>
      <label>
        {label}
        <input
          checked={checked}
          onChange={_onChange}
          onClick={_onClick}
          type='checkbox'
        />
        <span />
      </label>
    </div>
  );
}

export default styled(Checkbox)(({ theme }: ThemeProps) => `
  margin: ${theme.boxMargin};

  label {
    display: block;
    position: relative;
    cursor: pointer;
    user-select: none;
    padding-left: 24px;
    padding-top: 1px;
    color: ${theme.textColor2};
    font-size: ${theme.fontSize2};
    line-height: ${theme.lineHeight2};
    font-weight: 400;

    & input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    & span {
      position: absolute;
      top: 4px;
      left: 0;
      height: 14px;
      width: 14px;
      border-radius: ${theme.borderRadius};
      background-color: ${theme.checkboxColor};
      border: 1px solid ${theme.checkboxBorderColor};
      border: 1px solid ${theme.checkboxBorderColor};
      &:after {
        content: '';
        display: none;
        width: 11px;
        height: 8px;
        position: absolute;
        left: 1px;
        top: 3px;
        mask: url(${checkmark});
        mask-size: cover;
        background: ${theme.textColor3};
      }
    }

    &:hover input ~ span {
      background-color: ${theme.inputBackground};
    }

    input:checked ~ span:after {
      display: block;
    }
  }
`);
