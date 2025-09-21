
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HeaderLanguageSelector } from './ui/LanguageSelector';
import { useHeaderTranslation } from '../hooks/useTranslation';
import { useServerSession } from '../contexts/ServerSessionContext';

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const { t, loading: translationLoading } = useHeaderTranslation();
  const { sessionData, isAuthenticated } = useServerSession();

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Helper function to check if current path matches menu item
  const isActiveMenuItem = (path: string) => {
    return pathname === path;
  };

  // Helper function to check if dropdown should be highlighted
  const isActiveDropdown = (paths: string[]) => {
    return paths.some(path => pathname === path);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      closeDropdown();

      // Call logout API directly
      await fetch('/api/sso/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      // Navigate to homepage after logout completes
      router.push('/');
    } catch (error) {
      // Fallback to page refresh if logout fails
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" ref={headerRef}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-file-text-line text-white text-lg"></i>
            </div>
            {translationLoading ? (
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            ) : (
              <span className="text-xl font-bold text-gray-900">{t('brandName')}</span>
            )}
          </Link>

          <nav className="flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => toggleDropdown('rules')}
                className={`flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  isActiveDropdown(['/rule-engines', '/tax-rules', '/invoice-rules', '/audited-rules', '/rule-groups'])
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {translationLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <span>{t('menu.rulesEngine.title')}</span>
                )}
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {activeDropdown === 'rules' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {translationLoading ? (
                    <>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-26 animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/rule-engines"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/rule-engines')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.rulesEngine.overview')}
                      </Link>
                      <Link
                        href="/tax-rules"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/tax-rules')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.rulesEngine.taxRules')}
                      </Link>
                      <Link
                        href="/invoice-rules"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/invoice-rules')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.rulesEngine.invoiceRules')}
                      </Link>
                      <Link
                        href="/audited-rules"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/audited-rules')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.rulesEngine.auditedRules')}
                      </Link>
                      <Link
                        href="/rule-groups"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/rule-groups')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.rulesEngine.ruleGroups')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown('subscription')}
                className={`flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  isActiveDropdown(['/subscriptions', '/subscription-settings'])
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {translationLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
                ) : (
                  <span>{t('menu.corporateSubscription.title')}</span>
                )}
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {activeDropdown === 'subscription' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {translationLoading ? (
                    <>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/subscriptions"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/subscriptions')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.corporateSubscription.management')}
                      </Link>
                      <Link
                        href="/subscription-settings"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/subscription-settings')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.corporateSubscription.settings')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown('invoice')}
                className={`flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  isActiveDropdown(['/invoice-requests', '/invoice-results'])
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {translationLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-26 animate-pulse"></div>
                ) : (
                  <span>{t('menu.invoiceManagement.title')}</span>
                )}
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {activeDropdown === 'invoice' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {translationLoading ? (
                    <>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/invoice-requests"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/invoice-requests')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.invoiceManagement.requests')}
                      </Link>
                      <Link
                        href="/invoice-results"
                        onClick={closeDropdown}
                        className={`block px-4 py-2 cursor-pointer ${
                          isActiveMenuItem('/invoice-results')
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('menu.invoiceManagement.results')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown('po')}
                className={`flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  isActiveDropdown(['/audited-requests'])
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {translationLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                ) : (
                  <span>{t('menu.poManagement.title')}</span>
                )}
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {activeDropdown === 'po' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {translationLoading ? (
                    <div className="px-4 py-2">
                      <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                    </div>
                  ) : (
                    <Link
                      href="/audited-requests"
                      onClick={closeDropdown}
                      className={`block px-4 py-2 cursor-pointer ${
                        isActiveMenuItem('/audited-requests')
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t('menu.poManagement.auditedRequests')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/release-center"
              className={`cursor-pointer whitespace-nowrap ${
                isActiveMenuItem('/release-center')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {translationLoading ? (
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              ) : (
                t('menu.releaseCenter')
              )}
            </Link>

            <a
              href="http://120.77.56.227/projects/46/data?tab=43"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer whitespace-nowrap text-gray-700 hover:text-blue-600"
            >
              {translationLoading ? (
                <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
              ) : (
                t('menu.piaozoneStudio')
              )}
            </a>

            <div className="flex items-center space-x-4 ml-8">
              <HeaderLanguageSelector />
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-notification-3-line text-gray-600 text-lg cursor-pointer hover:text-blue-600"></i>
              </div>

              {/* User Account Section */}
              <div className="relative">
                {isAuthenticated && sessionData ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown('user')}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                      title={`${sessionData.user.displayName} (${sessionData.user.domain || 'Unknown Domain'})`}
                    >
                      <i className="ri-user-line text-white text-sm"></i>
                    </button>
                    {activeDropdown === 'user' && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <i className="ri-user-line text-white text-base"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {sessionData.user.displayName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {sessionData.user.username}
                              </p>
                              {sessionData.user.email && (
                                <p className="text-xs text-gray-500 truncate">
                                  {sessionData.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {sessionData.user.domain && (
                            <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                              <i className="ri-global-line mr-1"></i>
                              {sessionData.user.domain}
                            </div>
                          )}
                        </div>

                        {/* Account Actions */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              closeDropdown();
                              // Could add profile settings here
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <i className="ri-settings-3-line mr-2"></i>
                            Account Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <i className="ri-logout-box-line mr-2"></i>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center cursor-pointer">
                    <i className="ri-user-line text-white text-sm"></i>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}