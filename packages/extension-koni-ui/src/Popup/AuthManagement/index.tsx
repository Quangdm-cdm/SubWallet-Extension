// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/handlers/State';
import Header from '@polkadot/extension-koni-ui/partials/Header';

import useTranslation from '../../hooks/useTranslation';
import { getAuthListV2, toggleAuthorization } from '../../messaging';
import { InputFilter } from './../../components';
import WebsiteEntry from './WebsiteEntry';

interface Props extends ThemeProps {
  className?: string;
}

function AuthManagement ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [authList, setAuthList] = useState<AuthUrls | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getAuthListV2()
      .then(({ list }) => setAuthList(list))
      .catch((e) => console.error(e));
  }, []);

  console.log('authList', authList);

  const _onChangeFilter = useCallback((filter: string) => {
    setFilter(filter);
  }, []);

  const toggleAuth = useCallback((url: string) => {
    toggleAuthorization(url)
      .then(({ list }) => setAuthList(list))
      .catch(console.error);
  }, []);

  return (
    <div className={className}>
      <Header
        showBackArrow
        showSubHeader
        smallMargin
        subHeaderName={t<string>('Manage Website Access')}
      >
        <InputFilter
          className='auth-management-input-filter'
          onChange={_onChangeFilter}
          placeholder={t<string>('example.com')}
          value={filter}
          withReset
        />
      </Header>
      <>
        <div className='auth-management__top-action'>
          <div className='auth-management__btn'>
            {t<string>('Forget All')}
          </div>
          <div className='auth-management__btn'>
            {t<string>('Disconnect All')}
          </div>
          <div className='auth-management__btn'>
            {t<string>('Connect All')}
          </div>
        </div>
        <div className='auth-list-wrapper'>
          {
            !authList || !Object.entries(authList)?.length
              ? <div className='empty-list'>{t<string>('No website request yet!')}</div>
              : <>
                <div className='website-list'>
                  {Object.entries(authList)
                    .filter(([url]: [string, AuthUrlInfo]) => url.includes(filter))
                    .map(
                      ([url, info]: [string, AuthUrlInfo]) =>
                        <WebsiteEntry
                          info={info}
                          key={url}
                          toggleAuth={toggleAuth}
                          url={url}
                        />
                    )}
                </div>
              </>
          }
        </div>
      </>
    </div>
  );
}

export default styled(AuthManagement)(({ theme }: Props) => `
  height: calc(100vh - 2px);
  overflow-y: auto;

  .auth-list-wrapper {
    margin: 0 15px;
  }

  .auth-management__top-action {
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px;
  }

  .auth-management-input-filter {
    padding: 0 15px 12px;
  }

  .website-list {
  }

  .empty-list {
    text-align: center;
    padding-top: 10px;
  }

  .auth-management__btn {
    padding-left: 17px;
    position: relative;
    font-size: 14px;
    line-height: 24px;
    color: ${theme.textColor2};
  }

  .auth-management__btn:hover {
    cursor: pointer;
    color: ${theme.buttonTextColor2};
  }

  .auth-management__btn:not(:first-child):before {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${theme.textColor2};
    top: 0;
    bottom: 0;
    left: 7px;
    margin: auto 0;
  }
`);
