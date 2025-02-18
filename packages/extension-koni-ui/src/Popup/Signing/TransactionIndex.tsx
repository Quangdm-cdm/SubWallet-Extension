// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback } from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  index: number;
  totalItems: number;
  onNextClick: () => void;
  onPreviousClick: () => void;
  name: string;
}

function TransactionIndex ({ className, index, name, onNextClick, onPreviousClick, totalItems }: Props): React.ReactElement<Props> {
  const previousClickActive = index !== 0;
  const nextClickActive = index < totalItems - 1;

  const prevClick = useCallback(
    (): void => {
      previousClickActive && onPreviousClick();
    },
    [onPreviousClick, previousClickActive]
  );

  const nextClick = useCallback(
    (): void => {
      nextClickActive && onNextClick();
    },
    [nextClickActive, onNextClick]
  );

  return (
    <div className={className}>
      <div className='transaction-index-wrapper'>
        <div className='step-arrow-left'>
          <FontAwesomeIcon
            className={`arrowLeft ${previousClickActive ? 'active' : ''}`}
            // @ts-ignore
            icon={faArrowLeft}
            onClick={prevClick}
            size='sm'
          />
        </div>

        <div>
          <span>{name}</span>
          <span className='currentStep'>{index + 1}</span>
          <span className='totalSteps'>/{totalItems}</span>
        </div>

        <div className='step-arrow-right'>
          <FontAwesomeIcon
            className={`stepArrow arrowRight ${nextClickActive ? 'active' : ''}`}
            // @ts-ignore
            icon={faArrowRight}
            onClick={nextClick}
            size='sm'
          />
        </div>
      </div>
    </div>
  );
}

export default styled(TransactionIndex)(({ theme }: ThemeProps) => `
  .arrowLeft, .arrowRight {
    display: inline-block;
    color: ${theme.iconNeutralColor};

    &.active {
      color: ${theme.primaryColor};
      cursor: pointer;
    }
  }

  .step-arrow-left {
    display: flex;
    flex: 1;
    justify-content: flex-start;
  }

  .step-arrow-right {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  .currentStep {
    color: ${theme.primaryColor};
    font-size: ${theme.labelFontSize};
    line-height: ${theme.labelLineHeight};
    margin-left: 10px;
  }

  .totalSteps {
    font-size: ${theme.labelFontSize};
    line-height: ${theme.labelLineHeight};
    color: ${theme.textColor};
  }

  .transaction-index-wrapper {
    display: flex;
    align-items: center;
    padding: 12px 15px;
  }
`);
